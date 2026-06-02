import ContactMessage from "../models/ContactMessage.mjs";

export const sendContactMessage = async ({ name, email, message }) => {
  if (!name || !email || !message) {
    throw Object.assign(new Error("name, email, and message are required"), { status: 400 });
  }
  const doc = await ContactMessage.create({ name, email, message });
  return { id: doc._id };
};
