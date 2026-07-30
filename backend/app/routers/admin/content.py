"""Admin CRUD — portfolio content: profile, skills, projects, experience,
education, certifications. Split out of routers/admin.py."""
from datetime import datetime
from fastapi import APIRouter, Depends, Body
from pymongo import DESCENDING
from ...database import find, find_one, insert, get_by_id, update_by_id, delete_by_id
from ...auth import require_role
from ... import serializers as S

router = APIRouter(tags=["admin"])
admin_only = Depends(require_role("admin"))


def _parse_date(v):
    """Frontend 'YYYY-MM-DD' -> datetime (BSON has no bare date type)."""
    if not v:
        return None
    try:
        return datetime.fromisoformat(str(v)[:10])
    except ValueError:
        return None


# ── Field mappers (frontend camelCase <-> document snake_case) ─────────────
def skill_out(s):
    return {"_id": S._id(s), "id": s.id, "category": s.category, "skills": s.items or []}


def project_out(p):
    return {
        "_id": S._id(p), "id": p.id, "name": p.name, "description": p.description,
        "features": p.features or [], "techStack": p.tech_stack or [], "githubUrl": p.github_url,
        "liveUrl": p.live_url, "isFeatured": p.is_featured, "order": p.order, "metrics": p.metrics or {},
    }


def exp_out(e):
    return {
        "_id": S._id(e), "id": e.id, "company": e.company, "role": e.role, "location": e.location,
        "startDate": S._iso(e.start_date) or "", "endDate": S._iso(e.end_date) or "", "isCurrent": e.is_current,
        "responsibilities": e.responsibilities or [], "technologies": e.technologies or [],
    }


def cert_out(c):
    return {
        "_id": S._id(c), "id": c.id, "title": c.title, "issuer": c.issuer, "platform": c.platform,
        "year": c.year, "logo": c.logo, "certificateUrl": c.certificate_url,
        "credentialId": c.credential_id, "order": c.order,
    }


# ── Profile (single document) ──────────────────────────────────────────────
def _profile_out(p):
    if not p:
        return None
    return {
        "_id": S._id(p), "name": p.name, "title": p.title, "location": p.location, "email": p.email,
        "phone": p.phone, "summary": p.summary, "linkedin": p.linkedin, "github": p.github,
        "website": p.website, "avatar": p.avatar,
    }


PROFILE_FIELDS = ["name", "title", "location", "email", "phone", "summary", "linkedin", "github", "website", "avatar"]


@router.get("/profile", dependencies=[admin_only])
def get_profile():
    return S.ok(_profile_out(find_one("profiles")))


@router.put("/profile", dependencies=[admin_only])
def update_profile(data: dict = Body(...)):
    changes = {f: (data[f] or "") for f in PROFILE_FIELDS if f in data}
    existing = find_one("profiles")
    p = update_by_id("profiles", existing.id, changes) if existing else insert("profiles", changes)
    return S.ok(_profile_out(p))


# ── Skills ────────────────────────────────────────────────────────────────
@router.get("/skills", dependencies=[admin_only])
def list_skills():
    return S.ok([skill_out(s) for s in find("skills", sort=[("_id", 1)])])


@router.post("/skills", dependencies=[admin_only])
def create_skill(data: dict = Body(...)):
    s = insert("skills", {"category": data.get("category", ""), "items": data.get("skills", [])})
    return S.ok(skill_out(s))


@router.put("/skills/{sid}", dependencies=[admin_only])
def update_skill(sid: str, data: dict = Body(...)):
    changes = {}
    if "category" in data:
        changes["category"] = data["category"]
    if "skills" in data:
        changes["items"] = data["skills"]
    s = update_by_id("skills", sid, changes)
    return S.ok(skill_out(s)) if s else S.fail("Not found")


@router.delete("/skills/{sid}", dependencies=[admin_only])
def delete_skill(sid: str):
    delete_by_id("skills", sid)
    return S.ok({"id": sid})


# ── Projects ──────────────────────────────────────────────────────────────
def _project_doc(d, base):
    return {
        "name": d.get("name", base.get("name", "")),
        "description": d.get("description", base.get("description", "")),
        "features": d.get("features", base.get("features", [])),
        "tech_stack": d.get("techStack", base.get("tech_stack", [])),
        "github_url": d.get("githubUrl", base.get("github_url", "")),
        "live_url": d.get("liveUrl", base.get("live_url", "")),
        "is_featured": bool(d.get("isFeatured", base.get("is_featured", False))),
        "order": int(d.get("order", base.get("order", 0)) or 0),
        "metrics": d.get("metrics", base.get("metrics", {})),
    }


@router.get("/projects", dependencies=[admin_only])
def list_projects():
    return S.ok([project_out(p) for p in find("projects", sort=[("order", 1), ("_id", 1)])])


@router.post("/projects", dependencies=[admin_only])
def create_project(data: dict = Body(...)):
    return S.ok(project_out(insert("projects", _project_doc(data, {}))))


@router.put("/projects/{pid}", dependencies=[admin_only])
def update_project(pid: str, data: dict = Body(...)):
    base = get_by_id("projects", pid)
    if not base:
        return S.fail("Not found")
    return S.ok(project_out(update_by_id("projects", pid, _project_doc(data, base))))


@router.delete("/projects/{pid}", dependencies=[admin_only])
def delete_project(pid: str):
    delete_by_id("projects", pid)
    return S.ok({"id": pid})


# ── Experience ────────────────────────────────────────────────────────────
def _exp_doc(d, base):
    return {
        "company": d.get("company", base.get("company", "")),
        "role": d.get("role", base.get("role", "")),
        "location": d.get("location", base.get("location", "")),
        "start_date": _parse_date(d.get("startDate")) if "startDate" in d else base.get("start_date"),
        "end_date": _parse_date(d.get("endDate")) if "endDate" in d else base.get("end_date"),
        "is_current": bool(d.get("isCurrent", base.get("is_current", False))),
        "responsibilities": d.get("responsibilities", base.get("responsibilities", [])),
        "technologies": d.get("technologies", base.get("technologies", [])),
    }


@router.get("/experience", dependencies=[admin_only])
def list_experience():
    return S.ok([exp_out(e) for e in find("experiences", sort=[("start_date", DESCENDING)])])


@router.post("/experience", dependencies=[admin_only])
def create_experience(data: dict = Body(...)):
    return S.ok(exp_out(insert("experiences", _exp_doc(data, {}))))


@router.put("/experience/{eid}", dependencies=[admin_only])
def update_experience(eid: str, data: dict = Body(...)):
    base = get_by_id("experiences", eid)
    if not base:
        return S.fail("Not found")
    return S.ok(exp_out(update_by_id("experiences", eid, _exp_doc(data, base))))


@router.delete("/experience/{eid}", dependencies=[admin_only])
def delete_experience(eid: str):
    delete_by_id("experiences", eid)
    return S.ok({"id": eid})


# ── Education ──────────────────────────────────────────────────────────────
EDU_FIELDS = ["qualification", "institution", "score", "year", "location"]


@router.get("/education", dependencies=[admin_only])
def list_education():
    return S.ok([S.education(e) for e in find("education", sort=[("_id", 1)])])


@router.post("/education", dependencies=[admin_only])
def create_education(data: dict = Body(...)):
    return S.ok(S.education(insert("education", {f: data.get(f, "") for f in EDU_FIELDS})))


@router.put("/education/{eid}", dependencies=[admin_only])
def update_education(eid: str, data: dict = Body(...)):
    base = get_by_id("education", eid)
    if not base:
        return S.fail("Not found")
    changes = {f: (data[f] or "") for f in EDU_FIELDS if f in data}
    return S.ok(S.education(update_by_id("education", eid, changes)))


@router.delete("/education/{eid}", dependencies=[admin_only])
def delete_education(eid: str):
    delete_by_id("education", eid)
    return S.ok({"id": eid})


# ── Certifications ────────────────────────────────────────────────────────
def _cert_doc(d, base):
    return {
        "title": d.get("title", base.get("title", "")),
        "issuer": d.get("issuer", base.get("issuer", "")),
        "platform": d.get("platform", base.get("platform", "")),
        "year": d.get("year", base.get("year", "")),
        "logo": d.get("logo", base.get("logo", "")),
        "certificate_url": d.get("certificateUrl", base.get("certificate_url", "")),
        "credential_id": d.get("credentialId", base.get("credential_id", "")),
        "order": int(d.get("order", base.get("order", 0)) or 0),
    }


@router.get("/certifications", dependencies=[admin_only])
def list_certs():
    return S.ok([cert_out(c) for c in find("certifications", sort=[("order", 1)])])


@router.post("/certifications", dependencies=[admin_only])
def create_cert(data: dict = Body(...)):
    return S.ok(cert_out(insert("certifications", _cert_doc(data, {}))))


@router.put("/certifications/{cid}", dependencies=[admin_only])
def update_cert(cid: str, data: dict = Body(...)):
    base = get_by_id("certifications", cid)
    if not base:
        return S.fail("Not found")
    return S.ok(cert_out(update_by_id("certifications", cid, _cert_doc(data, base))))


@router.delete("/certifications/{cid}", dependencies=[admin_only])
def delete_cert(cid: str):
    delete_by_id("certifications", cid)
    return S.ok({"id": cid})
