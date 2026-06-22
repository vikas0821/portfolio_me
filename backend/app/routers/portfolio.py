"""Public portfolio + blog endpoints (mirrors the old /api/v1/portfolio contract)."""
from pydantic import BaseModel
from fastapi import APIRouter
from pymongo import DESCENDING
from ..database import find, find_one, insert
from ..defaults import get_or_create_settings
from .. import serializers as S

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


@router.get("/getPortfolio")
def get_portfolio():
    profile = find_one("profiles")
    skills = find("skills", sort=[("_id", 1)])
    projects = find("projects", sort=[("order", 1), ("_id", 1)])
    experience = find("experiences", sort=[("start_date", DESCENDING)])
    education = find("education", sort=[("_id", 1)])
    certs = find("certifications", sort=[("order", 1)])
    return S.ok({
        "settings": S.settings(get_or_create_settings()),
        "hero": S.hero(profile),
        "skills": [S.skill(x) for x in skills],
        "projects": [S.project(x) for x in projects],
        "experience": [S.experience(x) for x in experience],
        "education": [S.education(x) for x in education],
        "certifications": [S.certification(x) for x in certs],
        "contact": S.contact(profile),
    })


class ContactIn(BaseModel):
    name: str
    email: str
    message: str


@router.post("/sendContactMessage")
def send_contact(body: ContactIn):
    if not (body.name and body.email and body.message):
        return S.fail("name, email, and message are required")
    m = insert("contact_messages", {
        "name": body.name, "email": body.email, "message": body.message, "read": False,
    })
    return S.ok({"id": m.id}, "Message sent successfully")


@router.get("/getCertificates")
def get_certificates():
    return S.ok([S.certification(c) for c in find("certifications", sort=[("order", 1)])])


@router.get("/getBlogPosts")
def get_blog_posts():
    return S.ok([S.blog_list(p) for p in find("blog_posts", sort=[("created_at", DESCENDING)])])


@router.get("/getBlogPost/{slug}")
def get_blog_post(slug: str):
    post = find_one("blog_posts", {"slug": slug})
    if not post:
        return S.fail("Post not found")
    return S.ok(S.blog_full(post))
