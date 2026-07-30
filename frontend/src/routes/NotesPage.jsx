import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Lock, Eye, EyeOff, Plus, Trash2, Pencil, Check, X, FileText, Folder,
  ArrowLeft, LogOut, StickyNote, Search, Sun, Moon, FolderPlus,
} from "lucide-react";
import * as svc from "../api/notesService";
import Markdown from "../components/Markdown";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme"
      className={`p-2 rounded-lg text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white transition ${className}`}>
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
};

// ── Login gate ────────────────────────────────────────────────────────────────
const NotesLogin = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await svc.notesLogin(pw);
      if (r.token) { onLogin(r.token); toast.success("Welcome to your notes"); }
      else toast.error("Invalid password");
    } catch { toast.error("Invalid password"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-paper halftone-bg text-ink dark:text-white flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-comic-yellow border-[3px] border-ink shadow-comic-sm mb-4 -rotate-3">
            <StickyNote size={28} className="text-ink" />
          </div>
          <h1
            className="font-display text-4xl uppercase tracking-wide text-ink dark:text-white"
            style={{ textShadow: "3px 3px 0 rgb(var(--accent-rgb))" }}
          >
            My Notes
          </h1>
          <p className="text-ink/60 dark:text-white/60 text-sm mt-2 font-sans">My private notes workspace — owner only.</p>
        </div>
        <form onSubmit={submit} className="comic-panel p-6 space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 dark:text-white/50" />
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Notes password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-paper border-2 border-ink dark:border-white/60 text-ink dark:text-white placeholder:text-ink/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 dark:text-white/50 hover:text-ink dark:hover:text-white">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="wobble-hover w-full py-2.5 rounded-lg bg-accent border-[3px] border-ink text-white font-display tracking-wide text-base shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {loading ? "…" : "Unlock"}
          </button>
        </form>
        <p className="text-center text-xs text-ink/50 dark:text-white/50 mt-4 font-sans">
          <Link to="/studio" className="hover:text-accent transition">← Back to workspace</Link>
        </p>
      </div>
    </div>
  );
};

// ── Workspace (three-pane) ──────────────────────────────────────────────────
const Workspace = ({ onLogout }) => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [notes, setNotes] = useState([]);
  const [openNote, setOpenNote] = useState(null);
  const [mode, setMode] = useState("view");           // "view" | "edit"
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [pane, setPane] = useState("sections");        // mobile: sections | list | editor

  const loadSections = useCallback(async () => {
    try {
      const r = await svc.getSections();
      const list = r.data || [];
      setSections(list);
      setActiveSection((cur) => cur || list[0] || null);
    } catch { toast.error("Failed to load sections"); }
  }, []);
  useEffect(() => { loadSections(); }, [loadSections]);

  const loadNotes = useCallback(async (sectionId) => {
    if (!sectionId) { setNotes([]); return; }
    try { const r = await svc.getSectionNotes(sectionId); setNotes(r.data || []); }
    catch { toast.error("Failed to load notes"); }
  }, []);
  useEffect(() => { if (activeSection?._id) loadNotes(activeSection._id); }, [activeSection, loadNotes]);

  // Sections
  const pickSection = (s) => { setActiveSection(s); setOpenNote(null); setQuery(""); setPane("list"); };
  const addSection = async () => {
    if (!newSection.trim()) return;
    try {
      const r = await svc.createSection({ title: newSection.trim() });
      setNewSection(""); setAddingSection(false);
      await loadSections();
      pickSection(r.data);
    } catch { toast.error("Failed to add section"); }
  };
  const renameSection = async (id) => {
    if (!renameVal.trim()) return setRenameId(null);
    try { await svc.updateSection(id, { title: renameVal.trim() }); setRenameId(null); await loadSections(); }
    catch { toast.error("Failed to rename"); }
  };
  const removeSection = async (sec) => {
    if (!window.confirm(`Delete section "${sec.title}" and all its notes?`)) return;
    try {
      await svc.deleteSection(sec._id);
      const remaining = sections.filter((s) => s._id !== sec._id);
      setSections(remaining);
      if (activeSection?._id === sec._id) { setActiveSection(remaining[0] || null); setOpenNote(null); }
      toast.success("Section deleted");
    } catch { toast.error("Failed to delete section"); }
  };

  // Notes
  const openNoteView = (note) => { setOpenNote(note); setMode("view"); setPane("editor"); };
  const startEdit = () => { setDraft({ title: openNote.title || "", content: openNote.content || "" }); setPreview(false); setMode("edit"); };
  const newNote = () => {
    if (!activeSection) return;
    setOpenNote({ _id: null }); setDraft({ title: "", content: "" }); setPreview(false); setMode("edit"); setPane("editor");
  };
  const saveNote = async () => {
    setSavingNote(true);
    try {
      const r = openNote._id
        ? await svc.updateNote(openNote._id, { title: draft.title, content: draft.content })
        : await svc.createNote({ sectionId: activeSection._id, title: draft.title, content: draft.content });
      toast.success("Saved");
      loadNotes(activeSection._id);
      if (r?.data) { setOpenNote(r.data); setMode("view"); } else { setOpenNote(null); }
    } catch { toast.error("Failed to save note"); }
    finally { setSavingNote(false); }
  };
  const removeNote = async (note) => {
    if (note._id && !window.confirm("Delete this note?")) return;
    try {
      if (note._id) await svc.deleteNote(note._id);
      setOpenNote(null); setPane("list");
      loadNotes(activeSection._id);
    } catch { toast.error("Failed to delete note"); }
  };

  const filtered = notes.filter((n) =>
    (`${n.title} ${n.content}`).toLowerCase().includes(query.trim().toLowerCase())
  );

  const paneCls = (name) => `${pane === name ? "flex" : "hidden"} lg:flex`;

  return (
    <div className="h-screen flex bg-paper text-ink dark:text-white overflow-hidden">

      {/* ── Pane 1: Sections ───────────────────────────────────────────── */}
      <aside className={`${paneCls("sections")} w-full lg:w-56 flex-col flex-shrink-0 bg-paper border-r-[3px] border-ink dark:border-white/70`}>
        <div className="px-4 py-4 border-b-[3px] border-ink dark:border-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 -rotate-6 rounded-lg bg-comic-yellow border-2 border-ink flex items-center justify-center">
              <StickyNote size={15} className="text-ink" />
            </div>
            <p className="font-display text-base tracking-wide">MY NOTES</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-3">
          <p className="px-2 mb-1.5 text-[11px] uppercase tracking-wider text-ink/50 dark:text-white/50 font-bold">Sections</p>
          {sections.map((s) => (
            <div key={s._id} className={`group flex items-center rounded-lg border-2 mb-1.5 ${activeSection?._id === s._id ? "bg-comic-yellow border-ink" : "border-transparent hover:border-ink/30 dark:hover:border-white/30"}`}>
              {renameId === s._id ? (
                <input autoFocus value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => renameSection(s._id)}
                  onKeyDown={(e) => { if (e.key === "Enter") renameSection(s._id); if (e.key === "Escape") setRenameId(null); }}
                  className="flex-1 bg-paper border-2 border-ink rounded-md px-2 py-1 text-sm m-1 outline-none" />
              ) : (
                <>
                  <button onClick={() => pickSection(s)}
                    className={`flex-1 flex items-center gap-2 px-2.5 py-2 text-sm text-left truncate font-bold ${activeSection?._id === s._id ? "text-ink" : "text-ink/70 dark:text-white/70"}`}>
                    <Folder size={14} className="flex-shrink-0" /> <span className="truncate">{s.title}</span>
                  </button>
                  <button onClick={() => { setRenameId(s._id); setRenameVal(s.title); }} className="opacity-0 group-hover:opacity-100 p-1 text-ink/50 hover:text-ink"><Pencil size={12} /></button>
                  <button onClick={() => removeSection(s)} className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-ink/50 hover:text-comic-red"><Trash2 size={12} /></button>
                </>
              )}
            </div>
          ))}

          {addingSection ? (
            <div className="flex items-center gap-1 mt-1">
              <input autoFocus value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
                placeholder="Section name"
                className="flex-1 bg-paper border-2 border-ink rounded-md px-2 py-1.5 text-sm outline-none" />
              <button onClick={addSection} className="p-1.5 text-ink bg-comic-green border-2 border-ink rounded hover:brightness-95"><Check size={14} /></button>
              <button onClick={() => setAddingSection(false)} className="p-1.5 text-ink/50 hover:bg-ink/5 rounded"><X size={14} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingSection(true)} className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm font-bold text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white">
              <FolderPlus size={14} /> New section
            </button>
          )}
        </div>

        <div className="px-2.5 pb-3 border-t-[3px] border-ink dark:border-white/70 pt-2.5">
          <Link to="/studio" className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-bold text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white mb-1"><ArrowLeft size={15} /> Studio</Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-bold text-comic-red hover:bg-comic-red/10"><LogOut size={15} /> Lock</button>
        </div>
      </aside>

      {/* ── Pane 2: Notes list ─────────────────────────────────────────── */}
      <aside className={`${paneCls("list")} w-full lg:w-72 flex-col flex-shrink-0 bg-paper halftone-bg border-r-[3px] border-ink dark:border-white/70`}>
        <div className="px-4 py-3 border-b-[3px] border-ink dark:border-white/70 flex items-center gap-2 bg-paper">
          <button onClick={() => setPane("sections")} className="lg:hidden p-1 text-ink/50 hover:text-ink dark:hover:text-white"><ArrowLeft size={18} /></button>
          <Folder size={15} className="text-accent flex-shrink-0" />
          <h2 className="font-display text-base tracking-wide truncate flex-1">{activeSection ? activeSection.title : "No section"}</h2>
          {activeSection && (
            <button onClick={newNote} title="New note" className="wobble-hover p-1.5 rounded-lg bg-accent border-2 border-ink text-white shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"><Plus size={15} /></button>
          )}
        </div>

        {activeSection && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/50 dark:text-white/50" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-paper border-2 border-ink dark:border-white/60 text-sm placeholder:text-ink/40 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {!activeSection ? (
            <p className="text-ink/50 dark:text-white/50 text-sm text-center py-10 font-sans">Create a section to start.</p>
          ) : filtered.length === 0 ? (
            <p className="text-ink/50 dark:text-white/50 text-sm text-center py-10 font-sans">{query ? "No matches." : "No notes yet."}</p>
          ) : filtered.map((n) => (
            <button key={n._id} onClick={() => openNoteView(n)}
              className={`comic-panel w-full text-left px-3 py-2.5 ${openNote?._id === n._id ? "bg-comic-yellow/60" : ""}`}>
              <div className="flex items-center gap-2">
                <FileText size={14} className={openNote?._id === n._id ? "text-ink" : "text-ink/40 dark:text-white/40"} />
                <span className="font-bold text-sm truncate">{n.title || "Untitled"}</span>
              </div>
              {n.content && <p className="text-ink/60 dark:text-white/60 text-xs mt-1 line-clamp-2 font-sans">{n.content.replace(/[#*`>_~[\]]/g, "")}</p>}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Pane 3: Editor / viewer ────────────────────────────────────── */}
      <main className={`${paneCls("editor")} flex-1 min-w-0 flex-col bg-paper halftone-bg`}>
        {!openNote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-comic-yellow border-[3px] border-ink shadow-comic-sm flex items-center justify-center mb-4 rotate-3">
              <FileText size={26} className="text-ink" />
            </div>
            <p className="text-ink/60 dark:text-white/60 text-sm font-sans">Select a note to read it, or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="px-5 lg:px-8 py-3 border-b-[3px] border-ink dark:border-white/70 flex items-center gap-3 bg-paper">
              <button onClick={() => { setOpenNote(null); setPane("list"); }} className="lg:hidden p-1 text-ink/50 hover:text-ink dark:hover:text-white"><ArrowLeft size={18} /></button>
              <span className="text-xs text-ink/50 dark:text-white/50 flex items-center gap-1.5 flex-1 truncate font-bold"><Folder size={12} /> {activeSection?.title}</span>
              {mode === "view" ? (
                <div className="flex items-center gap-2">
                  <button onClick={startEdit} className="wobble-hover inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm bg-accent border-2 border-ink text-white font-bold shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"><Pencil size={13} /> Edit</button>
                  <button onClick={() => removeNote(openNote)} title="Delete" className="p-2 rounded-lg text-comic-red hover:bg-comic-red/10"><Trash2 size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => (openNote._id ? setMode("view") : (setOpenNote(null), setPane("list")))} className="px-3 py-1.5 rounded-lg text-sm font-bold text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5">Cancel</button>
                  <button onClick={saveNote} disabled={savingNote} className="wobble-hover inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm bg-accent border-2 border-ink text-white font-bold shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"><Check size={13} /> {savingNote ? "Saving…" : "Save"}</button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 lg:px-10 py-7 max-w-3xl w-full mx-auto">
              {mode === "view" ? (
                <article>
                  <h1 className="font-display text-4xl tracking-wide mb-6 break-words">{openNote.title || "Untitled"}</h1>
                  {openNote.content
                    ? <Markdown>{openNote.content}</Markdown>
                    : <p className="text-ink/50 dark:text-white/50 text-sm italic font-sans">This note is empty. Click <b className="not-italic font-bold">Edit</b> to add content.</p>}
                </article>
              ) : (
                <div>
                  <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Note title"
                    className="w-full bg-transparent font-display text-4xl tracking-wide outline-none mb-4 placeholder:text-ink/25 dark:placeholder:text-white/25" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-ink/50 dark:text-white/50 font-bold">Content (Markdown)</span>
                    <button onClick={() => setPreview((p) => !p)} className="text-xs font-bold text-accent hover:underline">{preview ? "Write" : "Preview"}</button>
                  </div>
                  {preview ? (
                    <div className="comic-panel p-4 min-h-[320px]"><Markdown>{draft.content}</Markdown></div>
                  ) : (
                    <textarea value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                      placeholder={"Write in Markdown…\n\n## Heading\n- point\n`code`"}
                      className="w-full min-h-[320px] rounded-xl bg-paper border-2 border-ink dark:border-white/60 p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-accent/40 resize-y font-mono" />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
const NotesPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem("notes_token"));
  useEffect(() => { document.title = "Notes — Vikas Kannaujiya"; }, []);
  const login = (t) => { localStorage.setItem("notes_token", t); setToken(t); };
  const logout = () => { localStorage.removeItem("notes_token"); setToken(null); };

  if (!token) return <NotesLogin onLogin={login} />;
  return <Workspace onLogout={logout} />;
};

export default NotesPage;
