"""Pydantic models for tc_auth."""

from typing import Optional
from pydantic import BaseModel


class TcUser(BaseModel):
    sub: str
    username: str
    role: str = "user"
    email: Optional[str] = None
    scope: str = ""


class TcTokens(BaseModel):
    access_token: str
    refresh_token: str
    id_token: Optional[str] = None
    expires_at: int  # unix timestamp


class TcSession(BaseModel):
    tokens: TcTokens
    user: TcUser
