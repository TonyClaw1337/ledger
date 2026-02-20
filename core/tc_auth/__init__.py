"""tc_auth — Drop-in OAuth 2.0 client for FastAPI apps in the Tony Claw platform."""

from .middleware import TcAuth, get_current_user
from .models import TcUser, TcTokens, TcSession
from .config import TcAuthConfig
from .client import OAuthClient

# require_auth is accessed via TcAuth instance: auth.require_auth(role="admin")
# get_current_user is a standalone Depends()-compatible function

__all__ = [
    "TcAuth",
    "get_current_user",
    "TcUser",
    "TcTokens",
    "TcSession",
    "TcAuthConfig",
    "OAuthClient",
]
