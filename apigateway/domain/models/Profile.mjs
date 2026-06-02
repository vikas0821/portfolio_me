import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  name: String,
  title: String,
  location: String,
  email: String,
  phone: String,
  summary: String,
  linkedin: String,
  github: String,
  website: String,
  avatar: String,
}, { timestamps: true });

export default mongoose.model("Profile", ProfileSchema);
