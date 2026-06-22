"""Site settings, blog, and notes tables."""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class SiteSettings(SQLModel, table=True):
    __tablename__ = "site_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    accent_color: str = "#4f46e5"
    seo: dict = Field(default_factory=dict, sa_column=Column(JSON))
    hero: dict = Field(default_factory=dict, sa_column=Column(JSON))
    sections: dict = Field(default_factory=dict, sa_column=Column(JSON))
    footer: dict = Field(default_factory=dict, sa_column=Column(JSON))


class BlogPost(SQLModel, table=True):
    __tablename__ = "blog_posts"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = ""
    slug: str = Field(default="", index=True, unique=True)
    excerpt: str = ""
    content: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NoteSection(SQLModel, table=True):
    __tablename__ = "note_sections"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = ""
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Note(SQLModel, table=True):
    __tablename__ = "notes"
    id: Optional[int] = Field(default=None, primary_key=True)
    section_id: int = Field(foreign_key="note_sections.id", index=True)
    title: str = ""
    content: str = ""
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
