import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "NoteSection", required: true, index: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" }, // Markdown
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
