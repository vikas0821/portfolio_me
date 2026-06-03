import Note from "../models/Note.mjs";

export const listNotesBySection = async (sectionId) =>
  Note.find({ sectionId }).sort({ order: 1, createdAt: 1 }).lean();

export const saveNote = async (data) => {
  const { _id, sectionId, title, content, order } = data;
  if (_id) {
    return Note.findByIdAndUpdate(
      _id,
      { title: title || "", content: content || "", ...(order != null ? { order } : {}) },
      { new: true, runValidators: true }
    );
  }
  if (!sectionId) throw Object.assign(new Error("sectionId is required"), { status: 400 });
  const count = await Note.countDocuments({ sectionId });
  return Note.create({ sectionId, title: title || "", content: content || "", order: order ?? count });
};

export const deleteNote = async (id) => Note.findByIdAndDelete(id);
