"""Default Site Settings (auto-created on first load)."""
from sqlmodel import Session, select
from .models import SiteSettings

DEFAULT_SETTINGS = dict(
    accent_color="#4f46e5",
    seo={
        "title": "Vikas Kannaujiya — Portfolio",
        "description": "Senior Software Engineer & Node.js specialist building secure, high-performance backend systems.",
    },
    hero={
        "badge": "Available for opportunities",
        "ctaPrimaryLabel": "View Projects",
        "ctaSecondaryLabel": "Download Resume",
    },
    sections={
        "skills": {"eyebrow": "Tech Stack", "heading": "Skills & Expertise", "subtitle": "Technologies and tools I work with day to day."},
        "projects": {"eyebrow": "My Work", "heading": "Selected Projects", "subtitle": "Production-grade projects that showcase my engineering capabilities."},
        "experience": {"eyebrow": "Career", "heading": "Work Experience", "subtitle": "My professional journey so far."},
        "education": {"eyebrow": "Academics", "heading": "Education", "subtitle": "My academic background."},
        "certifications": {"eyebrow": "Credentials", "heading": "Certifications", "subtitle": "Courses and certifications I've completed."},
        "blog": {"eyebrow": "Writing", "heading": "Blog", "subtitle": "Thoughts, notes, and write-ups on what I'm building."},
        "contact": {"eyebrow": "Get in touch", "heading": "Let's work together", "subtitle": "Have a project in mind or just want to say hi? Drop me a message."},
    },
    footer={
        "tagline": "Backend engineer crafting scalable, secure systems. Open to new opportunities.",
        "ctaText": "Looking for a developer? Let's build something great together.",
        "copyright": "",
    },
)


def get_or_create_settings(session: Session) -> SiteSettings:
    s = session.exec(select(SiteSettings)).first()
    if not s:
        s = SiteSettings(**DEFAULT_SETTINGS)
        session.add(s)
        session.commit()
        session.refresh(s)
    return s
