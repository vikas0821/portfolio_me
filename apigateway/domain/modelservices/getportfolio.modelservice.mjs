import Profile from "../models/Profile.mjs";
import Experience from "../models/Experience.mjs";
import Project from "../models/Project.mjs";
import Skill from "../models/Skill.mjs";
import Education from "../models/Education.mjs";
import Certification from "../models/Certification.mjs";
import { getSettings } from "./settings.modelservice.mjs";

function formatPeriod(startDate, endDate, isCurrent) {
  const opts = { year: "numeric", month: "short" };
  const start = startDate ? new Date(startDate).toLocaleDateString("en-US", opts) : "";
  const end = isCurrent ? "Present" : endDate ? new Date(endDate).toLocaleDateString("en-US", opts) : "";
  return `${start} – ${end}`;
}

export const getPortfolio = async () => {
  const [profile, experience, projects, skills, education, certifications, settings] = await Promise.all([
    Profile.findOne().lean(),
    Experience.find().sort({ startDate: -1 }).lean(),
    Project.find().sort({ order: 1, createdAt: -1 }).lean(),
    Skill.find().lean(),
    Education.find().lean(),
    Certification.find().sort({ order: 1 }).lean(),
    getSettings(),
  ]);

  return {
    settings,
    hero: {
      name: profile?.name || "",
      role: profile?.title || "",
      location: profile?.location || "",
      summary: profile?.summary || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      website: profile?.website || "",
      avatar: profile?.avatar || "",
    },
    skills: (skills || []).map((s) => ({
      _id: s._id,
      category: s.category,
      items: s.skills || [],
    })),
    projects: (projects || []).map((p) => ({
      _id: p._id,
      title: p.name,
      description: p.description,
      tech: p.techStack || [],
      points: p.features || [],
      metrics: p.metrics || {},
      githubUrl: p.githubUrl || "",
      liveUrl: p.liveUrl || "",
      isFeatured: p.isFeatured || false,
    })),
    experience: (experience || []).map((e) => ({
      _id: e._id,
      company: e.company,
      role: e.role,
      location: e.location,
      period: formatPeriod(e.startDate, e.endDate, e.isCurrent),
      responsibilities: e.responsibilities || [],
      technologies: e.technologies || [],
    })),
    education: (education || []).map((ed) => ({
      _id: ed._id,
      qualification: ed.qualification,
      institution: ed.institution,
      score: ed.score,
      year: ed.year,
      location: ed.location,
    })),
    certifications: (certifications || []).map((c) => ({
      _id: c._id,
      title: c.title,
      issuer: c.issuer,
      platform: c.platform,
      year: c.year,
      logo: c.logo,
      certificateUrl: c.certificateUrl,
      credentialId: c.credentialId,
    })),
    contact: {
      email: profile?.email || "",
      phone: profile?.phone || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
    },
  };
};
