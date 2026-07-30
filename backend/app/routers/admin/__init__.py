"""Admin API (role: admin) — mirrors the old /api/v1/admin contract (camelCase
fields). Split by sub-domain: content.py (profile/skills/projects/experience/
education/certifications), blog.py, site_settings.py, messages.py — each a
thin CRUD layer over the repository helpers in ..database.

`router` is what the rest of the app imports (main.py does
`app.include_router(admin.router)`), so this split is invisible to callers."""
from fastapi import APIRouter
from pydantic import BaseModel
from ...auth import login as do_login
from . import content, blog, site_settings, messages

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class LoginIn(BaseModel):
    password: str


@router.post("/login")
def admin_login(body: LoginIn):
    return {"responseCode": "00", "token": do_login("admin", body.password)}


router.include_router(content.router)
router.include_router(blog.router)
router.include_router(site_settings.router)
router.include_router(messages.router)
