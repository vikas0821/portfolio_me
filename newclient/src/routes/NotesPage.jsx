import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Lock, Eye, EyeOff, Plus, Trash2, Pencil, Check, X, FileText, Folder,
  ArrowLeft, LogOut, StickyNote, Menu,
} from "lucide-react";
import * as svc from "../api/notesService";
import Markdown from "../components/Markdown";

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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <StickyNote size={26} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-slate-500 text-sm mt-1">Private workspace — enter password</p>
        </div>
        <form onSubmit={submit} className="bg-[#141414] border border-white/8 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Notes password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 text-sm"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 active:scale-95 transition disabled:opacity-50">
            {loading ? "…" : "Unlock"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-600 mt-4">
          <Link to="/" className="hover:text-slate-400 transition">← Back to portfolio</Link>
        </p>
      </div>
    </div>
  );
};

// ── Workspace ───────────────────────────────────────────────────────────────
const Workspace = ({ onLogout }) => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [notes, setNotes] = useState([]);
  const [openNote, setOpenNote] = useState(null); // currently opened note
  const [mode, setMode] = useState("view");       // "view" | "edit"
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [preview, setPreview] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

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

  // Sections CRUD
  const addSection = async () => {
    if (!newSection.trim()) return;
    try {
      const r = await svc.createSection({ title: newSection.trim() });
      setNewSection(""); setAddingSection(false);
      await loadSections();
      setActiveSection(r.data);
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

  // Notes CRUD
  const openNoteView = (note) => { setOpenNote(note); setMode("view"); };
  const startEdit = () => {
    setDraft({ title: openNote.title || "", content: openNote.content || "" });
    setPreview(false);
    setMode("edit");
  };
  const newNote = () => {
    if (!activeSection) return;
    setOpenNote({ _id: null });
    setDraft({ title: "", content: "" });
    setPreview(false);
    setMode("edit");
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
      setOpenNote(null);
      loadNotes(activeSection._id);
    } catch { toast.error("Failed to delete note"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-[#111111] border-r border-white/8 flex flex-col z-30 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-5 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
            <StickyNote size={16} className="text-accent" />
          </div>
          <p className="font-bold text-sm">My Notes</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-2 mb-1 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Sections</p>
          {sections.map((s) => (
            <div key={s._id} className={`group flex items-center rounded-lg ${activeSection?._id === s._id ? "bg-accent/10" : "hover:bg-white/5"}`}>
              {renameId === s._id ? (
                <input
                  autoFocus value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => renameSection(s._id)}
                  onKeyDown={(e) => { if (e.key === "Enter") renameSection(s._id); if (e.key === "Escape") setRenameId(null); }}
                  className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-md px-2 py-1 text-sm m-1"
                />
              ) : (
                <>
                  <button
                    onClick={() => { setActiveSection(s); setOpenNote(null); setSidebarOpen(false); }}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left truncate ${activeSection?._id === s._id ? "text-accent" : "text-slate-300"}`}
                  >
                    <Folder size={14} className="flex-shrink-0" /> <span className="truncate">{s.title}</span>
                  </button>
                  <button onClick={() => { setRenameId(s._id); setRenameVal(s.title); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white"><Pencil size={12} /></button>
                  <button onClick={() => removeSection(s)} className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                </>
              )}
            </div>
          ))}

          {addingSection ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                autoFocus value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
                placeholder="Section name"
                className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-md px-2 py-1.5 text-sm"
              />
              <button onClick={addSection} className="p-1.5 text-emerald-400 hover:bg-white/5 rounded"><Check size={14} /></button>
              <button onClick={() => setAddingSection(false)} className="p-1.5 text-slate-500 hover:bg-white/5 rounded"><X size={14} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingSection(true)} className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white">
              <Plus size={14} /> New section
            </button>
          )}
        </div>

        <div className="px-3 pb-4 border-t border-white/8 pt-3">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 mb-1"><ArrowLeft size={15} /> Portfolio</Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"><LogOut size={15} /> Lock</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/8 px-5 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen((o) => !o)} className="lg:hidden text-slate-400 hover:text-white"><Menu size={20} /></button>
          <Folder size={16} className="text-accent" />
          <h1 className="font-semibold text-sm truncate">{activeSection ? activeSection.title : "No section"}</h1>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-3xl w-full mx-auto">
          {!activeSection ? (
            <p className="text-center text-slate-500 py-20 text-sm">Create a section to start adding notes.</p>
          ) : openNote && mode === "view" ? (
            // Note — read (view) mode
            <div>
              <button onClick={() => setOpenNote(null)} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-5"><ArrowLeft size={15} /> Back to {activeSection.title}</button>
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold break-words">{openNote.title || "Untitled"}</h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={startEdit} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-accent text-white font-semibold hover:bg-accent/90"><Pencil size={14} /> Edit</button>
                  <button onClick={() => removeNote(openNote)} title="Delete" className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"><Trash2 size={14} /></button>
                </div>
              </div>
              {openNote.content
                ? <div className="dark"><Markdown>{openNote.content}</Markdown></div>
                : <p className="text-slate-500 text-sm italic">This note is empty. Click <b className="not-italic font-semibold">Edit</b> to add content.</p>}
            </div>
          ) : openNote ? (
            // Note — edit mode
            <div>
              <button onClick={() => (openNote._id ? setMode("view") : setOpenNote(null))} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-5"><ArrowLeft size={15} /> {openNote._id ? "Cancel" : `Back to ${activeSection.title}`}</button>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Note title"
                className="w-full bg-transparent text-2xl font-bold outline-none mb-4 placeholder:text-slate-600"
              />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Content (Markdown)</span>
                <button onClick={() => setPreview((p) => !p)} className="text-xs text-accent hover:underline">{preview ? "Edit" : "Preview"}</button>
              </div>
              {preview ? (
                <div className="dark rounded-lg bg-[#0f0f0f] border border-white/10 p-4 min-h-[300px]"><Markdown>{draft.content}</Markdown></div>
              ) : (
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  placeholder={"Write your note in Markdown…\n\n## Heading\n- point\n`code`"}
                  className="w-full min-h-[300px] rounded-lg bg-[#0f0f0f] border border-white/10 p-4 text-sm leading-relaxed outline-none focus:border-accent/50 resize-y font-mono"
                />
              )}
              <div className="flex items-center gap-2 justify-end mt-4">
                <button onClick={() => removeNote(openNote)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"><Trash2 size={14} /> Delete</button>
                <button onClick={saveNote} disabled={savingNote} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50"><Check size={14} /> {savingNote ? "Saving…" : "Save"}</button>
              </div>
            </div>
          ) : (
            // Notes list for the section
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">{activeSection.title}</h2>
                <button onClick={newNote} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-accent text-white font-semibold hover:bg-accent/90"><Plus size={15} /> New note</button>
              </div>
              {notes.length === 0 ? (
                <p className="text-slate-500 py-16 text-center text-sm">No notes here yet. Add your first topic.</p>
              ) : (
                <div className="space-y-2.5">
                  {notes.map((n) => (
                    <button key={n._id} onClick={() => openNoteView(n)} className="group w-full text-left p-4 rounded-xl bg-[#141414] border border-white/8 hover:border-accent/30 transition">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-slate-500 group-hover:text-accent flex-shrink-0" />
                        <span className="font-semibold text-white truncate">{n.title || "Untitled"}</span>
                      </div>
                      {n.content && <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 whitespace-pre-wrap">{n.content.replace(/[#*`>_~]/g, "")}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
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
