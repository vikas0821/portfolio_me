import mongoose from "mongoose";

const CertificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: String,
  platform: String,
  year: String,
  logo: String,
  certificateUrl: String,
  credentialId: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Certification", CertificationSchema);
