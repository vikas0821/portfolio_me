// Snapshot of the real portfolio content, bundled into the app so the site
// renders immediately even if the backend is still cold-starting (Render's
// free tier sleeps after inactivity and can take 30-60s to wake up). The
// real API response silently replaces this once it arrives — see
// hooks/usePortfolio.js. Keep this reasonably in sync with the live data;
// it's a fallback, not a source of truth.
export default {
  "settings": {
    "accentColor": "#4f46e5",
    "seo": {
      "title": "Vikas Kannaujiya — Portfolio",
      "description": "Senior Software Engineer & Node.js specialist building secure, high-performance backend systems."
    },
    "hero": {
      "badge": "Available for opportunities",
      "ctaPrimaryLabel": "View Projects",
      "ctaSecondaryLabel": "Download Resume"
    },
    "sections": {
      "skills": { "eyebrow": "Tech Stack", "heading": "Skills & Expertise", "subtitle": "Technologies and tools I work with day to day." },
      "projects": { "eyebrow": "My Work", "heading": "Selected Projects", "subtitle": "Production-grade projects that showcase my engineering capabilities." },
      "experience": { "eyebrow": "Career", "heading": "Work Experience", "subtitle": "My professional journey so far." },
      "education": { "eyebrow": "Academics", "heading": "Education", "subtitle": "My academic background." },
      "certifications": { "eyebrow": "Credentials", "heading": "Certifications", "subtitle": "Courses and certifications I've completed." },
      "blog": { "eyebrow": "Writing", "heading": "Blog", "subtitle": "Thoughts, notes, and write-ups on what I'm building." },
      "contact": { "eyebrow": "Get in touch", "heading": "Let's work together", "subtitle": "Have a project in mind or just want to say hi? Drop me a message." }
    },
    "footer": {
      "tagline": "Backend engineer crafting scalable, secure systems. Open to new opportunities.",
      "ctaText": "Looking for a developer? Let's build something great together.",
      "copyright": ""
    }
  },
  "hero": {
    "name": "Vikas Kannaujiya",
    "role": "Senior Software Engineer | Backend Engineer | Node.js Specialist",
    "location": "Bangalore, Karnataka, India",
    "summary": "Senior Software Engineer with nearly 3 years delivering secure, high-performance Node.js backend systems for fintech and banking platforms serving millions of users. Specialized in microservices, REST/GraphQL APIs, OAuth2/JWT security, and cloud-native deployments on AWS, Docker, and Kubernetes.",
    "email": "vikaskannaujiya207@gmail.com",
    "phone": "+91-8318727487",
    "linkedin": "https://www.linkedin.com/in/vikas-kannaujiya0821",
    "github": "https://github.com/vikas0821",
    "website": "",
    "avatar": ""
  },
  "skills": [
    { "_id": "fallback-skill-1", "category": "Backend & Languages", "items": ["Node.js", "Express.js", "JavaScript (ES6+)", "TypeScript", "REST APIs", "GraphQL", "gRPC", "Serverless"] },
    { "_id": "fallback-skill-2", "category": "Databases & Caching", "items": ["MongoDB", "MySQL", "Redis", "MongoDB GridFS", "PostgreSQL"] },
    { "_id": "fallback-skill-3", "category": "Frontend", "items": ["React.js", "HTML5", "CSS3"] },
    { "_id": "fallback-skill-4", "category": "Cloud & DevOps", "items": ["AWS", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "CI/CD", "PM2", "Git"] },
    { "_id": "fallback-skill-5", "category": "Architecture & Security", "items": ["Microservices", "Event-Driven (RabbitMQ)", "OAuth2", "JWT", "UIDAI/RBI Compliance"] },
    { "_id": "fallback-skill-6", "category": "Testing & Tools", "items": ["Playwright", "Jest", "Winston", "Postman", "Agile/Scrum", "Prompt Engineering (OpenAI, Claude)"] }
  ],
  "projects": [
    {
      "_id": "fallback-project-1",
      "title": "PSB Alliance — Doorstep Banking Platform",
      "description": "Real-time transaction processing system for a pan-India doorstep banking platform used across public-sector banks.",
      "tech": ["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ"],
      "points": [
        "Achieved 99.9% uptime and sub-500ms API response under high concurrent load",
        "Reduced API latency by 30% through Redis caching, indexing, and query optimization",
        "Boosted operational efficiency 40% with SLA tracking and complaint-resolution workflows",
        "Centralized observability with Winston + RabbitMQ logging"
      ],
      "metrics": { "uptime": "99.9%", "latency": "<500ms", "scale": "Pan-India" },
      "githubUrl": null, "liveUrl": null, "isFeatured": true, "order": 1
    },
    {
      "_id": "fallback-project-2",
      "title": "Central Bank of India — Extended KYC Services",
      "description": "Automated periodic KYC platform integrating UIDAI biometric Aadhaar APIs.",
      "tech": ["Node.js", "Express.js", "UIDAI APIs", "OAuth2", "JWT"],
      "points": [
        "Processed 10,000+ customer bookings daily with automated periodic KYC",
        "Integrated UIDAI biometric Aadhaar APIs (fingerprint/iris) for 100% RBI compliance",
        "Hardened security with OAuth2 + JWT authentication and end-to-end audit logging",
        "Automated bulk processing via cron jobs"
      ],
      "metrics": { "uptime": "10k+/day", "latency": "RBI compliant", "scale": "Aadhaar eKYC" },
      "githubUrl": null, "liveUrl": null, "isFeatured": true, "order": 2
    },
    {
      "_id": "fallback-project-3",
      "title": "Bank of Maharashtra — Contact Point Verification (CPV)",
      "description": "Contact Point Verification system for customer due diligence and fraud prevention.",
      "tech": ["Node.js", "Express.js", "MongoDB GridFS", "JWT"],
      "points": [
        "Processed 5,000+ verification requests daily with zero data loss",
        "Secure photo capture and retrieval using MongoDB GridFS",
        "JWT-secured REST APIs with input validation and rate limiting",
        "Strengthened due diligence and fraud prevention"
      ],
      "metrics": { "uptime": "5k+/day", "latency": "Zero data loss", "scale": "Fraud prevention" },
      "githubUrl": null, "liveUrl": null, "isFeatured": false, "order": 3
    }
  ],
  "experience": [
    {
      "_id": "fallback-exp-1",
      "company": "Integra Micro Systems (P) Ltd.",
      "role": "Senior Software Engineer",
      "location": "Bangalore, India",
      "period": "Jul 2025 – Present",
      "responsibilities": [
        "Lead backend development for pan-India fintech and banking platforms serving millions of users.",
        "Engineered a real-time transaction processing system achieving 99.9% uptime and sub-500ms API response.",
        "Reduced API latency by 30% via Redis caching, indexing, and query optimization.",
        "Architected microservices for automated data sync, FCM/email notifications, and scheduled jobs."
      ],
      "technologies": ["Node.js", "Express.js", "MongoDB", "Redis", "OAuth2", "JWT", "RabbitMQ", "Docker", "Kubernetes"],
      "startDate": "2025-07-01", "endDate": null, "isCurrent": true
    },
    {
      "_id": "fallback-exp-2",
      "company": "Integra Micro Systems (P) Ltd.",
      "role": "Software Engineer",
      "location": "Bangalore, India",
      "period": "Jul 2023 – Jun 2025",
      "responsibilities": [
        "Developed an automated periodic KYC system processing 10,000+ customer bookings daily, integrating UIDAI biometric Aadhaar APIs for 100% RBI compliance.",
        "Hardened API security with OAuth2 + JWT authentication and end-to-end audit logging.",
        "Built a Contact Point Verification (CPV) system processing 5,000+ requests daily with zero data loss.",
        "Engineered secure photo capture and retrieval using MongoDB GridFS, with JWT-secured REST APIs."
      ],
      "technologies": ["Node.js", "Express.js", "UIDAI APIs", "MongoDB GridFS", "OAuth2", "JWT", "MongoDB"],
      "startDate": "2023-07-01", "endDate": "2025-06-30", "isCurrent": false
    }
  ],
  "education": [
    { "_id": "fallback-edu-1", "qualification": "B.Tech, Electronics Engineering", "institution": "Madan Mohan Malaviya University of Technology", "score": "72.3%", "year": "", "location": "Gorakhpur, Uttar Pradesh" },
    { "_id": "fallback-edu-2", "qualification": "Diploma, Electronics Engineering", "institution": "Board of Technical Education, Uttar Pradesh (BTEUP)", "score": "80.23%", "year": "", "location": "Uttar Pradesh" }
  ],
  "certifications": [
    { "_id": "fallback-cert-1", "title": "Complete Node.js Developer with GraphQL & MongoDB", "issuer": "Udemy", "platform": "Udemy", "year": "", "logo": "", "certificateUrl": "", "credentialId": "", "order": 1 },
    { "_id": "fallback-cert-2", "title": "JavaScript Algorithms & Data Structures", "issuer": "freeCodeCamp", "platform": "freeCodeCamp", "year": "", "logo": "", "certificateUrl": "", "credentialId": "", "order": 2 }
  ],
  "contact": {
    "email": "vikaskannaujiya207@gmail.com",
    "phone": "+91-8318727487",
    "linkedin": "https://www.linkedin.com/in/vikas-kannaujiya0821",
    "github": "https://github.com/vikas0821"
  }
};
