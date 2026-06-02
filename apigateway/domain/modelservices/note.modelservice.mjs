import Note from "../models/Note.mjs";

const ALLOWED_COLORS = ["yellow", "green", "blue", "pink", "purple", "orange"];
const clean = (data = {}) => ({
  title: data.title || "",
  content: data.content || "",
  color: ALLOWED_COLORS.includes(data.color) ? data.color : "yellow",
  pinned: Boolean(data.pinned),
});

// ── Public ──────────────────────────────────────────────────────────────────
export const listNotes = async () =>
  Note.find().sort({ pinned: -1, createdAt: -1 }).lean();

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminGetNotes = async () => Note.find().sort({ pinned: -1, createdAt: -1 }).lean();

export const adminSaveNote = async (data) => {
  if (!data?.content) throw Object.assign(new Error("content is required"), { status: 400 });
  const payload = clean(data);
  if (data._id) return Note.findByIdAndUpdate(data._id, payload, { new: true, runValidators: true });
  return Note.create(payload);
};

export const adminDeleteNote = async (id) => Note.findByIdAndDelete(id);
