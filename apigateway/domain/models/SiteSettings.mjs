import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "" },
    heading: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false }
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    // single-document settings; `key` keeps it a singleton
    key: { type: String, default: "site", unique: true },

    accentColor: { type: String, default: "#4f46e5" },

    seo: {
      title: { type: String, default: "Vikas Kannaujiya — Portfolio" },
      description: { type: String, default: "Senior Software Engineer & Node.js specialist building secure, high-performance backend systems." },
    },

    hero: {
      badge: { type: String, default: "Available for opportunities" },
      ctaPrimaryLabel: { type: String, default: "View Projects" },
      ctaSecondaryLabel: { type: String, default: "Download Resume" },
    },

    sections: {
      skills: { type: SectionSchema, default: () => ({ eyebrow: "Tech Stack", heading: "Skills & Expertise", subtitle: "Technologies and tools I work with day to day." }) },
      projects: { type: SectionSchema, default: () => ({ eyebrow: "My Work", heading: "Selected Projects", subtitle: "Production-grade projects that showcase my engineering capabilities." }) },
      experience: { type: SectionSchema, default: () => ({ eyebrow: "Career", heading: "Work Experience", subtitle: "My professional journey so far." }) },
      education: { type: SectionSchema, default: () => ({ eyebrow: "Academics", heading: "Education", subtitle: "My academic background." }) },
      certifications: { type: SectionSchema, default: () => ({ eyebrow: "Credentials", heading: "Certifications", subtitle: "Courses and certifications I've completed." }) },
      blog: { type: SectionSchema, default: () => ({ eyebrow: "Writing", heading: "Blog", subtitle: "Thoughts, notes, and write-ups on what I'm building." }) },
      contact: { type: SectionSchema, default: () => ({ eyebrow: "Get in touch", heading: "Let's work together", subtitle: "Have a project in mind or just want to say hi? Drop me a message." }) },
    },

    footer: {
      tagline: { type: String, default: "Backend engineer crafting scalable, secure systems. Open to new opportunities." },
      ctaText: { type: String, default: "Looking for a developer? Let's build something great together." },
      copyright: { type: String, default: "" }, // empty -> component shows default "© YEAR Name"
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", SiteSettingsSchema);
