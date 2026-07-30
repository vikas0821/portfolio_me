"""Admin CRUD — markdown blog posts. Split out of routers/admin.py."""
import re
from datetime import datetime
from fastapi import APIRouter, Depends, Body
from pymongo import DESCENDING
from ...database import find, find_one, insert, update_by_id, delete_by_id
from ...auth import require_role
from ... import serializers as S

router = APIRouter(tags=["admin"])
admin_only = Depends(require_role("admin"))


def _slugify(text):
    s = re.sub(r"[^a-z0-9\s-]", "", (text or "").lower()).strip()
    s = re.sub(r"\s+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def _excerpt(content, fallback):
    if fallback:
        return fallback
    plain = re.sub(r"\s+", " ", re.sub(r"[#*`>_~\-]", "", content or "")).strip()
    return plain[:157] + "…" if len(plain) > 160 else plain


@router.get("/blog", dependencies=[admin_only])
def list_blog():
    return S.ok([S.blog_full(b) for b in find("blog_posts", sort=[("created_at", DESCENDING)])])


@router.post("/blog", dependencies=[admin_only])
def create_blog(data: dict = Body(...)):
    return _save_blog(None, data)


@router.put("/blog/{bid}", dependencies=[admin_only])
def update_blog(bid: str, data: dict = Body(...)):
    return _save_blog(bid, data)


@router.delete("/blog/{bid}", dependencies=[admin_only])
def delete_blog(bid: str):
    delete_by_id("blog_posts", bid)
    return S.ok({"id": bid})


def _save_blog(bid, data):
    title = data.get("title", "")
    content = data.get("content", "")
    slug = _slugify(data.get("slug") or title) or f"post-{int(datetime.utcnow().timestamp())}"
    clash = find_one("blog_posts", {"slug": slug})
    if clash and clash.id != bid:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    doc = {
        "title": title, "content": content, "excerpt": _excerpt(content, data.get("excerpt", "")),
        "slug": slug, "updated_at": datetime.utcnow(),
    }
    b = update_by_id("blog_posts", bid, doc) if bid else insert("blog_posts", doc)
    return S.ok(S.blog_full(b))
