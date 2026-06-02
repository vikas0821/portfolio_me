import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  location: String,
  startDate: Date,
  endDate: Date,
  isCurrent: { type: Boolean, default: false },
  responsibilities: [String],
  technologies: [String],
}, { timestamps: true });

export default mongoose.model("Experience", ExperienceSchema);
