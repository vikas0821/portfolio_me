import mongoose from "mongoose";

const NoteSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("NoteSection", NoteSectionSchema);
