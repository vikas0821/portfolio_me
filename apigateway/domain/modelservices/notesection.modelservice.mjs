import NoteSection from "../models/NoteSection.mjs";
import Note from "../models/Note.mjs";

export const listSections = async () =>
  NoteSection.find().sort({ order: 1, createdAt: 1 }).lean();

export const saveSection = async (data) => {
  if (!data?.title) throw Object.assign(new Error("title is required"), { status: 400 });
  const { _id, title, order } = data;
  if (_id) return NoteSection.findByIdAndUpdate(_id, { title, order }, { new: true, runValidators: true });
  const count = await NoteSection.countDocuments();
  return NoteSection.create({ title, order: order ?? count });
};

// Deleting a section removes its notes too.
export const deleteSection = async (id) => {
  await Note.deleteMany({ sectionId: id });
  return NoteSection.findByIdAndDelete(id);
};
