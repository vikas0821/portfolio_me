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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition mb-10">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Blog</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12">Thoughts, notes, and write-ups.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12 text-center">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post._id || post.slug}
                to={`/blog/${post.slug}`}
                className="group block p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/35 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-2">
                  <Calendar size={12} /> {fmt(post.createdAt)}
                </div>
                <h2 className="text-xl font-bold group-hover:text-accent transition-colors">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{post.excerpt}</p>}
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
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
