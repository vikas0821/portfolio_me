/**
 * Seed script — populates MongoDB with sample portfolio data.
 * Usage: node scripts/seed.mjs
 * Reads MONGO_URI from .env (or .env.docker if --docker flag passed).
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Support --docker flag to load docker env
const useDocker = process.argv.includes("--docker");
dotenv.config({ path: path.join(__dirname, "..", useDocker ? ".env.docker" : ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio";

// ── Model definitions (inline so seed is self-contained) ──────────────────

const ProfileSchema = new mongoose.Schema({ name: String, title: String, location: String, email: String, phone: String, summary: String, linkedin: String, github: String, website: String, avatar: String });
const ExperienceSchema = new mongoose.Schema({ company: String, role: String, location: String, startDate: Date, endDate: Date, isCurrent: Boolean, responsibilities: [String], technologies: [String] });
const ProjectSchema = new mongoose.Schema({ name: String, description: String, features: [String], techStack: [String], githubUrl: String, liveUrl: String, isFeatured: Boolean, order: Number, metrics: { uptime: String, latency: String, scale: String } });
const SkillSchema = new mongoose.Schema({ category: String, skills: [String] });
const EducationSchema = new mongoose.Schema({ qualification: String, institution: String, score: String, year: String, location: String });
const CertificationSchema = new mongoose.Schema({ title: String, issuer: String, platform: String, year: String, logo: String, certificateUrl: String, credentialId: String, order: Number });
const BlogPostSchema = new mongoose.Schema({ title: String, slug: String, excerpt: String, content: String }, { timestamps: true });
const NoteSectionSchema = new mongoose.Schema({ title: String, order: Number }, { timestamps: true });
const NoteSchema = new mongoose.Schema({ sectionId: mongoose.Schema.Types.ObjectId, title: String, content: String, order: Number }, { timestamps: true });

const Profile = mongoose.model("Profile", ProfileSchema);
const Experience = mongoose.model("Experience", ExperienceSchema);
const Project = mongoose.model("Project", ProjectSchema);
const Skill = mongoose.model("Skill", SkillSchema);
const Education = mongoose.model("Education", EducationSchema);
const Certification = mongoose.model("Certification", CertificationSchema);
const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
const NoteSection = mongoose.model("NoteSection", NoteSectionSchema);
const Note = mongoose.model("Note", NoteSchema);

// ── Seed Data ─────────────────────────────────────────────────────────────

const profileData = {
  name: "Vikas Kannaujiya",
  title: "Senior Software Engineer | Backend Engineer | Node.js Specialist",
  location: "Bangalore, Karnataka, India",
  email: "vikaskannaujiya207@gmail.com",
  phone: "+91-8318727487",
  summary: "Senior Software Engineer with nearly 3 years delivering secure, high-performance Node.js backend systems for fintech and banking platforms serving millions of users. Specialized in microservices, REST/GraphQL APIs, OAuth2/JWT security, and cloud-native deployments on AWS, Docker, and Kubernetes. Delivered 99.9% uptime, cut API latency 30%, and shipped UIDAI Aadhaar/KYC services compliant with RBI standards.",
  linkedin: "https://www.linkedin.com/in/vikas-kannaujiya0821",
  github: "https://github.com/vikas0821",
  website: "",
  avatar: "",
};

const experienceData = [
  {
    company: "Integra Micro Systems (P) Ltd.",
    role: "Senior Software Engineer",
    location: "Bangalore, India",
    startDate: new Date("2025-07-01"),
    endDate: null,
    isCurrent: true,
    responsibilities: [
      "Lead backend development for pan-India fintech and banking platforms serving millions of users.",
      "Engineered a real-time transaction processing system achieving 99.9% uptime and sub-500ms API response under high concurrent load.",
      "Reduced API latency by 30% via Redis caching, indexing, and query optimization; boosted operational efficiency by 40% with SLA tracking and structured complaint-resolution workflows.",
      "Architected microservices for automated data sync, FCM/email notifications, and scheduled jobs; centralized observability via Winston + RabbitMQ logging, cutting MTTR on production incidents.",
    ],
    technologies: ["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ", "Docker", "Kubernetes"],
  },
  {
    company: "Integra Micro Systems (P) Ltd.",
    role: "Software Engineer",
    location: "Bangalore, India",
    startDate: new Date("2023-07-01"),
    endDate: new Date("2025-06-30"),
    isCurrent: false,
    responsibilities: [
      "Developed an automated periodic KYC system processing 10,000+ customer bookings daily, integrating UIDAI biometric Aadhaar APIs (fingerprint/iris) for 100% RBI and government compliance.",
      "Hardened API security with OAuth2 + JWT authentication and end-to-end audit logging; automated bulk processing via cron jobs, eliminating manual data handling.",
      "Built a Contact Point Verification (CPV) system processing 5,000+ verification requests daily with zero data loss for fraud prevention.",
      "Engineered secure photo capture and retrieval using MongoDB GridFS, with JWT-secured REST APIs, input validation, and rate limiting.",
    ],
    technologies: ["Node.js", "Express.js", "UIDAI APIs", "MongoDB GridFS", "OAuth2", "JWT", "MongoDB"],
  },
];

const projectsData = [
  {
    name: "PSB Alliance — Doorstep Banking Platform",
    description: "Real-time transaction processing system for a pan-India doorstep banking platform used across public-sector banks, built on a Node.js microservices backend.",
    features: [
      "Achieved 99.9% uptime and sub-500ms API response under high concurrent load",
      "Reduced API latency by 30% through Redis caching, indexing, and query optimization",
      "Boosted operational efficiency 40% with SLA tracking and structured complaint-resolution workflows",
      "Centralized observability with Winston + RabbitMQ logging, cutting MTTR on production incidents",
    ],
    techStack: ["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ"],
    githubUrl: "",
    liveUrl: "",
    isFeatured: true,
    order: 1,
    metrics: { uptime: "99.9%", latency: "<500ms", scale: "Pan-India" },
  },
  {
    name: "Central Bank of India — Extended KYC Services",
    description: "Automated periodic KYC platform integrating UIDAI biometric Aadhaar APIs, processing thousands of customer bookings daily with full regulatory compliance.",
    features: [
      "Processed 10,000+ customer bookings daily with automated periodic KYC",
      "Integrated UIDAI biometric Aadhaar APIs (fingerprint/iris) for 100% RBI and government compliance",
      "Hardened security with OAuth2 + JWT authentication and end-to-end audit logging",
      "Automated bulk processing via cron jobs, eliminating manual data handling",
    ],
    techStack: ["Node.js", "Express.js", "UIDAI APIs", "OAuth2", "JWT"],
    githubUrl: "",
    liveUrl: "",
    isFeatured: true,
    order: 2,
    metrics: { uptime: "10k+/day", latency: "RBI compliant", scale: "Aadhaar eKYC" },
  },
  {
    name: "Bank of Maharashtra — Contact Point Verification (CPV)",
    description: "Contact Point Verification system for customer due diligence and fraud prevention, validating phone, email, and address with secure media handling.",
    features: [
      "Processed 5,000+ verification requests daily with zero data loss",
      "Secure photo capture and retrieval using MongoDB GridFS",
      "JWT-secured REST APIs with input validation and rate limiting",
      "Strengthened due diligence and fraud prevention for customer onboarding",
    ],
    techStack: ["Node.js", "Express.js", "MongoDB GridFS", "JWT"],
    githubUrl: "",
    liveUrl: "",
    isFeatured: false,
    order: 3,
    metrics: { uptime: "5k+/day", latency: "Zero data loss", scale: "Fraud prevention" },
  },
];

const skillsData = [
  {
    category: "Backend & Languages",
    skills: ["Node.js", "Express.js", "JavaScript (ES6+)", "TypeScript", "REST APIs", "GraphQL", "gRPC", "Serverless"],
  },
  {
    category: "Databases & Caching",
    skills: ["MongoDB", "MySQL", "Redis", "MongoDB GridFS"],
  },
  {
    category: "Frontend",
    skills: ["React.js", "HTML5", "CSS3"],
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "CI/CD", "PM2", "Git"],
  },
  {
    category: "Architecture & Security",
    skills: ["Microservices", "Event-Driven (RabbitMQ)", "OAuth2", "JWT", "UIDAI/RBI Compliance"],
  },
  {
    category: "Testing & Tools",
    skills: ["Playwright", "Jest", "Winston", "Postman", "Agile/Scrum", "Prompt Engineering (OpenAI, Claude)"],
  },
];

const educationData = [
  {
    qualification: "B.Tech, Electronics Engineering",
    institution: "Madan Mohan Malaviya University of Technology",
    score: "72.3%",
    year: "",
    location: "Gorakhpur, Uttar Pradesh",
  },
  {
    qualification: "Diploma, Electronics Engineering",
    institution: "Board of Technical Education, Uttar Pradesh (BTEUP)",
    score: "80.23%",
    year: "",
    location: "Uttar Pradesh",
  },
];

const certificationsData = [
  {
    title: "Complete Node.js Developer with GraphQL & MongoDB",
    issuer: "Udemy",
    platform: "Udemy",
    year: "",
    logo: "",
    certificateUrl: "",
    credentialId: "",
    order: 1,
  },
  {
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    platform: "freeCodeCamp",
    year: "",
    logo: "",
    certificateUrl: "",
    credentialId: "",
    order: 2,
  },
];

const blogData = [
  {
    title: "Why I Consolidated My Microservices Into a Single Backend",
    slug: "consolidating-microservices",
    excerpt: "Microservices are great at scale — but for a portfolio, a single Express service is simpler, cheaper, and deploys anywhere for free.",
    content: `## The setup

My portfolio originally ran an **API gateway** talking to a **Seneca microservice** over TCP, with MongoDB behind it. Clean in Docker — but impossible to host on free serverless platforms that don't allow persistent TCP listeners.

## The fix

I collapsed the gateway and the microservice into one Express app that calls the domain logic in-process:

\`\`\`js
// before: seneca.act("role:portfolio,cmd:getPortfolio", {})
// after:
const out = await handlers.getPortfolio({}, config);
\`\`\`

### What I gained

- One service to deploy (free tier friendly)
- No TCP RPC layer to debug
- Faster requests (in-process function calls)

> Use microservices when team or scale demands it — not by default.

The result deploys cleanly on **Render + Vercel + MongoDB Atlas**, all on free tiers.`,
  },
];

// Private notes workspace: sections, each with topic notes (Markdown)
const noteSectionsData = [
  { title: "Backend", order: 0 },
  { title: "Learning", order: 1 },
];

// keyed by section title -> notes
const noteContentBySection = {
  Backend: [
    { title: "Indexing", content: "## DB indexing\nAlways index the fields you filter and sort on.\n\nA compound index on `{ status: 1, createdAt: -1 }` turned a **1.2s** query into **<20ms**." },
    { title: "Architecture", content: "Right tool for the right scale — microservices aren't free.\n\n- Start simple (single service)\n- Split only when team/scale actually demands it" },
  ],
  Learning: [
    { title: "Reading list", content: "- Designing Data-Intensive Applications\n- Node.js Design Patterns\n- The Pragmatic Programmer" },
    { title: "Exploring", content: "Diving into **event-driven architecture** with RabbitMQ and message-queue patterns for resilient, decoupled services." },
  ],
};

// ── Run ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected.");

  // Clear existing data
  await Promise.all([
    Profile.deleteMany({}),
    Experience.deleteMany({}),
    Project.deleteMany({}),
    Skill.deleteMany({}),
    Education.deleteMany({}),
    Certification.deleteMany({}),
    BlogPost.deleteMany({}),
    NoteSection.deleteMany({}),
    Note.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // Insert new data
  await Promise.all([
    Profile.create(profileData),
    Experience.insertMany(experienceData),
    Project.insertMany(projectsData),
    Skill.insertMany(skillsData),
    Education.insertMany(educationData),
    Certification.insertMany(certificationsData),
    BlogPost.insertMany(blogData),
  ]);

  // Note sections + their notes (notes reference the section _id)
  const createdSections = await NoteSection.insertMany(noteSectionsData);
  for (const section of createdSections) {
    const items = noteContentBySection[section.title] || [];
    if (items.length) {
      await Note.insertMany(items.map((n, i) => ({ ...n, sectionId: section._id, order: i })));
    }
  }

  console.log("Seed data inserted successfully.");
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
