import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  qualification: String,
  institution: String,
  score: String,
  year: String,
  location: String,
});

export default mongoose.model("Education", EducationSchema);
