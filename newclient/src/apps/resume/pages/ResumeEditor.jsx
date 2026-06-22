import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Plus, Trash2, Save, Download, Eye } from 'lucide-react';

const inputCls = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1';

function Field({ label, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} {...props} />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea className={inputCls} rows={3} {...props} />
    </div>
  );
}

function Section({ title, children, onAdd, addLabel }) {
  return (
    <div className="bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border hover:bg-slate-50 dark:hover:bg-accent/90">
            <Plus size={14} /> {addLabel || 'Add'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function BulletsEditor({ bullets, onChange }) {
  const update = (i, val) => onChange(bullets.map((b, idx) => idx === i ? val : b));
  const add = () => onChange([...bullets, '']);
  const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1 mt-2">
      <label className={labelCls}>Bullets</label>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2">
          <input className={inputCls} value={b} onChange={e => update(i, e.target.value)} />
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-slate-900 dark:text-slate-100 hover:underline">+ Add bullet</button>
    </div>
  );
}

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewFiles, setPreviewFiles] = useState(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    async function load() {
      if (id) {
        const res = await api.get(`/resumes/${id}`);
        setResume(res.data);
      } else {
        const list = (await api.get('/resumes')).data;
        if (list.length === 0) {
          navigate('/resume-builder/variants');
          return;
        }
        const target = list.find(r => r.isDefault) || list[0];
        navigate(`/resume-builder/resumes/${target._id}`, { replace: true });
      }
    }
    load();
  }, [id]);

  if (!resume) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;

  const set = (key, val) => setResume(r => ({ ...r, [key]: val }));
  const setArr = (key, val) => setResume(r => ({ ...r, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/resumes/${resume._id}`, resume);
      setResume(res.data);
    } finally {
      setSaving(false);
    }
  };

  const render = async () => {
    setRendering(true);
    try {
      const res = await api.post(`/resumes/${resume._id}/render`, { template: resume.template });
      setPreviewFiles(res.data.files);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center sticky top-0 bg-slate-100 dark:bg-[#0f0f0f] py-2 z-10">
        <div>
          <h1 className="text-2xl font-bold">{resume.variantName}</h1>
          <Link to="/resume-builder/variants" className="text-sm text-slate-900 dark:text-slate-100 hover:underline">← Back to variants</Link>
        </div>
        <div className="flex gap-2">
          <select className={inputCls} value={resume.template} onChange={e => set('template', e.target.value)}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
          <button onClick={render} disabled={rendering} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-accent/90 disabled:opacity-50">
            <Eye size={16} /> {rendering ? 'Rendering...' : 'Preview / Generate'}
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent/90 disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {previewFiles && (
        <div className="bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-4">
          <span className="text-sm font-medium">Generated:</span>
          <a href={previewFiles.html} target="_blank" rel="noreferrer" className="text-sm text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"><Eye size={14} /> View HTML</a>
          <a href={previewFiles.pdf} target="_blank" rel="noreferrer" className="text-sm text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"><Download size={14} /> Download PDF</a>
          <a href={previewFiles.docx} target="_blank" rel="noreferrer" className="text-sm text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"><Download size={14} /> Download DOCX</a>
        </div>
      )}

      {/* Variant settings */}
      <Section title="Variant">
        <Field label="Variant Name" value={resume.variantName} onChange={e => set('variantName', e.target.value)} />
      </Section>

      {/* Personal Info */}
      <Section title="Personal Info">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={resume.name} onChange={e => set('name', e.target.value)} />
          <Field label="Headline" value={resume.headline} onChange={e => set('headline', e.target.value)} />
          <Field label="Email" value={resume.email} onChange={e => set('email', e.target.value)} />
          <Field label="Phone" value={resume.phone} onChange={e => set('phone', e.target.value)} />
          <Field label="Location" value={resume.location} onChange={e => set('location', e.target.value)} />
          <Field label="LinkedIn" value={resume.linkedin} onChange={e => set('linkedin', e.target.value)} />
        </div>
        <TextAreaField label="Professional Summary" value={resume.summary} onChange={e => set('summary', e.target.value)} />
      </Section>

      {/* Skills */}
      <Section title="Skills" addLabel="Add Skill Group" onAdd={() => setArr('skills', [...resume.skills, { label: '', value: '' }])}>
        {resume.skills.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Field label="Category" value={s.label} onChange={e => setArr('skills', resume.skills.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            <Field label="Skills (comma separated)" value={s.value} onChange={e => setArr('skills', resume.skills.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
            <button onClick={() => setArr('skills', resume.skills.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 mb-1.5"><Trash2 size={16} /></button>
          </div>
        ))}
      </Section>

      {/* Experience */}
      <Section title="Experience" addLabel="Add Job" onAdd={() => setArr('experience', [...resume.experience, { role: '', company: '', location: '', duration: '', bullets: [] }])}>
        {resume.experience.map((exp, i) => (
          <div key={i} className="border border-slate-200 dark:border-white/10 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" value={exp.role} onChange={e => setArr('experience', resume.experience.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))} />
              <Field label="Company" value={exp.company} onChange={e => setArr('experience', resume.experience.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x))} />
              <Field label="Location" value={exp.location} onChange={e => setArr('experience', resume.experience.map((x, idx) => idx === i ? { ...x, location: e.target.value } : x))} />
              <Field label="Duration" value={exp.duration} onChange={e => setArr('experience', resume.experience.map((x, idx) => idx === i ? { ...x, duration: e.target.value } : x))} />
            </div>
            <BulletsEditor bullets={exp.bullets} onChange={(bullets) => setArr('experience', resume.experience.map((x, idx) => idx === i ? { ...x, bullets } : x))} />
            <button onClick={() => setArr('experience', resume.experience.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:underline">Remove this job</button>
          </div>
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects" addLabel="Add Project" onAdd={() => setArr('projects', [...resume.projects, { name: '', tech: '', bullets: [] }])}>
        {resume.projects.map((p, i) => (
          <div key={i} className="border border-slate-200 dark:border-white/10 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Name" value={p.name} onChange={e => setArr('projects', resume.projects.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
              <Field label="Tech Stack" value={p.tech} onChange={e => setArr('projects', resume.projects.map((x, idx) => idx === i ? { ...x, tech: e.target.value } : x))} />
            </div>
            <BulletsEditor bullets={p.bullets} onChange={(bullets) => setArr('projects', resume.projects.map((x, idx) => idx === i ? { ...x, bullets } : x))} />
            <button onClick={() => setArr('projects', resume.projects.filter((_, idx) => idx !== i))} className="text-xs text-red-500 hover:underline">Remove project</button>
          </div>
        ))}
      </Section>

      {/* Employment Summary */}
      <Section title="Employment Summary" addLabel="Add Row" onAdd={() => setArr('employment', [...resume.employment, { company: '', role: '', period: '', location: '' }])}>
        {resume.employment.map((e2, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
            <Field label="Company" value={e2.company} onChange={e => setArr('employment', resume.employment.map((x, idx) => idx === i ? { ...x, company: e.target.value } : x))} />
            <Field label="Role" value={e2.role} onChange={e => setArr('employment', resume.employment.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))} />
            <Field label="Period" value={e2.period} onChange={e => setArr('employment', resume.employment.map((x, idx) => idx === i ? { ...x, period: e.target.value } : x))} />
            <Field label="Location" value={e2.location} onChange={e => setArr('employment', resume.employment.map((x, idx) => idx === i ? { ...x, location: e.target.value } : x))} />
            <button onClick={() => setArr('employment', resume.employment.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 mb-1.5"><Trash2 size={16} /></button>
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title="Education" addLabel="Add Education" onAdd={() => setArr('education', [...resume.education, { degree: '', institute: '', score: '', year: '' }])}>
        {resume.education.map((ed, i) => (
          <div key={i} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 items-end">
            <Field label="Degree" value={ed.degree} onChange={e => setArr('education', resume.education.map((x, idx) => idx === i ? { ...x, degree: e.target.value } : x))} />
            <Field label="Institute" value={ed.institute} onChange={e => setArr('education', resume.education.map((x, idx) => idx === i ? { ...x, institute: e.target.value } : x))} />
            <Field label="Score" value={ed.score} onChange={e => setArr('education', resume.education.map((x, idx) => idx === i ? { ...x, score: e.target.value } : x))} />
            <Field label="Year" value={ed.year} onChange={e => setArr('education', resume.education.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))} />
            <button onClick={() => setArr('education', resume.education.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 mb-1.5"><Trash2 size={16} /></button>
          </div>
        ))}
      </Section>

      {/* Certifications */}
      <Section title="Certifications" addLabel="Add Certification" onAdd={() => setArr('certifications', [...resume.certifications, { label: '', value: '' }])}>
        {resume.certifications.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Field label="Authority" value={c.label} onChange={e => setArr('certifications', resume.certifications.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            <Field label="Certification" value={c.value} onChange={e => setArr('certifications', resume.certifications.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
            <button onClick={() => setArr('certifications', resume.certifications.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 mb-1.5"><Trash2 size={16} /></button>
          </div>
        ))}
      </Section>

      {/* Personal */}
      <Section title="Personal Details">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Languages" value={resume.languages} onChange={e => set('languages', e.target.value)} />
          <Field label="Gender" value={resume.gender} onChange={e => set('gender', e.target.value)} />
          <Field label="Nationality" value={resume.nationality} onChange={e => set('nationality', e.target.value)} />
        </div>
      </Section>
    </div>
  );
}
