"""Private notes workspace — mirrors the old /api/v1/notes contract (role: notes)."""
from datetime import datetime
from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from ..database import db, find, insert, get_by_id, update_by_id, delete_by_id, count, oid
from ..auth import login as do_login, require_role
from .. import serializers as S

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])
notes_only = Depends(require_role("notes"))


class LoginIn(BaseModel):
    password: str


@router.post("/login")
def notes_login(body: LoginIn):
    return {"responseCode": "00", "token": do_login("notes", body.password)}


# ── Sections ──────────────────────────────────────────────────────────────
@router.get("/sections", dependencies=[notes_only])
def list_sections():
    return S.ok([S.note_section(s) for s in find("note_sections", sort=[("order", 1), ("created_at", 1)])])


@router.post("/sections", dependencies=[notes_only])
def create_section(data: dict = Body(...)):
    s = insert("note_sections", {"title": data.get("title", ""), "order": data.get("order", count("note_sections"))})
    return S.ok(S.note_section(s))


@router.put("/sections/{sid}", dependencies=[notes_only])
def update_section(sid: str, data: dict = Body(...)):
    changes = {}
    if "title" in data:
        changes["title"] = data["title"]
    if "order" in data:
        changes["order"] = data["order"]
    s = update_by_id("note_sections", sid, changes) if changes else get_by_id("note_sections", sid)
    if not s:
        return S.fail("Not found")
    return S.ok(S.note_section(s))


@router.delete("/sections/{sid}", dependencies=[notes_only])
def delete_section(sid: str):
    db.notes.delete_many({"section_id": oid(sid)})
    delete_by_id("note_sections", sid)
    return S.ok({"id": sid})


# ── Notes ──────────────────────────────────────────────────────────────────
@router.get("/sections/{sid}/notes", dependencies=[notes_only])
def list_notes(sid: str):
    rows = find("notes", {"section_id": oid(sid)}, sort=[("order", 1), ("created_at", 1)])
    return S.ok([S.note(n) for n in rows])


@router.post("/notes", dependencies=[notes_only])
def create_note(data: dict = Body(...)):
    sid = oid(data["sectionId"])
    n = insert("notes", {
        "section_id": sid, "title": data.get("title", ""), "content": data.get("content", ""),
        "order": count("notes", {"section_id": sid}), "updated_at": datetime.utcnow(),
    })
    return S.ok(S.note(n))


@router.put("/notes/{nid}", dependencies=[notes_only])
def update_note(nid: str, data: dict = Body(...)):
    changes = {"updated_at": datetime.utcnow()}
    if "title" in data:
        changes["title"] = data["title"]
    if "content" in data:
        changes["content"] = data["content"]
    n = update_by_id("notes", nid, changes)
    if not n:
        return S.fail("Not found")
    return S.ok(S.note(n))


@router.delete("/notes/{nid}", dependencies=[notes_only])
def delete_note(nid: str):
    delete_by_id("notes", nid)
    return S.ok({"id": nid})
