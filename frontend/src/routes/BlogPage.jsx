import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { fetchBlogPosts } from "../api/portfolioService";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "");

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Blog — Vikas Kannaujiya";
    fetchBlogPosts().then((r) => { if (r) setPosts(r); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper halftone-bg text-ink dark:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/" className="wobble-hover inline-flex items-center gap-2 text-sm font-bold text-ink/60 dark:text-white/60 hover:text-accent transition mb-10">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>

        <h1
          className="font-display text-5xl md:text-6xl uppercase tracking-wide mb-3"
          style={{ textShadow: "5px 5px 0 rgb(var(--accent-rgb))" }}
        >
          Blog
        </h1>
        <p className="text-ink/60 dark:text-white/60 mb-12 font-sans">Thoughts, notes, and write-ups.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-ink/50 dark:text-white/50 py-12 text-center font-sans">No posts yet.</p>
        ) : (
          <div className="space-y-5">
            {posts.map((post, i) => (
              <Link
                key={post._id || post.slug}
                to={`/blog/${post.slug}`}
                className={`comic-panel group block p-6 ${i % 2 === 0 ? "-rotate-1" : "rotate-1"} hover:rotate-0`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink/50 dark:text-white/50 mb-2">
                  <Calendar size={12} /> {fmt(post.createdAt)}
                </div>
                <h2 className="font-display text-2xl tracking-wide group-hover:text-accent transition-colors">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-ink/70 dark:text-white/70 leading-relaxed font-sans">{post.excerpt}</p>}
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                  Read more <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
