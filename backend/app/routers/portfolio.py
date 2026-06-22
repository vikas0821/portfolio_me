"""Public portfolio + blog endpoints (mirrors the old /api/v1/portfolio contract)."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select, desc
from ..database import get_session
from ..models import (
    Profile, Project, Experience, Skill, Education, Certification, ContactMessage, BlogPost,
)
from ..defaults import get_or_create_settings
from .. import serializers as S

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


@router.get("/getPortfolio")
def get_portfolio(session: Session = Depends(get_session)):
    profile = session.exec(select(Profile)).first()
    skills = session.exec(select(Skill).order_by(Skill.id)).all()
    projects = session.exec(select(Project).order_by(Project.order, Project.id)).all()
    experience = session.exec(select(Experience).order_by(desc(Experience.start_date))).all()
    education = session.exec(select(Education).order_by(Education.id)).all()
    certs = session.exec(select(Certification).order_by(Certification.order)).all()
    settings = get_or_create_settings(session)
    return S.ok({
        "settings": S.settings(settings),
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
def send_contact(body: ContactIn, session: Session = Depends(get_session)):
    if not (body.name and body.email and body.message):
        return S.fail("name, email, and message are required")
    m = ContactMessage(name=body.name, email=body.email, message=body.message)
    session.add(m)
    session.commit()
    session.refresh(m)
    return S.ok({"id": m.id}, "Message sent successfully")


@router.get("/getCertificates")
def get_certificates(session: Session = Depends(get_session)):
    certs = session.exec(select(Certification).order_by(Certification.order)).all()
    return S.ok([S.certification(c) for c in certs])


@router.get("/getBlogPosts")
def get_blog_posts(session: Session = Depends(get_session)):
    posts = session.exec(select(BlogPost).order_by(desc(BlogPost.created_at))).all()
    return S.ok([S.blog_list(p) for p in posts])


@router.get("/getBlogPost/{slug}")
def get_blog_post(slug: str, session: Session = Depends(get_session)):
    post = session.exec(select(BlogPost).where(BlogPost.slug == slug)).first()
    if not post:
        return S.fail("Post not found")
    return S.ok(S.blog_full(post))
