import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  features: [String],
  techStack: [String],
  githubUrl: String,
  liveUrl: String,
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  metrics: {
    uptime: String,
    latency: String,
    scale: String,
  },
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
