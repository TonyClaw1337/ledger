"""OAuth 2.0 client: PKCE, token exchange, JWKS validation, discovery."""

import asyncio
import base64
import hashlib
import json
import secrets
import time
from typing import Any, Optional

import httpx
from jose import jwt, JWTError
from itsdangerous import URLSafeTimedSerializer, BadSignature

from .config import TcAuthConfig
from .models import TcUser, TcTokens, TcSession


class OAuthClient:
    """Handles all OAuth 2.0 operations including PKCE, token exchange, and JWKS validation."""

    def __init__(self, config: TcAuthConfig) -> None:
        self.config = config
        self._signer = URLSafeTimedSerializer(config.session_secret)
        self._jwks: dict[str, Any] = {}
        self._jwks_fetched_at: float = 0
        self._jwks_lock = asyncio.Lock()
        self._discovery: dict[str, str] = {}
        self._discovery_lock = asyncio.Lock()
        self._http: Optional[httpx.AsyncClient] = None

    @property
    def http(self) -> httpx.AsyncClient:
        if self._http is None or self._http.is_closed:
            self._http = httpx.AsyncClient(verify=False, timeout=10.0)
        return self._http

    async def close(self) -> None:
        if self._http and not self._http.is_closed:
            await self._http.aclose()

    # --- Discovery ---

    async def discover(self) -> dict[str, str]:
        if self._discovery:
            return self._discovery
        async with self._discovery_lock:
            if self._discovery:
                return self._discovery
            r = await self.http.get(f"{self.config.identity_url}/.well-known/openid-configuration")
            r.raise_for_status()
            self._discovery = r.json()
            return self._discovery

    async def _endpoint(self, key: str) -> str:
        d = await self.discover()
        url = d[key]
        # For backend-to-backend calls (token, userinfo, introspect, revoke),
        # replace the external issuer URL with the internal Docker URL
        # to avoid routing through Tailscale/Caddy
        if key != "authorization_endpoint":
            issuer = d.get("issuer", "")
            if issuer and self.config.identity_url:
                url = url.replace(issuer, self.config.identity_url)
        return url

    # --- PKCE ---

    @staticmethod
    def generate_pkce() -> tuple[str, str]:
        verifier = secrets.token_urlsafe(64)
        digest = hashlib.sha256(verifier.encode()).digest()
        challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
        return verifier, challenge

    # --- Auth URLs ---

    async def login_url(self, state: str, code_challenge: str) -> str:
        auth_ep = await self._endpoint("authorization_endpoint")
        params = {
            "response_type": "code",
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "scope": self.config.scopes,
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        qs = "&".join(f"{k}={httpx.QueryParams({k: v})}" for k, v in params.items())
        # Build properly
        from urllib.parse import urlencode
        return f"{auth_ep}?{urlencode(params)}"

    # --- Token Exchange ---

    async def exchange_code(self, code: str, code_verifier: str) -> TcTokens:
        token_ep = await self._endpoint("token_endpoint")
        r = await self.http.post(token_ep, data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.config.redirect_uri,
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
            "code_verifier": code_verifier,
        })
        r.raise_for_status()
        data = r.json()
        expires_at = int(time.time()) + data.get("expires_in", 3600)
        return TcTokens(
            access_token=data["access_token"],
            refresh_token=data["refresh_token"],
            id_token=data.get("id_token"),
            expires_at=expires_at,
        )

    async def refresh_tokens(self, refresh_token: str) -> TcTokens:
        token_ep = await self._endpoint("token_endpoint")
        r = await self.http.post(token_ep, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
        })
        r.raise_for_status()
        data = r.json()
        expires_at = int(time.time()) + data.get("expires_in", 3600)
        return TcTokens(
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token", refresh_token),
            id_token=data.get("id_token"),
            expires_at=expires_at,
        )

    async def revoke_token(self, token: str) -> None:
        try:
            revoke_ep = await self._endpoint("revocation_endpoint")
        except KeyError:
            revoke_ep = f"{self.config.identity_url}/oauth/revoke"
        try:
            await self.http.post(revoke_ep, data={
                "token": token,
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
            })
        except Exception:
            pass  # Best effort

    # --- JWKS ---

    async def _fetch_jwks(self) -> None:
        try:
            jwks_uri = await self._endpoint("jwks_uri")
        except KeyError:
            jwks_uri = f"{self.config.identity_url}/oauth/jwks"
        r = await self.http.get(jwks_uri)
        r.raise_for_status()
        data = r.json()
        self._jwks = {k["kid"]: k for k in data.get("keys", [])}
        self._jwks_fetched_at = time.time()

    async def get_jwk(self, kid: str) -> dict[str, Any]:
        # Return cached if fresh
        if kid in self._jwks and (time.time() - self._jwks_fetched_at) < 3600:
            return self._jwks[kid]
        # Refresh
        async with self._jwks_lock:
            if kid in self._jwks and (time.time() - self._jwks_fetched_at) < 3600:
                return self._jwks[kid]
            await self._fetch_jwks()
        if kid not in self._jwks:
            raise ValueError(f"Unknown kid: {kid}")
        return self._jwks[kid]

    async def validate_token(self, token: str) -> dict[str, Any]:
        """Validate access token using cached JWKS. Returns claims."""
        headers = jwt.get_unverified_headers(token)
        kid = headers.get("kid", "")
        key = await self.get_jwk(kid)
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return claims

    # --- User Info ---

    async def get_userinfo(self, access_token: str) -> TcUser:
        try:
            userinfo_ep = await self._endpoint("userinfo_endpoint")
        except KeyError:
            userinfo_ep = f"{self.config.identity_url}/oauth/userinfo"
        r = await self.http.get(userinfo_ep, headers={"Authorization": f"Bearer {access_token}"})
        r.raise_for_status()
        data = r.json()
        return TcUser(
            sub=data.get("sub", ""),
            username=data.get("username", data.get("preferred_username", "")),
            role=data.get("role", "user"),
            email=data.get("email"),
            scope=data.get("scope", ""),
        )

    def user_from_claims(self, claims: dict[str, Any]) -> TcUser:
        return TcUser(
            sub=claims.get("sub", ""),
            username=claims.get("username", claims.get("preferred_username", "")),
            role=claims.get("role", "user"),
            email=claims.get("email"),
            scope=claims.get("scope", ""),
        )

    # --- Session Cookie ---

    def encode_session(self, session: TcSession) -> str:
        return self._signer.dumps(session.model_dump())

    def decode_session(self, cookie: str) -> Optional[TcSession]:
        try:
            data = self._signer.loads(cookie, max_age=self.config.cookie_max_age)
            return TcSession(**data)
        except (BadSignature, Exception):
            return None
