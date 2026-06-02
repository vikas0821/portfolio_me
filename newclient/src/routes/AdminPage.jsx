import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  User, Code2, FolderOpen, Briefcase, GraduationCap, Award,
  MessageSquare, LogOut, Plus, Pencil, Trash2, Check, X,
  ChevronDown, ChevronUp, Eye, EyeOff, LayoutDashboard, Save, Mail,
  Settings as SettingsIcon, Newspaper
} from "lucide-react";
import * as svc from "../api/adminService";
import { applyAccent } from "../lib/accent";
import Markdown from "../components/Markdown";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const arrToStr = (v) => (Array.isArray(v) ? v.join(", ") : v || "");
const strToArr = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
const linesStr = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
const strLines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const fmtDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";

// ─── Shared UI atoms ─────────────────────────────────────────────────────────

const Label = ({ children }) => (
  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{children}</span>
);

const Input = ({ className = "", ...p }) => (
  <input
    className={`w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 text-sm transition ${className}`}
    {...p}
  />
);

const Textarea = ({ rows = 3, className = "", ...p }) => (
  <textarea
    rows={rows}
    className={`w-full px-3 py-2 rounded-lg bg-[#0f0f0f] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 text-sm transition resize-y ${className}`}
    {...p}
  />
);

const Btn = ({ variant = "primary", size = "sm", className = "", children, ...p }) => {
  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    ghost: "border border-white/10 text-slate-300 hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...p}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#141414] border border-white/8 rounded-xl p-5 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "slate" }) => {
  const c = { slate: "bg-slate-800 text-slate-300", gold: "bg-accent/15 text-accent", green: "bg-emerald-500/15 text-emerald-400", red: "bg-red-500/15 text-red-400" };
  return <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${c[color]}`}>{children}</span>;
};

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
  </div>
);

const Empty = ({ text }) => (
  <p className="text-center text-slate-500 py-10 text-sm">{text}</p>
);

// ─── Confirm delete dialog ────────────────────────────────────────────────────

const useConfirm = () => {
  const [state, setState] = useState({ open: false, resolve: null, msg: "" });
  const confirm = (msg) => new Promise((resolve) => setState({ open: true, resolve, msg }));
  const Dialog = state.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <p className="text-white font-semibold mb-2">Confirm Delete</p>
        <p className="text-slate-400 text-sm mb-6">{state.msg}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" onClick={() => { state.resolve(false); setState({ open: false }); }}>Cancel</Btn>
          <Btn variant="danger" onClick={() => { state.resolve(true); setState({ open: false }); }}>Delete</Btn>
        </div>
      </div>
    </div>
  ) : null;
  return { confirm, Dialog };
};

// ─── Section wrapper with add/list pattern ────────────────────────────────────

const Section = ({ title, description, children }) => (
  <div>
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

// ─── Profile Section ─────────────────────────────────────────────────────────

const PROFILE_FIELDS = [
  { key: "name",     label: "Full Name",   type: "input" },
  { key: "title",    label: "Job Title",   type: "input" },
  { key: "location", label: "Location",    type: "input" },
  { key: "email",    label: "Email",       type: "input" },
  { key: "phone",    label: "Phone",       type: "input" },
  { key: "linkedin", label: "LinkedIn URL",type: "input" },
  { key: "github",   label: "GitHub URL",  type: "input" },
  { key: "website",  label: "Website URL", type: "input" },
  { key: "avatar",   label: "Avatar URL",  type: "input" },
  { key: "summary",  label: "Summary",     type: "textarea", rows: 5 },
];

const ProfileSection = () => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    svc.getProfile().then((r) => { if (r.data) setForm(r.data); }).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await svc.updateProfile(form);
      toast.success("Profile updated");
    } catch { toast.error("Failed to save profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <Section title="Profile" description="Your public profile information shown in the hero section.">
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          {PROFILE_FIELDS.map(({ key, label, type, rows }) => (
            <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
              <Label>{label}</Label>
              {type === "textarea"
                ? <Textarea rows={rows} value={form[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={label} />
                : <Input value={form[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={label} />
              }
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Btn variant="primary" size="md" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save Profile"}
          </Btn>
        </div>
      </Card>
    </Section>
  );
};

// ─── Generic list section (Skills, Education, Certifications, Experience, Projects) ──

const useListSection = (fetchFn) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try { const r = await fetchFn(); setItems(r.data || []); }
    catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [fetchFn]);

  useEffect(() => { reload(); }, [reload]);

  return { items, loading, reload };
};

// ─── Skills Section ──────────────────────────────────────────────────────────

const emptySkill = () => ({ category: "", skills: [] });

const SkillForm = ({ initial = emptySkill(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({ ...initial, skills: arrToStr(initial.skills) });
  const submit = (e) => { e.preventDefault(); onSave({ category: f.category, skills: strToArr(f.skills) }); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Category Name</Label><Input required value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="e.g. Frontend" /></div>
      <div><Label>Skills (comma-separated)</Label><Input required value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="React, TypeScript, Tailwind CSS" /></div>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const SkillsSection = () => {
  const { items, loading, reload } = useListSection(svc.getSkills);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateSkill(id, data); else await svc.createSkill(data);
      toast.success(id ? "Updated" : "Added"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.category}"?`)) return;
    try { await svc.deleteSkill(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Skills" description="Skill categories displayed on your portfolio.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><SkillForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> Add Category</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No skills yet. Add your first category." /> : (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s._id}>
              {editId === s._id
                ? <SkillForm initial={s} onSave={(d) => save(d, s._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{s.category}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(s.skills || []).map((sk) => <Badge key={sk}>{sk}</Badge>)}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(s._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(s)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Projects Section ─────────────────────────────────────────────────────────

const emptyProject = () => ({ name: "", description: "", features: [], techStack: [], githubUrl: "", liveUrl: "", isFeatured: false, order: 0, metrics: { uptime: "", latency: "", scale: "" } });

const ProjectForm = ({ initial = emptyProject(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({
    ...initial,
    features: linesStr(initial.features),
    techStack: arrToStr(initial.techStack),
    metrics: initial.metrics || {},
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setM = (k, v) => setF((p) => ({ ...p, metrics: { ...p.metrics, [k]: v } }));
  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, features: strLines(f.features), techStack: strToArr(f.techStack), isFeatured: Boolean(f.isFeatured), order: Number(f.order) || 0 });
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>Project Name</Label><Input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="My Project" /></div>
        <div><Label>Order (display sequence)</Label><Input type="number" value={f.order} onChange={(e) => set("order", e.target.value)} /></div>
      </div>
      <div><Label>Description</Label><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description..." /></div>
      <div><Label>Key Features (one per line)</Label><Textarea rows={4} value={f.features} onChange={(e) => set("features", e.target.value)} placeholder="Implemented API Gateway pattern..." /></div>
      <div><Label>Tech Stack (comma-separated)</Label><Input value={f.techStack} onChange={(e) => set("techStack", e.target.value)} placeholder="Node.js, React, MongoDB" /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>GitHub URL</Label><Input value={f.githubUrl || ""} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/..." /></div>
        <div><Label>Live URL</Label><Input value={f.liveUrl || ""} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://..." /></div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div><Label>Uptime metric</Label><Input value={f.metrics?.uptime || ""} onChange={(e) => setM("uptime", e.target.value)} placeholder="99.9%" /></div>
        <div><Label>Latency metric</Label><Input value={f.metrics?.latency || ""} onChange={(e) => setM("latency", e.target.value)} placeholder="<80ms p99" /></div>
        <div><Label>Scale metric</Label><Input value={f.metrics?.scale || ""} onChange={(e) => setM("scale", e.target.value)} placeholder="50k req/day" /></div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="accent-indigo-500 w-4 h-4" checked={Boolean(f.isFeatured)} onChange={(e) => set("isFeatured", e.target.checked)} />
        <span className="text-sm text-slate-300">Featured project</span>
      </label>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const ProjectsSection = () => {
  const { items, loading, reload } = useListSection(svc.getProjects);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateProject(id, data); else await svc.createProject(data);
      toast.success(id ? "Updated" : "Added"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.name}"?`)) return;
    try { await svc.deleteProject(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Projects" description="Portfolio projects shown on your website.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><ProjectForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> Add Project</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No projects yet." /> : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p._id}>
              {editId === p._id
                ? <ProjectForm initial={p} onSave={(d) => save(d, p._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white truncate">{p.name}</p>
                        {p.isFeatured && <Badge color="gold">Featured</Badge>}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{(p.techStack || []).slice(0, 5).map((t) => <Badge key={t}>{t}</Badge>)}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(p._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(p)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Experience Section ───────────────────────────────────────────────────────

const emptyExp = () => ({ company: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, responsibilities: [], technologies: [] });

const ExpForm = ({ initial = emptyExp(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({ ...initial, startDate: fmtDate(initial.startDate), endDate: fmtDate(initial.endDate), responsibilities: linesStr(initial.responsibilities), technologies: arrToStr(initial.technologies) });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, responsibilities: strLines(f.responsibilities), technologies: strToArr(f.technologies), isCurrent: Boolean(f.isCurrent) });
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>Company</Label><Input required value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Company Name" /></div>
        <div><Label>Role / Title</Label><Input required value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Senior Developer" /></div>
        <div><Label>Location</Label><Input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Bengaluru, India" /></div>
        <div><Label>Start Date</Label><Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={f.endDate} disabled={f.isCurrent} onChange={(e) => set("endDate", e.target.value)} /></div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-indigo-500 w-4 h-4" checked={Boolean(f.isCurrent)} onChange={(e) => set("isCurrent", e.target.checked)} />
            <span className="text-sm text-slate-300">Currently working here</span>
          </label>
        </div>
      </div>
      <div><Label>Responsibilities (one per line)</Label><Textarea rows={4} value={f.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} placeholder="Built REST APIs..." /></div>
      <div><Label>Technologies (comma-separated)</Label><Input value={f.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="Node.js, React, MongoDB" /></div>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const ExperienceSection = () => {
  const { items, loading, reload } = useListSection(svc.getExperience);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateExperience(id, data); else await svc.createExperience(data);
      toast.success(id ? "Updated" : "Added"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.role} at ${item.company}"?`)) return;
    try { await svc.deleteExperience(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Experience" description="Work history shown on your portfolio timeline.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><ExpForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> Add Experience</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No experience entries yet." /> : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e._id}>
              {editId === e._id
                ? <ExpForm initial={e} onSave={(d) => save(d, e._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{e.role}</p>
                      <p className="text-accent text-sm">{e.company}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{e.location} · {e.isCurrent ? "Present" : fmtDate(e.endDate)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(e._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(e)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Education Section ────────────────────────────────────────────────────────

const emptyEdu = () => ({ qualification: "", institution: "", score: "", year: "", location: "" });

const EduForm = ({ initial = emptyEdu(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({ ...initial });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e) => { e.preventDefault(); onSave(f); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Qualification</Label><Input required value={f.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="B.Tech Computer Science" /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>Institution</Label><Input value={f.institution} onChange={(e) => set("institution", e.target.value)} placeholder="University Name" /></div>
        <div><Label>Score / CGPA</Label><Input value={f.score} onChange={(e) => set("score", e.target.value)} placeholder="8.5 CGPA" /></div>
        <div><Label>Year</Label><Input value={f.year} onChange={(e) => set("year", e.target.value)} placeholder="2019 – 2023" /></div>
        <div><Label>Location</Label><Input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Uttar Pradesh, India" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const EducationSection = () => {
  const { items, loading, reload } = useListSection(svc.getEducation);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateEducation(id, data); else await svc.createEducation(data);
      toast.success(id ? "Updated" : "Added"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.qualification}"?`)) return;
    try { await svc.deleteEducation(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Education" description="Academic qualifications shown in your portfolio.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><EduForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> Add Education</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No education entries yet." /> : (
        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e._id}>
              {editId === e._id
                ? <EduForm initial={e} onSave={(d) => save(d, e._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{e.qualification}</p>
                      <p className="text-slate-400 text-sm">{e.institution}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{e.score} · {e.year}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(e._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(e)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Certifications Section ───────────────────────────────────────────────────

const emptyCert = () => ({ title: "", issuer: "", platform: "", year: "", logo: "", certificateUrl: "", credentialId: "", order: 0 });

const CertForm = ({ initial = emptyCert(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({ ...initial });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e) => { e.preventDefault(); onSave({ ...f, order: Number(f.order) || 0 }); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Certificate Title</Label><Input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Node.js — The Complete Bootcamp" /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>Issuer / Instructor</Label><Input value={f.issuer} onChange={(e) => set("issuer", e.target.value)} placeholder="Jonas Schmedtmann" /></div>
        <div><Label>Platform</Label><Input value={f.platform} onChange={(e) => set("platform", e.target.value)} placeholder="Udemy" /></div>
        <div><Label>Year</Label><Input value={f.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" /></div>
        <div><Label>Order</Label><Input type="number" value={f.order} onChange={(e) => set("order", e.target.value)} /></div>
        <div><Label>Logo URL</Label><Input value={f.logo || ""} onChange={(e) => set("logo", e.target.value)} placeholder="https://..." /></div>
        <div><Label>Certificate URL</Label><Input value={f.certificateUrl || ""} onChange={(e) => set("certificateUrl", e.target.value)} placeholder="https://..." /></div>
        <div><Label>Credential ID</Label><Input value={f.credentialId || ""} onChange={(e) => set("credentialId", e.target.value)} placeholder="UC-XXXXXXXX" /></div>
      </div>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const CertificationsSection = () => {
  const { items, loading, reload } = useListSection(svc.getCertifications);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateCertification(id, data); else await svc.createCertification(data);
      toast.success(id ? "Updated" : "Added"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.title}"?`)) return;
    try { await svc.deleteCertification(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Certifications" description="Certifications and courses you have completed.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><CertForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> Add Certification</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No certifications yet." /> : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c._id}>
              {editId === c._id
                ? <CertForm initial={c} onSave={(d) => save(d, c._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white text-sm">{c.title}</p>
                      <p className="text-accent text-xs mt-0.5">{c.platform}</p>
                      <p className="text-slate-500 text-xs">{c.issuer} {c.year && `· ${c.year}`}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(c._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(c)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Messages Section ─────────────────────────────────────────────────────────

const MessagesSection = () => {
  const { items, loading, reload } = useListSection(svc.getMessages);
  const { confirm, Dialog } = useConfirm();

  const markRead = async (id) => {
    try { await svc.markMessageRead(id); reload(); }
    catch { toast.error("Failed to update"); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete message from "${item.name}"?`)) return;
    try { await svc.deleteMessage(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  const unread = items.filter((m) => !m.read).length;

  return (
    <Section title="Messages" description={`Contact form submissions (${unread} unread)`}>
      {Dialog}
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No messages yet." /> : (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m._id} className={m.read ? "opacity-60" : "border-accent/20"}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{m.name}</p>
                    {!m.read && <Badge color="gold">New</Badge>}
                  </div>
                  <p className="text-accent text-xs flex items-center gap-1"><Mail size={11} />{m.email}</p>
                  <p className="text-slate-300 text-sm mt-2 leading-relaxed">{m.message}</p>
                  <p className="text-slate-600 text-xs mt-2">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!m.read && <Btn variant="success" onClick={() => markRead(m._id)}><Check size={13} /> Read</Btn>}
                  <Btn variant="danger" onClick={() => remove(m)}><Trash2 size={13} /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Site Settings Section ────────────────────────────────────────────────────

const SECTION_KEYS = [
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["certifications", "Certifications"],
  ["contact", "Contact"],
];

const SettingsSection = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    svc.getSettings().then((r) => { if (r.data) setForm(r.data); }).finally(() => setLoading(false));
  }, []);

  const setPath = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      let o = next;
      for (let i = 0; i < path.length - 1; i++) {
        o[path[i]] = o[path[i]] || {};
        o = o[path[i]];
      }
      o[path[path.length - 1]] = value;
      return next;
    });
  };

  const onAccent = (v) => { setPath(["accentColor"], v); applyAccent(v); };

  const save = async () => {
    setSaving(true);
    try {
      const { accentColor, seo, hero, sections, footer } = form;
      await svc.updateSettings({ accentColor, seo, hero, sections, footer });
      applyAccent(accentColor);
      toast.success("Settings saved");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  if (loading || !form) return <Spinner />;

  return (
    <Section title="Site Settings" description="Control the editable text, SEO, and accent color of your public site.">
      <div className="space-y-4">
        {/* Appearance */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Appearance</h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={form.accentColor || "#4f46e5"}
              onChange={(e) => onAccent(e.target.value)}
              className="w-12 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
            />
            <div className="flex-1 max-w-xs">
              <Label>Accent color (hex)</Label>
              <Input value={form.accentColor || ""} onChange={(e) => onAccent(e.target.value)} placeholder="#4f46e5" />
            </div>
          </div>
        </Card>

        {/* SEO */}
        <Card>
          <h3 className="font-semibold text-white mb-4">SEO</h3>
          <div className="space-y-3">
            <div><Label>Browser tab title</Label><Input value={form.seo?.title || ""} onChange={(e) => setPath(["seo", "title"], e.target.value)} /></div>
            <div><Label>Meta description</Label><Textarea value={form.seo?.description || ""} onChange={(e) => setPath(["seo", "description"], e.target.value)} /></div>
          </div>
        </Card>

        {/* Hero */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Hero</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div><Label>Badge text</Label><Input value={form.hero?.badge || ""} onChange={(e) => setPath(["hero", "badge"], e.target.value)} /></div>
            <div><Label>Primary button</Label><Input value={form.hero?.ctaPrimaryLabel || ""} onChange={(e) => setPath(["hero", "ctaPrimaryLabel"], e.target.value)} /></div>
            <div><Label>Resume button</Label><Input value={form.hero?.ctaSecondaryLabel || ""} onChange={(e) => setPath(["hero", "ctaSecondaryLabel"], e.target.value)} /></div>
          </div>
        </Card>

        {/* Sections */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Section headings</h3>
          <div className="space-y-5">
            {SECTION_KEYS.map(([key, label]) => (
              <div key={key} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{label}</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div><Label>Eyebrow</Label><Input value={form.sections?.[key]?.eyebrow || ""} onChange={(e) => setPath(["sections", key, "eyebrow"], e.target.value)} /></div>
                  <div><Label>Heading</Label><Input value={form.sections?.[key]?.heading || ""} onChange={(e) => setPath(["sections", key, "heading"], e.target.value)} /></div>
                  <div><Label>Subtitle</Label><Input value={form.sections?.[key]?.subtitle || ""} onChange={(e) => setPath(["sections", key, "subtitle"], e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Footer</h3>
          <div className="space-y-3">
            <div><Label>Tagline</Label><Textarea rows={2} value={form.footer?.tagline || ""} onChange={(e) => setPath(["footer", "tagline"], e.target.value)} /></div>
            <div><Label>CTA text</Label><Textarea rows={2} value={form.footer?.ctaText || ""} onChange={(e) => setPath(["footer", "ctaText"], e.target.value)} /></div>
            <div><Label>Copyright (leave blank for default)</Label><Input value={form.footer?.copyright || ""} onChange={(e) => setPath(["footer", "copyright"], e.target.value)} /></div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Btn variant="primary" size="md" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save Settings"}
          </Btn>
        </div>
      </div>
    </Section>
  );
};

// ─── Blog Section ───────────────────────────────────────────────────────────

const emptyPost = () => ({ title: "", slug: "", excerpt: "", content: "" });

const BlogForm = ({ initial = emptyPost(), onSave, onCancel, saving }) => {
  const [f, setF] = useState({ ...initial });
  const [preview, setPreview] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e) => { e.preventDefault(); onSave(f); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div><Label>Title</Label><Input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="My first post" /></div>
        <div><Label>Slug (optional — auto from title)</Label><Input value={f.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="my-first-post" /></div>
      </div>
      <div><Label>Excerpt (optional — auto from content)</Label><Input value={f.excerpt || ""} onChange={(e) => set("excerpt", e.target.value)} placeholder="Short summary shown in the list" /></div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Content (Markdown)</Label>
          <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs text-accent hover:underline">
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview
          ? <div className="rounded-lg bg-[#0f0f0f] border border-white/10 p-4 min-h-[200px]"><Markdown>{f.content}</Markdown></div>
          : <Textarea rows={14} value={f.content} onChange={(e) => set("content", e.target.value)} placeholder={"## Heading\n\nWrite your post in **Markdown**.\n\n```js\nconst x = 1;\n```"} />
        }
      </div>
      <div className="flex gap-2 justify-end">
        <Btn type="button" variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save"}</Btn>
      </div>
    </form>
  );
};

const BlogAdminSection = () => {
  const { items, loading, reload } = useListSection(svc.getBlogPosts);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const save = async (data, id) => {
    setSaving(true);
    try {
      if (id) await svc.updateBlogPost(id, data); else await svc.createBlogPost(data);
      toast.success(id ? "Updated" : "Published"); setAdding(false); setEditId(null); reload();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!await confirm(`Delete "${item.title}"?`)) return;
    try { await svc.deleteBlogPost(item._id); toast.success("Deleted"); reload(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <Section title="Blog" description="Write and manage blog posts (Markdown). Posts appear on your public site immediately.">
      {Dialog}
      {adding
        ? <Card className="mb-4"><BlogForm onSave={(d) => save(d)} onCancel={() => setAdding(false)} saving={saving} /></Card>
        : <Btn variant="primary" className="mb-4" onClick={() => setAdding(true)}><Plus size={14} /> New Post</Btn>
      }
      {loading ? <Spinner /> : items.length === 0 ? <Empty text="No posts yet. Write your first one." /> : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p._id}>
              {editId === p._id
                ? <BlogForm initial={p} onSave={(d) => save(d, p._id)} onCancel={() => setEditId(null)} saving={saving} />
                : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{p.title}</p>
                      <p className="text-accent text-xs mt-0.5 font-mono">/blog/{p.slug}</p>
                      {p.excerpt && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{p.excerpt}</p>}
                      <p className="text-slate-600 text-xs mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Btn variant="ghost" onClick={() => setEditId(p._id)}><Pencil size={13} /></Btn>
                      <Btn variant="danger" onClick={() => remove(p)}><Trash2 size={13} /></Btn>
                    </div>
                  </div>
                )
              }
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV = [
  { id: "profile",          label: "Profile",          icon: User },
  { id: "skills",           label: "Skills",           icon: Code2 },
  { id: "projects",         label: "Projects",         icon: FolderOpen },
  { id: "experience",       label: "Experience",       icon: Briefcase },
  { id: "education",        label: "Education",        icon: GraduationCap },
  { id: "certifications",   label: "Certifications",   icon: Award },
  { id: "blog",             label: "Blog",             icon: Newspaper },
  { id: "messages",         label: "Messages",         icon: MessageSquare },
  { id: "settings",         label: "Site Settings",    icon: SettingsIcon },
];

const SECTIONS = {
  profile:        <ProfileSection />,
  skills:         <SkillsSection />,
  projects:       <ProjectsSection />,
  experience:     <ExperienceSection />,
  education:      <EducationSection />,
  certifications: <CertificationsSection />,
  blog:           <BlogAdminSection />,
  messages:       <MessagesSection />,
  settings:       <SettingsSection />,
};

// ─── Login Screen ─────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await svc.adminLogin(pw);
      if (r.token) { onLogin(r.token); toast.success("Welcome back!"); }
      else toast.error("Invalid password");
    } catch { toast.error("Invalid password"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Gradient blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <LayoutDashboard size={26} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Portfolio management dashboard</p>
        </div>

        <form onSubmit={submit} className="bg-[#141414] border border-white/8 rounded-2xl p-6 shadow-2xl space-y-4">
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter admin password"
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Btn type="submit" variant="primary" size="md" className="w-full justify-center" disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Sign In"}
          </Btn>

          <p className="text-center text-xs text-slate-600">
            Default: <code className="text-slate-400">admin@portfolio2025</code>
          </p>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">
          <a href="/" className="hover:text-slate-400 transition">← Back to portfolio</a>
        </p>
      </div>
    </div>
  );
};

// ─── Admin Layout ─────────────────────────────────────────────────────────────

const AdminLayout = ({ activeSection, onNavigate, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const current = NAV.find((n) => n.id === activeSection);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-[#111111] border-r border-white/8 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-accent" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Portfolio Admin</p>
              <p className="text-xs text-slate-500">Content Manager</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? "bg-accent/10 text-accent border border-accent/15" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition mb-1">
            <Eye size={16} /> View Portfolio
          </a>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/8 px-5 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen((o) => !o)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <LayoutDashboard size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-white text-sm">{current?.label || "Dashboard"}</h1>
            <p className="text-xs text-slate-500">Portfolio Admin</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Root Admin Page ──────────────────────────────────────────────────────────

const AdminPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [section, setSection] = useState("profile");

  const login = (t) => { localStorage.setItem("admin_token", t); setToken(t); };
  const logout = () => { localStorage.removeItem("admin_token"); setToken(null); };

  if (!token) return <LoginScreen onLogin={login} />;

  return (
    <AdminLayout activeSection={section} onNavigate={setSection} onLogout={logout}>
      {SECTIONS[section]}
    </AdminLayout>
  );
};

export default AdminPage;
