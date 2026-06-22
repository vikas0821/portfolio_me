"""Seed the unified MongoDB database. Run: python -m app.seed"""
from datetime import datetime
from .database import db, insert, init_db
from .defaults import get_or_create_settings

PROFILE = dict(
    name="Vikas Kannaujiya",
    title="Senior Software Engineer | Backend Engineer | Node.js Specialist",
    location="Bangalore, Karnataka, India",
    email="vikaskannaujiya207@gmail.com",
    phone="+91-8318727487",
    summary="Senior Software Engineer with nearly 3 years delivering secure, high-performance Node.js backend systems for fintech and banking platforms serving millions of users. Specialized in microservices, REST/GraphQL APIs, OAuth2/JWT security, and cloud-native deployments on AWS, Docker, and Kubernetes.",
    linkedin="https://www.linkedin.com/in/vikas-kannaujiya0821",
    github="https://github.com/vikas0821",
    website="",
    avatar="",
)

EXPERIENCE = [
    dict(company="Integra Micro Systems (P) Ltd.", role="Senior Software Engineer", location="Bangalore, India",
         start_date=datetime(2025, 7, 1), end_date=None, is_current=True,
         responsibilities=[
             "Lead backend development for pan-India fintech and banking platforms serving millions of users.",
             "Engineered a real-time transaction processing system achieving 99.9% uptime and sub-500ms API response.",
             "Reduced API latency by 30% via Redis caching, indexing, and query optimization.",
             "Architected microservices for automated data sync, FCM/email notifications, and scheduled jobs.",
         ],
         technologies=["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ", "Docker", "Kubernetes"]),
    dict(company="Integra Micro Systems (P) Ltd.", role="Software Engineer", location="Bangalore, India",
         start_date=datetime(2023, 7, 1), end_date=datetime(2025, 6, 30), is_current=False,
         responsibilities=[
             "Developed an automated periodic KYC system processing 10,000+ customer bookings daily, integrating UIDAI biometric Aadhaar APIs for 100% RBI compliance.",
             "Hardened API security with OAuth2 + JWT authentication and end-to-end audit logging.",
             "Built a Contact Point Verification (CPV) system processing 5,000+ requests daily with zero data loss.",
             "Engineered secure photo capture and retrieval using MongoDB GridFS, with JWT-secured REST APIs.",
         ],
         technologies=["Node.js", "Express.js", "UIDAI APIs", "MongoDB GridFS", "OAuth2", "JWT", "MongoDB"]),
]

PROJECTS = [
    dict(name="PSB Alliance — Doorstep Banking Platform",
         description="Real-time transaction processing system for a pan-India doorstep banking platform used across public-sector banks.",
         features=["Achieved 99.9% uptime and sub-500ms API response under high concurrent load",
                   "Reduced API latency by 30% through Redis caching, indexing, and query optimization",
                   "Boosted operational efficiency 40% with SLA tracking and complaint-resolution workflows",
                   "Centralized observability with Winston + RabbitMQ logging"],
         tech_stack=["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ"],
         is_featured=True, order=1, metrics={"uptime": "99.9%", "latency": "<500ms", "scale": "Pan-India"}),
    dict(name="Central Bank of India — Extended KYC Services",
         description="Automated periodic KYC platform integrating UIDAI biometric Aadhaar APIs.",
         features=["Processed 10,000+ customer bookings daily with automated periodic KYC",
                   "Integrated UIDAI biometric Aadhaar APIs (fingerprint/iris) for 100% RBI compliance",
                   "Hardened security with OAuth2 + JWT authentication and end-to-end audit logging",
                   "Automated bulk processing via cron jobs"],
         tech_stack=["Node.js", "Express.js", "UIDAI APIs", "OAuth2", "JWT"],
         is_featured=True, order=2, metrics={"uptime": "10k+/day", "latency": "RBI compliant", "scale": "Aadhaar eKYC"}),
    dict(name="Bank of Maharashtra — Contact Point Verification (CPV)",
         description="Contact Point Verification system for customer due diligence and fraud prevention.",
         features=["Processed 5,000+ verification requests daily with zero data loss",
                   "Secure photo capture and retrieval using MongoDB GridFS",
                   "JWT-secured REST APIs with input validation and rate limiting",
                   "Strengthened due diligence and fraud prevention"],
         tech_stack=["Node.js", "Express.js", "MongoDB GridFS", "JWT"],
         is_featured=False, order=3, metrics={"uptime": "5k+/day", "latency": "Zero data loss", "scale": "Fraud prevention"}),
]

SKILLS = [
    dict(category="Backend & Languages", items=["Node.js", "Express.js", "JavaScript (ES6+)", "TypeScript", "REST APIs", "GraphQL", "gRPC", "Serverless"]),
    dict(category="Databases & Caching", items=["MongoDB", "MySQL", "Redis", "MongoDB GridFS", "PostgreSQL"]),
    dict(category="Frontend", items=["React.js", "HTML5", "CSS3"]),
    dict(category="Cloud & DevOps", items=["AWS", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "CI/CD", "PM2", "Git"]),
    dict(category="Architecture & Security", items=["Microservices", "Event-Driven (RabbitMQ)", "OAuth2", "JWT", "UIDAI/RBI Compliance"]),
    dict(category="Testing & Tools", items=["Playwright", "Jest", "Winston", "Postman", "Agile/Scrum", "Prompt Engineering (OpenAI, Claude)"]),
]

EDUCATION = [
    dict(qualification="B.Tech, Electronics Engineering", institution="Madan Mohan Malaviya University of Technology", score="72.3%", year="", location="Gorakhpur, Uttar Pradesh"),
    dict(qualification="Diploma, Electronics Engineering", institution="Board of Technical Education, Uttar Pradesh (BTEUP)", score="80.23%", year="", location="Uttar Pradesh"),
]

CERTIFICATIONS = [
    dict(title="Complete Node.js Developer with GraphQL & MongoDB", issuer="Udemy", platform="Udemy", year="", logo="", certificate_url="", credential_id="", order=1),
    dict(title="JavaScript Algorithms & Data Structures", issuer="freeCodeCamp", platform="freeCodeCamp", year="", logo="", certificate_url="", credential_id="", order=2),
]

BLOG = [dict(
    title="Why I Consolidated My Microservices Into a Single Backend",
    slug="consolidating-microservices",
    excerpt="Microservices are great at scale — but for a portfolio, a single service is simpler, cheaper, and deploys anywhere for free.",
    content="## The setup\n\nMy portfolio originally ran an API gateway + a microservice over TCP. Clean in Docker — impossible on free serverless.\n\n## The fix\n\nI collapsed it into one service. Right tool for the right scale.",
    updated_at=datetime.utcnow(),
)]

NOTE_SECTIONS = {
    "Backend": [
        dict(title="Indexing", content="## DB indexing\nAlways index the fields you filter and sort on."),
        dict(title="Architecture", content="Right tool for the right scale — microservices aren't free."),
    ],
    "Learning": [
        dict(title="Reading list", content="- Designing Data-Intensive Applications\n- Node.js Design Patterns"),
    ],
}

PORTFOLIO_COLLECTIONS = ["profiles", "experiences", "projects", "skills", "education",
                         "certifications", "blog_posts", "note_sections", "notes"]


def seed_if_empty():
    """Seed only when the database has no profile yet (safe on every boot)."""
    from .database import count
    if count("profiles") == 0:
        run()
        return True
    return False


def run():
    init_db()
    for coll in PORTFOLIO_COLLECTIONS:
        db[coll].delete_many({})

    insert("profiles", dict(PROFILE))
    for e in EXPERIENCE: insert("experiences", dict(e))
    for p in PROJECTS: insert("projects", dict(p))
    for sk in SKILLS: insert("skills", dict(sk))
    for ed in EDUCATION: insert("education", dict(ed))
    for c in CERTIFICATIONS: insert("certifications", dict(c))
    for b in BLOG: insert("blog_posts", dict(b))

    for i, (title, notes) in enumerate(NOTE_SECTIONS.items()):
        sec = insert("note_sections", {"title": title, "order": i})
        for j, n in enumerate(notes):
            insert("notes", {"section_id": sec["_id"], "order": j, "updated_at": datetime.utcnow(), **n})

    get_or_create_settings()
    print("Seeded:", len(PROJECTS), "projects,", len(SKILLS), "skills,", len(BLOG), "posts,", len(NOTE_SECTIONS), "note sections")


if __name__ == "__main__":
    run()
