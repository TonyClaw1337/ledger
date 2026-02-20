"""FastAPI middleware and dependencies for tc_auth."""

import secrets
import time
from typing import Any, Callable, Optional

from fastapi import FastAPI, Request, Response, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .client import OAuthClient
from .config import TcAuthConfig
from .models import TcUser, TcSession


def _wants_json(request: Request) -> bool:
    accept = request.headers.get("accept", "")
    return "application/json" in accept or request.url.path.startswith("/api/")


class TcAuth:
    """Drop-in OAuth 2.0 integration for FastAPI apps."""

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        identity_url: str = "https://localhost:9100",
        session_secret: str = "",
        **kwargs: Any,
    ) -> None:
        self.config = TcAuthConfig(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            identity_url=identity_url,
            session_secret=session_secret,
            **kwargs,
        )
        self.oauth = OAuthClient(self.config)

    def setup(self, app: FastAPI, public_paths: Optional[list[str]] = None) -> None:
        """Register auth routes and middleware on the FastAPI app."""
        if public_paths:
            self.config.public_paths = list(set(self.config.public_paths + public_paths))

        # Store reference on app state
        app.state.tc_auth = self

        # Register routes
        @app.get("/auth/login")
        async def auth_login(request: Request, next: str = "/") -> Response:
            verifier, challenge = OAuthClient.generate_pkce()
            state = secrets.token_urlsafe(32)
            url = await self.oauth.login_url(state, challenge)
            # Store verifier + state in a temp cookie
            resp = RedirectResponse(url, status_code=302)
            state_data = self.oauth._signer.dumps({"verifier": verifier, "state": state, "next": next})
            resp.set_cookie(
                "tc_pkce", state_data,
                httponly=True, secure=self.config.cookie_secure,
                samesite=self.config.cookie_samesite, max_age=600,
                path="/",
            )
            return resp

        @app.get("/auth/callback")
        async def auth_callback(request: Request, code: str = "", state: str = "", error: str = "") -> Response:
            if error:
                return JSONResponse({"error": error}, status_code=400)

            pkce_cookie = request.cookies.get("tc_pkce")
            if not pkce_cookie:
                # Stale callback — restart login flow
                resp = RedirectResponse("/auth/login", status_code=302)
                return resp

            try:
                pkce_data = self.oauth._signer.loads(pkce_cookie, max_age=600)
                if pkce_data["state"] != state:
                    raise ValueError("state mismatch")
            except Exception:
                # State mismatch or expired — restart login flow
                resp = RedirectResponse("/auth/login", status_code=302)
                resp.delete_cookie("tc_pkce", path="/")
                return resp

            tokens = await self.oauth.exchange_code(code, pkce_data["verifier"])

            # Get user info from token claims or userinfo endpoint
            try:
                claims = await self.oauth.validate_token(tokens.access_token)
                user = self.oauth.user_from_claims(claims)
            except Exception:
                user = await self.oauth.get_userinfo(tokens.access_token)

            session = TcSession(tokens=tokens, user=user)
            resp = RedirectResponse(pkce_data.get("next", "/"), status_code=302)
            resp.set_cookie(
                self.config.cookie_name,
                self.oauth.encode_session(session),
                httponly=True, secure=self.config.cookie_secure,
                samesite=self.config.cookie_samesite,
                max_age=self.config.cookie_max_age,
            )
            resp.delete_cookie("tc_pkce")
            return resp

        @app.get("/auth/logout")
        async def auth_logout(request: Request) -> Response:
            cookie = request.cookies.get(self.config.cookie_name)
            if cookie:
                session = self.oauth.decode_session(cookie)
                if session:
                    await self.oauth.revoke_token(session.tokens.access_token)
            resp = RedirectResponse("/", status_code=302)
            resp.delete_cookie(self.config.cookie_name)
            return resp

        # Shutdown
        @app.on_event("shutdown")
        async def _shutdown() -> None:
            await self.oauth.close()

        # Add middleware
        app.add_middleware(_TcAuthMiddleware, tc_auth=self)

    async def get_session(self, request: Request) -> Optional[TcSession]:
        """Extract and validate session from request. Auto-refreshes if needed."""
        cookie = request.cookies.get(self.config.cookie_name)
        if not cookie:
            return None

        session = self.oauth.decode_session(cookie)
        if not session:
            return None

        # Check if access token is still valid
        if session.tokens.expires_at > time.time() + 30:
            # Still valid, verify signature
            try:
                await self.oauth.validate_token(session.tokens.access_token)
                return session
            except Exception:
                pass

        # Try refresh
        try:
            new_tokens = await self.oauth.refresh_tokens(session.tokens.refresh_token)
            try:
                claims = await self.oauth.validate_token(new_tokens.access_token)
                user = self.oauth.user_from_claims(claims)
            except Exception:
                user = session.user
            new_session = TcSession(tokens=new_tokens, user=user)
            # Store on request so middleware can update cookie
            request.state.tc_new_session = new_session
            return new_session
        except Exception:
            return None

    @property
    def require_auth(self) -> Callable:
        """Dependency that requires authentication."""
        return _require_auth_factory(self)


class _TcAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Any, tc_auth: TcAuth) -> None:
        super().__init__(app)
        self.tc_auth = tc_auth

    async def dispatch(self, request: Request, call_next: Any) -> Response:
        path = request.url.path

        # Skip auth routes and public paths
        if path.startswith("/auth/") or path in self.tc_auth.config.public_paths:
            return await call_next(request)

        # --- SSO Ticket handling (for iframe authentication) ---
        sso_ticket = request.query_params.get("_sso")
        if sso_ticket:
            existing_session = await self.tc_auth.get_session(request)
            if not existing_session:
                try:
                    import httpx as _httpx
                    async with _httpx.AsyncClient(verify=False, timeout=5.0) as client:
                        resp = await client.post(
                            f"{self.tc_auth.config.identity_url}/api/sso/validate",
                            json={"ticket": sso_ticket},
                        )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("valid"):
                            user_info = data["user"]
                            # Create a local session (same as after OAuth callback)
                            from .models import TcTokens, TcSession as _TcSession
                            # Create a synthetic session with a placeholder token
                            # The user is authenticated via SSO ticket, so we create a minimal session
                            sso_user = TcUser(
                                sub=user_info["sub"],
                                username=user_info["username"],
                                role=user_info.get("role", "user"),
                                email=user_info.get("email"),
                                scope="openid profile",
                            )
                            import time as _time
                            sso_tokens = TcTokens(
                                access_token="sso-ticket-auth",
                                refresh_token="sso-ticket-auth",
                                expires_at=int(_time.time()) + 86400,
                            )
                            sso_session = _TcSession(tokens=sso_tokens, user=sso_user)
                            # Build redirect URL without _sso param
                            from urllib.parse import urlencode, parse_qs, urlparse, urlunparse
                            parsed = urlparse(str(request.url))
                            params = parse_qs(parsed.query, keep_blank_values=True)
                            params.pop("_sso", None)
                            new_query = urlencode(params, doseq=True)
                            clean_url = urlunparse(parsed._replace(query=new_query))
                            resp = RedirectResponse(clean_url, status_code=302)
                            resp.set_cookie(
                                self.tc_auth.config.cookie_name,
                                self.tc_auth.oauth.encode_session(sso_session),
                                httponly=True,
                                secure=self.tc_auth.config.cookie_secure,
                                samesite=self.tc_auth.config.cookie_samesite,
                                max_age=self.tc_auth.config.cookie_max_age,
                            )
                            return resp
                except Exception:
                    pass  # SSO failed, continue normal flow

        session = await self.tc_auth.get_session(request)
        if session:
            request.state.tc_user = session.user
            request.state.tc_session = session

        response = await call_next(request)

        # Update cookie if session was refreshed
        if hasattr(request.state, "tc_new_session"):
            response.set_cookie(
                self.tc_auth.config.cookie_name,
                self.tc_auth.oauth.encode_session(request.state.tc_new_session),
                httponly=True,
                secure=self.tc_auth.config.cookie_secure,
                samesite=self.tc_auth.config.cookie_samesite,
                max_age=self.tc_auth.config.cookie_max_age,
            )

        return response


def _require_auth_factory(tc_auth: TcAuth) -> Callable:
    def require_auth(role: Optional[str] = None) -> Callable:
        async def dependency(request: Request) -> TcUser:
            session = await tc_auth.get_session(request)
            if not session:
                if _wants_json(request):
                    raise HTTPException(status_code=401, detail="Not authenticated")
                raise HTTPException(
                    status_code=307,
                    headers={"Location": f"/auth/login?next={request.url.path}"},
                )
            if role and session.user.role != role:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            request.state.tc_user = session.user
            return session.user
        return Depends(dependency)
    return require_auth


async def get_current_user(request: Request) -> TcUser:
    """FastAPI dependency to get the current authenticated user."""
    if hasattr(request.state, "tc_user") and request.state.tc_user:
        return request.state.tc_user

    tc_auth: Optional[TcAuth] = getattr(request.app.state, "tc_auth", None)
    if not tc_auth:
        raise HTTPException(status_code=500, detail="tc_auth not configured")

    session = await tc_auth.get_session(request)
    if not session:
        if _wants_json(request):
            raise HTTPException(status_code=401, detail="Not authenticated")
        raise HTTPException(
            status_code=307,
            headers={"Location": f"/auth/login?next={request.url.path}"},
        )
    return session.user
