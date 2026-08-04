"""Domain constants. With MongoDB there are no ORM table classes — documents
are plain dicts keyed by the same snake_case field names the serializers read."""

VALID_STATUSES = ["applied", "replied", "interview", "offer", "rejected", "ghosted"]

# Collection names (single source of truth)
COLLECTIONS = [
    "profiles", "projects", "experiences", "skills", "education", "certifications",
    "contact_messages", "site_settings", "blog_posts", "note_sections", "notes",
    "applications", "email_templates", "email_logs",
]
