"""Resume Builder tables (nested document arrays stored as JSON)."""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON

VALID_STATUSES = ["applied", "replied", "interview", "offer", "rejected", "ghosted"]


class Resume(SQLModel, table=True):
    __tablename__ = "resumes"
    id: Optional[int] = Field(default=None, primary_key=True)
    variant_name: str = ""
    is_default: bool = False
    template: str = "classic"          # classic | modern
    name: str = ""
    headline: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    summary: str = ""
    skills: list = Field(default_factory=list, sa_column=Column(JSON))
    certifications: list = Field(default_factory=list, sa_column=Column(JSON))
    projects: list = Field(default_factory=list, sa_column=Column(JSON))
    employment: list = Field(default_factory=list, sa_column=Column(JSON))
    experience: list = Field(default_factory=list, sa_column=Column(JSON))
    education: list = Field(default_factory=list, sa_column=Column(JSON))
    languages: str = ""
    gender: str = ""
    nationality: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Application(SQLModel, table=True):
    __tablename__ = "applications"
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str = ""
    role: str = ""
    location: str = ""
    job_ref: str = ""
    jd_text: str = ""
    resume_variant_id: Optional[int] = Field(default=None, foreign_key="resumes.id")
    ats_score: dict = Field(default_factory=lambda: {"before": 0, "after": 0}, sa_column=Column(JSON))
    status: str = "applied"
    recruiter_name: str = ""
    recruiter_email: str = ""
    source: str = ""
    link: str = ""
    generated_files: dict = Field(default_factory=dict, sa_column=Column(JSON))
    email_sent: bool = False
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    notes: str = ""
    tags: list = Field(default_factory=list, sa_column=Column(JSON))
    follow_up_date: Optional[datetime] = None
    follow_up_done: bool = False
    note_entries: list = Field(default_factory=list, sa_column=Column(JSON))
    cover_letter: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class EmailTemplate(SQLModel, table=True):
    __tablename__ = "email_templates"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    subject: str = ""
    body_html: str = ""
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class EmailLog(SQLModel, table=True):
    __tablename__ = "email_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    application_id: Optional[int] = Field(default=None, foreign_key="applications.id")
    to: str = ""
    subject: str = ""
    body_html: str = ""
    body_text: str = ""
    attachments: list = Field(default_factory=list, sa_column=Column(JSON))
    status: str = "sent"
    error: str = ""
    sent_at: datetime = Field(default_factory=datetime.utcnow)
