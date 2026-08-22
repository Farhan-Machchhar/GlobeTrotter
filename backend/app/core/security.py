"""
Security utilities for GlobeTrotter.
Uses bcrypt directly (passlib has a known bug with bcrypt >= 4.x).
JWT handled via python-jose.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

logger = logging.getLogger("globetrotter.security")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception as e:
        logger.warning(f"Password verification error: {e}")
        return False


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        user_id: The user's UUID string.
        expires_delta: Optional custom expiration. Defaults to settings value.

    Returns:
        Signed JWT string.
    """
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": user_id, "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and validate a JWT token.

    Args:
        token: The JWT string.

    Returns:
        The user_id (sub claim) if valid, None otherwise.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        return user_id
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None
