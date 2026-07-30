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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition mb-10">
          <ArrowLeft size={16} /> All posts
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : !post ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 mb-4">Post not found.</p>
            <Link to="/blog" className="text-accent font-semibold">Back to blog</Link>
          </div>
        ) : (
          <article>
            <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 mb-3">
              <Calendar size={14} /> {fmt(post.createdAt)}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8 leading-tight">{post.title}</h1>
            <Markdown>{post.content}</Markdown>
          </article>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
