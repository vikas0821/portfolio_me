import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { fetchBlogPost } from "../api/portfolioService";
import Markdown from "../components/Markdown";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "");

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBlogPost(slug)
      .then((r) => { setPost(r); if (r?.title) document.title = `${r.title} — Vikas Kannaujiya`; })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-paper halftone-bg text-ink dark:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/blog" className="wobble-hover inline-flex items-center gap-2 text-sm font-bold text-ink/60 dark:text-white/60 hover:text-accent transition mb-10">
          <ArrowLeft size={16} /> All posts
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : !post ? (
          <div className="comic-panel py-16 px-8 text-center">
            <p className="text-ink/50 dark:text-white/50 mb-4 font-sans">Post not found.</p>
            <Link to="/blog" className="text-accent font-bold">Back to blog</Link>
          </div>
        ) : (
          <article className="comic-panel p-6 sm:p-10">
            <div className="flex items-center gap-1.5 text-sm font-bold text-ink/50 dark:text-white/50 mb-3">
              <Calendar size={14} /> {fmt(post.createdAt)}
            </div>
            <h1
              className="font-display text-4xl md:text-5xl uppercase tracking-wide mb-8 leading-tight"
              style={{ textShadow: "4px 4px 0 rgb(var(--accent-rgb))" }}
            >
              {post.title}
            </h1>
            <Markdown>{post.content}</Markdown>
          </article>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
