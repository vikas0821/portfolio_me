"""Admin CRUD — contact-form messages. Split out of routers/admin.py."""
from fastapi import APIRouter, Depends
from pymongo import DESCENDING
from ...database import find, update_by_id, delete_by_id
from ...auth import require_role
from ... import serializers as S

router = APIRouter(tags=["admin"])
admin_only = Depends(require_role("admin"))


@router.get("/messages", dependencies=[admin_only])
def list_messages():
    return S.ok([S.message(m) for m in find("contact_messages", sort=[("created_at", DESCENDING)])])


@router.delete("/messages/{mid}", dependencies=[admin_only])
def delete_message(mid: str):
    delete_by_id("contact_messages", mid)
    return S.ok({"id": mid})


@router.patch("/messages/{mid}/read", dependencies=[admin_only])
def mark_read(mid: str):
    update_by_id("contact_messages", mid, {"read": True})
    return S.ok({"id": mid})
