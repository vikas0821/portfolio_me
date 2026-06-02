import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pin, X } from "lucide-react";
import { fetchNotes } from "../api/portfolioService";
import { noteColor } from "../lib/noteColors";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "");

const NoteCard = ({ note, onOpen }) => {
  const c = noteColor(note.color);
  return (
    <button
      onClick={() => onOpen(note)}
      className={`note-paper group block w-full text-left break-inside-avoid mb-4 rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${c.card}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        {note.title ? (
          <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{note.title}</h3>
        ) : <span />}
        {note.pinned && <Pin size={14} className="text-slate-500 dark:text-slate-300 rotate-45 flex-shrink-0 mt-0.5" fill="currentColor" />}
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-[12]">
        {note.content}
      </p>
      <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">{fmt(note.createdAt)}</p>
    </button>
  );
};

const NoteModal = ({ note, onClose }) => {
  const c = noteColor(note.color);
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`note-paper relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border p-7 shadow-2xl ${c.card}`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition">
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-3 pr-8">
          {note.pinned && <Pin size={15} className="text-slate-500 dark:text-slate-300 rotate-45" fill="currentColor" />}
          {note.title && <h2 className="text-xl font-bold text-slate-900 dark:text-white">{note.title}</h2>}
        </div>
        <p className="text-[15px] text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">{fmt(note.createdAt)}</p>
      </motion.div>
    </motion.div>
  );
};

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    document.title = "Notes — Vikas Kannaujiya";
    fetchNotes().then((r) => { if (r) setNotes(r); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition mb-10">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Notes</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12">Quick thoughts, snippets, and things worth remembering.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12 text-center">No notes yet.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {notes.map((n) => (
              <NoteCard key={n._id} note={n} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <NoteModal note={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
