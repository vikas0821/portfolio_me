"""Password gates for the embedded apps (Resume Builder, Option Analyzer)."""
from fastapi import APIRouter
from pydantic import BaseModel
from ..auth import login as do_login

router = APIRouter(prefix="/api/v1/apps", tags=["apps"])


class LoginIn(BaseModel):
    password: str


@router.post("/option/login")
def option_login(body: LoginIn):
    return {"responseCode": "00", "token": do_login("option", body.password)}


@router.post("/resume/login")
def resume_login(body: LoginIn):
    # In the unified backend the resume API uses the same role token (no external auto-login).
    token = do_login("resume", body.password)
    return {"responseCode": "00", "token": token, "resumeToken": token}
