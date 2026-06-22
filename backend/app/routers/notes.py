"""Private notes workspace — mirrors the old /api/v1/notes contract (role: notes)."""
from datetime import datetime
from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from sqlmodel import Session, select, desc
from ..database import get_session
from ..auth import login as do_login, require_role
from ..models import NoteSection, Note
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
def list_sections(session: Session = Depends(get_session)):
    rows = session.exec(select(NoteSection).order_by(NoteSection.order, NoteSection.created_at)).all()
    return S.ok([S.note_section(s) for s in rows])


@router.post("/sections", dependencies=[notes_only])
def create_section(data: dict = Body(...), session: Session = Depends(get_session)):
    count = len(session.exec(select(NoteSection)).all())
    s = NoteSection(title=data.get("title", ""), order=data.get("order", count))
    session.add(s); session.commit(); session.refresh(s)
    return S.ok(S.note_section(s))


@router.put("/sections/{sid}", dependencies=[notes_only])
def update_section(sid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    s = session.get(NoteSection, sid)
    if not s:
        return S.fail("Not found")
    s.title = data.get("title", s.title)
    if "order" in data:
        s.order = data["order"]
    session.add(s); session.commit(); session.refresh(s)
    return S.ok(S.note_section(s))


@router.delete("/sections/{sid}", dependencies=[notes_only])
def delete_section(sid: int, session: Session = Depends(get_session)):
    for n in session.exec(select(Note).where(Note.section_id == sid)).all():
        session.delete(n)
    s = session.get(NoteSection, sid)
    if s:
        session.delete(s)
    session.commit()
    return S.ok({"id": sid})


# ── Notes ──────────────────────────────────────────────────────────────────
@router.get("/sections/{sid}/notes", dependencies=[notes_only])
def list_notes(sid: int, session: Session = Depends(get_session)):
    rows = session.exec(select(Note).where(Note.section_id == sid).order_by(Note.order, Note.created_at)).all()
    return S.ok([S.note(n) for n in rows])


@router.post("/notes", dependencies=[notes_only])
def create_note(data: dict = Body(...), session: Session = Depends(get_session)):
    sid = int(data["sectionId"])
    count = len(session.exec(select(Note).where(Note.section_id == sid)).all())
    n = Note(section_id=sid, title=data.get("title", ""), content=data.get("content", ""), order=count)
    session.add(n); session.commit(); session.refresh(n)
    return S.ok(S.note(n))


@router.put("/notes/{nid}", dependencies=[notes_only])
def update_note(nid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    n = session.get(Note, nid)
    if not n:
        return S.fail("Not found")
    n.title = data.get("title", n.title)
    n.content = data.get("content", n.content)
    n.updated_at = datetime.utcnow()
    session.add(n); session.commit(); session.refresh(n)
    return S.ok(S.note(n))


@router.delete("/notes/{nid}", dependencies=[notes_only])
def delete_note(nid: int, session: Session = Depends(get_session)):
    n = session.get(Note, nid)
    if n:
        session.delete(n); session.commit()
    return S.ok({"id": nid})
