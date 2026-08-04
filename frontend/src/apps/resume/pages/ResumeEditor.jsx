import { useEffect, useState } from 'react';
import api, { fileUrl } from '../api';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { Card, Button, Field, Input, Select, Textarea, labelCls, Loading } from '../components/ui';

function Section({ title, children, onAdd, addLabel }) {
  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg tracking-wide text-ink dark:text-white">{title}</h2>
        {onAdd && <Button variant="secondary" size="sm" icon={Plus} onClick={onAdd}>{addLabel || 'Add'}</Button>}
      </div>
      {children}
    </Card>
  );
}

function BulletsEditor({ bullets, onChange }) {
  const update = (i, val) => onChange(bullets.map((b, idx) => idx === i ? val : b));
  const add = () => onChange([...bullets, '']);
  const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-1.5 mt-1">
      <label className={labelCls}>Bullets</label>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2">
          <Input value={b} onChange={e => update(i, e.target.value)} />
          <button onClick={() => remove(i)} className="text-ink/30 dark:text-white/30 hover:text-comic-red shrink-0"><Trash2 size={15} /></button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-bold text-accent hover:underline">+ Add bullet</button>
    </div>
  );
}

export default function ResumeEditor() {
  const [resume, setResume] = useState(null);
  const [previewFiles, setPreviewFiles] = useState(null);
  const [renderedAt, setRenderedAt] = useState(0);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    api.get('/resume').then(res => setResume(res.data));
  }, []);

  if (!resume) return <Loading label="Loading résumé…" />;

  const set = (key, val) => setResume(r => ({ ...r, [key]: val }));
  const setArr = (key, val) => setResume(r => ({ ...r, [key]: val }));
  const mapAt = (key, i, patch) => setArr(key, resume[key].map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeAt = (key, i) => setArr(key, resume[key].filter((_, idx) => idx !== i));

  const render = async () => {
    setRendering(true);
    try {
      setPreviewFiles((await api.post('/resume/render', resume)).data.files);
      setRenderedAt(Date.now());
    } finally { setRendering(false); }
  };
  // The rendered file is saved at a fixed path and overwritten on every
  // render, so a cache-busting query param keeps re-previews from showing
  // the browser's cached copy of the previous version.
  const previewUrl = (path) => `${fileUrl(path)}?t=${renderedAt}`;

  const delBtn = (key, i) => (
    <button onClick={() => removeAt(key, i)} className="text-ink/30 dark:text-white/30 hover:text-comic-red mb-2 shrink-0"><Trash2 size={16} /></button>
  );

  return (
    <div className="space-y-4 pb-10">
      {/* Sticky action bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 sticky top-14 lg:top-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-paper/95 backdrop-blur z-10 border-b-[3px] border-ink dark:border-white/70">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-ink dark:text-white">Resume Editor</h1>
          <p className="text-xs text-ink/50 dark:text-white/50 font-sans mt-0.5">
            Loaded from your portfolio data. Edits here are only for this download — they won't be saved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select className="w-auto" value={resume.template} onChange={e => set('template', e.target.value)}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </Select>
          <Button variant="primary" icon={Eye} loading={rendering} onClick={render}>{rendering ? 'Rendering…' : 'Preview'}</Button>
        </div>
      </div>

      {previewFiles && (
        <Card padding="p-4" className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-ink dark:text-white">Preview:</span>
            <a href={previewUrl(previewFiles.pdf)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"><Download size={14} /> Download PDF</a>
            <a href={previewUrl(previewFiles.html)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"><Download size={14} /> Download HTML</a>
            {previewFiles.docx && <a href={previewUrl(previewFiles.docx)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"><Download size={14} /> Download DOCX</a>}
          </div>
          <iframe
            title="Résumé preview"
            src={previewUrl(previewFiles.html)}
            className="w-full h-[75vh] rounded-lg border-2 border-ink/20 dark:border-white/20 bg-white"
          />
        </Card>
      )}

      <Section title="Personal info">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name"><Input value={resume.name} onChange={e => set('name', e.target.value)} /></Field>
          <Field label="Headline"><Input value={resume.headline} onChange={e => set('headline', e.target.value)} /></Field>
          <Field label="Email"><Input value={resume.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Phone"><Input value={resume.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Location"><Input value={resume.location} onChange={e => set('location', e.target.value)} /></Field>
          <Field label="LinkedIn"><Input value={resume.linkedin} onChange={e => set('linkedin', e.target.value)} /></Field>
        </div>
        <Field label="Professional summary"><Textarea rows={3} value={resume.summary} onChange={e => set('summary', e.target.value)} /></Field>
      </Section>

      <Section title="Skills" addLabel="Add group" onAdd={() => setArr('skills', [...resume.skills, { label: '', value: '' }])}>
        {resume.skills.map((s, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Field label="Category"><Input value={s.label} onChange={e => mapAt('skills', i, { label: e.target.value })} /></Field>
            <Field label="Skills (comma separated)"><Input value={s.value} onChange={e => mapAt('skills', i, { value: e.target.value })} /></Field>
            {delBtn('skills', i)}
          </div>
        ))}
      </Section>

      <Section title="Experience" addLabel="Add job" onAdd={() => setArr('experience', [...resume.experience, { role: '', company: '', location: '', duration: '', bullets: [] }])}>
        {resume.experience.map((exp, i) => (
          <div key={i} className="border-2 border-ink/20 dark:border-white/20 rounded-xl p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Role"><Input value={exp.role} onChange={e => mapAt('experience', i, { role: e.target.value })} /></Field>
              <Field label="Company"><Input value={exp.company} onChange={e => mapAt('experience', i, { company: e.target.value })} /></Field>
              <Field label="Location"><Input value={exp.location} onChange={e => mapAt('experience', i, { location: e.target.value })} /></Field>
              <Field label="Duration"><Input value={exp.duration} onChange={e => mapAt('experience', i, { duration: e.target.value })} /></Field>
            </div>
            <BulletsEditor bullets={exp.bullets} onChange={(bullets) => mapAt('experience', i, { bullets })} />
            <button onClick={() => removeAt('experience', i)} className="text-xs font-bold text-comic-red hover:underline">Remove this job</button>
          </div>
        ))}
      </Section>

      <Section title="Projects" addLabel="Add project" onAdd={() => setArr('projects', [...resume.projects, { name: '', tech: '', bullets: [] }])}>
        {resume.projects.map((p, i) => (
          <div key={i} className="border-2 border-ink/20 dark:border-white/20 rounded-xl p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Project name"><Input value={p.name} onChange={e => mapAt('projects', i, { name: e.target.value })} /></Field>
              <Field label="Tech stack"><Input value={p.tech} onChange={e => mapAt('projects', i, { tech: e.target.value })} /></Field>
            </div>
            <BulletsEditor bullets={p.bullets} onChange={(bullets) => mapAt('projects', i, { bullets })} />
            <button onClick={() => removeAt('projects', i)} className="text-xs font-bold text-comic-red hover:underline">Remove project</button>
          </div>
        ))}
      </Section>

      <Section title="Education" addLabel="Add education" onAdd={() => setArr('education', [...resume.education, { degree: '', institute: '', score: '', year: '' }])}>
        {resume.education.map((ed, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 items-end">
            <Field label="Degree"><Input value={ed.degree} onChange={e => mapAt('education', i, { degree: e.target.value })} /></Field>
            <Field label="Institute"><Input value={ed.institute} onChange={e => mapAt('education', i, { institute: e.target.value })} /></Field>
            <Field label="Score"><Input value={ed.score} onChange={e => mapAt('education', i, { score: e.target.value })} /></Field>
            <Field label="Year"><Input value={ed.year} onChange={e => mapAt('education', i, { year: e.target.value })} /></Field>
            {delBtn('education', i)}
          </div>
        ))}
      </Section>

      <Section title="Certifications" addLabel="Add certification" onAdd={() => setArr('certifications', [...resume.certifications, { label: '', value: '' }])}>
        {resume.certifications.map((c, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Field label="Authority"><Input value={c.label} onChange={e => mapAt('certifications', i, { label: e.target.value })} /></Field>
            <Field label="Certification"><Input value={c.value} onChange={e => mapAt('certifications', i, { value: e.target.value })} /></Field>
            {delBtn('certifications', i)}
          </div>
        ))}
      </Section>

      <Section title="Personal details">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Languages"><Input value={resume.languages} onChange={e => set('languages', e.target.value)} /></Field>
          <Field label="Gender"><Input value={resume.gender} onChange={e => set('gender', e.target.value)} /></Field>
          <Field label="Nationality"><Input value={resume.nationality} onChange={e => set('nationality', e.target.value)} /></Field>
        </div>
      </Section>
    </div>
  );
}
