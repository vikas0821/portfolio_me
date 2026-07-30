"""Admin CRUD — the single site-settings document (accent color, SEO, section
copy, footer). Split out of routers/admin.py."""
from fastapi import APIRouter, Depends, Body
from ...database import update_by_id
from ...auth import require_role
from ...defaults import get_or_create_settings
from ... import serializers as S

router = APIRouter(tags=["admin"])
admin_only = Depends(require_role("admin"))


@router.get("/settings", dependencies=[admin_only])
def get_settings():
    return S.ok(S.settings(get_or_create_settings()))


@router.put("/settings", dependencies=[admin_only])
def update_settings(data: dict = Body(...)):
    s = get_or_create_settings()
    changes = {}
    if "accentColor" in data:
        changes["accent_color"] = data["accentColor"]
    for f in ("seo", "hero", "sections", "footer"):
        if f in data and isinstance(data[f], dict):
            changes[f] = {**(getattr(s, f) or {}), **data[f]}
    s = update_by_id("site_settings", s.id, changes) if changes else s
    return S.ok(S.settings(s))
