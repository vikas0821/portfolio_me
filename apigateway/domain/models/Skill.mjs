// models/Skill.js
import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  category: String,
  skills: [String]
});

export default mongoose.model("Skill", SkillSchema);
