"""Per-section login — returns a JWT scoped to that section's role."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..auth import login

router = APIRouter(prefix="/api/auth", tags=["auth"])

ROLES = {"admin", "notes", "resume", "option"}


class LoginIn(BaseModel):
    password: str


@router.post("/{role}/login")
def section_login(role: str, body: LoginIn):
    if role not in ROLES:
        raise HTTPException(status_code=404, detail="Unknown section")
    return {"token": login(role, body.password), "role": role}
