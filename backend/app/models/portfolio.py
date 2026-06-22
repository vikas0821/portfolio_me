"""Portfolio domain tables."""
from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    title: str = ""
    location: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    avatar: str = ""


class Project(SQLModel, table=True):
    __tablename__ = "projects"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    description: str = ""
    features: list = Field(default_factory=list, sa_column=Column(JSON))
    tech_stack: list = Field(default_factory=list, sa_column=Column(JSON))
    github_url: str = ""
    live_url: str = ""
    is_featured: bool = False
    order: int = 0
    metrics: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Experience(SQLModel, table=True):
    __tablename__ = "experiences"
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str = ""
    role: str = ""
    location: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    responsibilities: list = Field(default_factory=list, sa_column=Column(JSON))
    technologies: list = Field(default_factory=list, sa_column=Column(JSON))


class Skill(SQLModel, table=True):
    __tablename__ = "skills"
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str = ""
    items: list = Field(default_factory=list, sa_column=Column(JSON))


class Education(SQLModel, table=True):
    __tablename__ = "education"
    id: Optional[int] = Field(default=None, primary_key=True)
    qualification: str = ""
    institution: str = ""
    score: str = ""
    year: str = ""
    location: str = ""


class Certification(SQLModel, table=True):
    __tablename__ = "certifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = ""
    issuer: str = ""
    platform: str = ""
    year: str = ""
    logo: str = ""
    certificate_url: str = ""
    credential_id: str = ""
    order: int = 0


class ContactMessage(SQLModel, table=True):
    __tablename__ = "contact_messages"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    email: str = ""
    message: str = ""
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
