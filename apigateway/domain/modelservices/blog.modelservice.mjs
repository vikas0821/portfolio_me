import BlogPost from "../models/BlogPost.mjs";

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const makeExcerpt = (content, fallback) => {
  if (fallback) return fallback;
  const plain = String(content || "")
    .replace(/[#*`>_~\-]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? plain.slice(0, 157) + "…" : plain;
};

// ── Public ──────────────────────────────────────────────────────────────────

export const listBlogPosts = async () =>
  BlogPost.find().sort({ createdAt: -1 }).select("title slug excerpt createdAt updatedAt").lean();

export const getBlogPostBySlug = async (slug) => BlogPost.findOne({ slug }).lean();

// ── Admin ───────────────────────────────────────────────────────────────────

export const adminGetBlogPosts = async () => BlogPost.find().sort({ createdAt: -1 }).lean();

export const adminSaveBlogPost = async (data) => {
  const { _id, title, content, excerpt } = data;
  let slug = data.slug ? slugify(data.slug) : slugify(title);
  if (!slug) slug = `post-${Date.now()}`;

  const payload = {
    title,
    content: content || "",
    excerpt: makeExcerpt(content, excerpt),
  };

  if (_id) {
    // keep slug unique against *other* docs
    const clash = await BlogPost.findOne({ slug, _id: { $ne: _id } }).lean();
    payload.slug = clash ? `${slug}-${Date.now().toString(36)}` : slug;
    return BlogPost.findByIdAndUpdate(_id, payload, { new: true, runValidators: true });
  }

  const clash = await BlogPost.findOne({ slug }).lean();
  payload.slug = clash ? `${slug}-${Date.now().toString(36)}` : slug;
  return BlogPost.create(payload);
};

export const adminDeleteBlogPost = async (id) => BlogPost.findByIdAndDelete(id);
