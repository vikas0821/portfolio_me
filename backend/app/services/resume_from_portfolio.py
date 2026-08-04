"""Seeds a fresh Resume Builder resume from the portfolio's own data
(profiles/skills/experiences/projects/education/certifications) — used the
first time a user opens the Resume Editor and no resume document exists yet."""
from ..database import find, find_one
from ..serializers import fmt_period


def build_resume_from_portfolio() -> dict:
    profile = find_one("profiles")
    skills = find("skills")
    experiences = find("experiences", sort=[("start_date", -1)])
    projects = find("projects", sort=[("order", 1)])
    education = find("education")
    certifications = find("certifications", sort=[("order", 1)])

    return {
        "variant_name": "My Resume", "is_default": True, "template": "classic",
        "name": profile.name if profile else "",
        "headline": profile.title if profile else "",
        "email": profile.email if profile else "",
        "phone": profile.phone if profile else "",
        "location": profile.location if profile else "",
        "linkedin": profile.linkedin if profile else "",
        "summary": profile.summary if profile else "",
        "languages": "", "gender": "", "nationality": "",
        "skills": [{"label": s.category, "value": ", ".join(s.items or [])} for s in skills],
        "experience": [{
            "role": e.role, "company": e.company, "location": e.location,
            "duration": fmt_period(e.start_date, e.end_date, e.is_current),
            "bullets": list(e.responsibilities or []) +
                       ([f"Tech: {', '.join(e.technologies)}"] if e.technologies else []),
        } for e in experiences],
        "projects": [{
            "name": p.name, "tech": ", ".join(p.tech_stack or []),
            "bullets": ([p.description] if p.description else []) + list(p.features or []),
        } for p in projects],
        "employment": [],
        "education": [{
            "degree": ed.qualification, "institute": ed.institution,
            "score": ed.score, "year": ed.year,
        } for ed in education],
        "certifications": [{
            "label": c.issuer or c.platform or "",
            "value": f"{c.title}{f' ({c.year})' if c.year else ''}",
        } for c in certifications],
    }
