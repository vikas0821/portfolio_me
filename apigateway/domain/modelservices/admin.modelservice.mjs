import Profile from "../models/Profile.mjs";
import Experience from "../models/Experience.mjs";
import Project from "../models/Project.mjs";
import Skill from "../models/Skill.mjs";
import Education from "../models/Education.mjs";
import Certification from "../models/Certification.mjs";
import ContactMessage from "../models/ContactMessage.mjs";

// ── Profile ───────────────────────────────────────────────────────────────

export const adminGetProfile = async () => Profile.findOne().lean();

export const adminUpdateProfile = async (data) => {
  const allowed = ["name","title","location","email","phone","summary","linkedin","github","website","avatar"];
  const update = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  const doc = await Profile.findOneAndUpdate({}, update, { new: true, upsert: true, runValidators: true });
  return doc;
};

// ── Skills ────────────────────────────────────────────────────────────────

export const adminGetSkills = async () => Skill.find().lean();

export const adminSaveSkill = async ({ _id, category, skills }) => {
  if (_id) return Skill.findByIdAndUpdate(_id, { category, skills }, { new: true, runValidators: true });
  return Skill.create({ category, skills });
};

export const adminDeleteSkill = async (id) => Skill.findByIdAndDelete(id);

// ── Projects ──────────────────────────────────────────────────────────────

export const adminGetProjects = async () => Project.find().sort({ order: 1, createdAt: -1 }).lean();

export const adminSaveProject = async (data) => {
  const { _id, ...rest } = data;
  if (_id) return Project.findByIdAndUpdate(_id, rest, { new: true, runValidators: true });
  return Project.create(rest);
};

export const adminDeleteProject = async (id) => Project.findByIdAndDelete(id);

// ── Experience ────────────────────────────────────────────────────────────

export const adminGetExperience = async () => Experience.find().sort({ startDate: -1 }).lean();

export const adminSaveExperience = async (data) => {
  const { _id, ...rest } = data;
  if (_id) return Experience.findByIdAndUpdate(_id, rest, { new: true, runValidators: true });
  return Experience.create(rest);
};

export const adminDeleteExperience = async (id) => Experience.findByIdAndDelete(id);

// ── Education ─────────────────────────────────────────────────────────────

export const adminGetEducation = async () => Education.find().lean();

export const adminSaveEducation = async (data) => {
  const { _id, ...rest } = data;
  if (_id) return Education.findByIdAndUpdate(_id, rest, { new: true, runValidators: true });
  return Education.create(rest);
};

export const adminDeleteEducation = async (id) => Education.findByIdAndDelete(id);

// ── Certifications ────────────────────────────────────────────────────────

export const adminGetCertifications = async () => Certification.find().sort({ order: 1 }).lean();

export const adminSaveCertification = async (data) => {
  const { _id, ...rest } = data;
  if (_id) return Certification.findByIdAndUpdate(_id, rest, { new: true, runValidators: true });
  return Certification.create(rest);
};

export const adminDeleteCertification = async (id) => Certification.findByIdAndDelete(id);

// ── Messages ──────────────────────────────────────────────────────────────

export const adminGetMessages = async () => ContactMessage.find().sort({ createdAt: -1 }).lean();

export const adminDeleteMessage = async (id) => ContactMessage.findByIdAndDelete(id);

export const adminMarkMessageRead = async (id) =>
  ContactMessage.findByIdAndUpdate(id, { read: true }, { new: true });
