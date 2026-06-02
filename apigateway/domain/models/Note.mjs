import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, required: true },
    color: { type: String, default: "yellow" }, // yellow|green|blue|pink|purple|orange
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
