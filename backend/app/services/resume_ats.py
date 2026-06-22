"""ATS keyword analysis + resume tailoring (ported from the Node resume backend)."""
import re
import json

STOP_WORDS = set("""the a an and or but in on at to for of with by from up about is are was were be been being
have has had do does did will would could should may might shall can it its this that these those i we you he she
they them their our your his her us who which what when where how all any both few more most other some such than
too very just not only same so then there also into once here while if as like over under again work working team
strong using experience good well role position job company years year must able skills skill knowledge ability
understanding excellent proven required preferred include including related relevant based across within ensure
provide support drive build manage design develop implement lead make use help take get new high""".split())

TECH_PATTERNS = [
    r"node\.?js", r"react\.?js", r"next\.?js", r"vue\.?js", r"angular",
    r"golang|go\s+lang", r"python", r"java\b", r"kotlin", r"rust\b", r"scala",
    r"typescript", r"javascript", r"c\+\+", r"c#",
    r"postgresql|postgres", r"mongodb|mongo\b", r"mysql", r"redis",
    r"kafka", r"rabbitmq", r"elasticsearch", r"cassandra", r"dynamodb",
    r"kubernetes|k8s", r"docker", r"aws", r"gcp", r"azure",
    r"microservices", r"rest\s*api", r"graphql", r"grpc",
    r"ci/cd|cicd", r"terraform", r"jenkins", r"github\s*actions",
    r"fintech", r"payment", r"banking", r"upi", r"neft",
    r"spring\s*boot", r"fastapi", r"express", r"gin\b",
]


def _extract_keywords(text: str):
    words = [
        w for w in re.sub(r"[^\w\s.#+/-]", " ", text.lower()).split()
        if len(w) >= 4 and w not in STOP_WORDS and not w.isdigit()
    ]
    tech = []
    for pat in TECH_PATTERNS:
        for m in re.findall(pat, text, flags=re.IGNORECASE):
            tech.append(m.lower().strip())
    seen, out = set(), []
    for w in words + tech:
        if w not in seen:
            seen.add(w); out.append(w)
    return out


def analyze_keywords(jd_text: str, resume_text: str):
    jd = _extract_keywords(jd_text or "")
    rl = (resume_text or "").lower()
    matched = [k for k in jd if k in rl]
    missing = [k for k in jd if k not in rl]
    score = round((len(matched) / len(jd)) * 100) if jd else 0
    return {"matched": matched, "missing": missing[:20], "score": score, "total": len(jd)}


def _score_text(text, matched_set):
    lower = (text or "").lower()
    return sum(1 for kw in matched_set if kw in lower)


def tailor_resume(resume_data: dict, matched_keywords):
    matched = set(matched_keywords)
    t = json.loads(json.dumps(resume_data))
    if isinstance(t.get("skills"), list):
        t["skills"].sort(key=lambda s: _score_text(f"{s.get('label','')} {s.get('value','')}", matched), reverse=True)
    for key in ("experience", "projects"):
        for item in t.get(key, []) or []:
            if isinstance(item.get("bullets"), list):
                item["bullets"] = sorted(item["bullets"], key=lambda b: _score_text(b, matched), reverse=True)
    return t
