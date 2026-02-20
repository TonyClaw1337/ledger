"""Configuration for tc_auth OAuth 2.0 client."""

from dataclasses import dataclass, field
import secrets


@dataclass
class TcAuthConfig:
    client_id: str
    client_secret: str
    redirect_uri: str
    identity_url: str = "https://localhost:9100"
    session_secret: str = ""
    cookie_name: str = "tc_app_session"
    cookie_max_age: int = 7776000  # 90 days — match IDENTITY session lifetime
    cookie_secure: bool = True
    cookie_samesite: str = "lax"
    public_paths: list[str] = field(default_factory=lambda: ["/health", "/api/version"])
    scopes: str = "openid profile"

    def __post_init__(self) -> None:
        self.identity_url = self.identity_url.rstrip("/")
        if not self.session_secret:
            self.session_secret = secrets.token_urlsafe(32)
