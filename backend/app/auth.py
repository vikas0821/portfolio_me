"""JWT auth with per-section roles (admin / notes / resume / option)."""
import time
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

_bearer = HTTPBearer(auto_error=False)


def create_token(role: str) -> str:
    payload = {"role": role, "exp": int(time.time()) + 12 * 3600}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def login(role: str, password: str) -> str:
    expected = settings.password_for(role)
    if not expected or password != expected:
        raise HTTPException(status_code=401, detail="Invalid password")
    return create_token(role)


def require_role(role: str):
    def dependency(cred: HTTPAuthorizationCredentials = Depends(_bearer)):
        if cred is None:
            raise HTTPException(status_code=401, detail="Authentication required")
        try:
            data = jwt.decode(cred.credentials, settings.jwt_secret, algorithms=["HS256"])
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        if data.get("role") != role:
            raise HTTPException(status_code=401, detail="Insufficient permissions")
        return data
    return dependency
