import SiteSettings from "../models/SiteSettings.mjs";

// Always returns a settings document (creates the singleton with defaults if missing).
export const getSettings = async () => {
  let doc = await SiteSettings.findOne({ key: "site" }).lean();
  if (!doc) {
    doc = (await SiteSettings.create({ key: "site" })).toObject();
  }
  return doc;
};

const ALLOWED = ["accentColor", "seo", "hero", "sections", "footer"];

export const adminUpdateSettings = async (data) => {
  const update = Object.fromEntries(Object.entries(data || {}).filter(([k]) => ALLOWED.includes(k)));
  return SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  ).lean();
};
