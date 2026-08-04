import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ChevronDown, ChevronRight, Trash2, FileText, Download, ExternalLink, Search, Inbox } from 'lucide-react';
import { PageHeader, Card, Button, Field, Input, Textarea, Badge, Loading, EmptyState, STATUS_BADGE } from '../components/ui';

const STATUSES = ['applied', 'replied', 'interview', 'offer', 'rejected', 'ghosted'];

function isFollowUpDue(app) {
  if (!app.followUpDate || app.followUpDone) return false;
  return new Date(app.followUpDate) <= new Date();
}

function DetailsPanel({ app, onChange }) {
  const [tagsInput, setTagsInput] = useState((app.tags || []).join(', '));
  const [sourceInput, setSourceInput] = useState(app.source || '');
  const [linkInput, setLinkInput] = useState(app.link || '');
  const [followUpDate, setFollowUpDate] = useState(app.followUpDate ? app.followUpDate.slice(0, 10) : '');
  const [coverLetter, setCoverLetter] = useState(app.coverLetter || '');
  const [savingCover, setSavingCover] = useState(false);
  const [noteText, setNoteText] = useState('');

  const patch = async (body) => onChange((await api.patch(`/applications/${app._id}`, body)).data);
  const saveTags = () => patch({ tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) });
  const saveSource = () => patch({ source: sourceInput.trim() });
  const saveLink = () => patch({ link: linkInput.trim() });
  const saveFollowUp = (extra = {}) => patch({ followUpDate: followUpDate || null, ...extra });

  const saveCoverLetter = async () => {
    setSavingCover(true);
    try { onChange((await api.post(`/applications/${app._id}/cover-letter`, { text: coverLetter })).data); }
    finally { setSavingCover(false); }
  };
  const addNote = async () => {
    if (!noteText.trim()) return;
    onChange((await api.post(`/applications/${app._id}/notes`, { text: noteText })).data);
    setNoteText('');
  };
  const deleteNote = async (noteId) => onChange((await api.delete(`/applications/${app._id}/notes/${noteId}`)).data);

  return (
    <div className="grid md:grid-cols-2 gap-6 p-5 bg-paper border-t-2 border-ink/20 dark:border-white/20">
      <div className="space-y-4">
        <Field label="Tags">
          <div className="flex gap-2">
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="referral, linkedin" />
            <Button variant="secondary" size="sm" onClick={saveTags}>Save</Button>
          </div>
        </Field>
        <Field label="Source / Portal">
          <div className="flex gap-2">
            <Input value={sourceInput} onChange={e => setSourceInput(e.target.value)} placeholder="LinkedIn, Naukri…" />
            <Button variant="secondary" size="sm" onClick={saveSource}>Save</Button>
          </div>
        </Field>
        <Field label="Link">
          <div className="flex gap-2 items-center">
            <Input value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="https://…" />
            <Button variant="secondary" size="sm" onClick={saveLink}>Save</Button>
            {app.link && <a href={app.link} target="_blank" rel="noreferrer" className="text-ink/40 dark:text-white/40 hover:text-accent shrink-0"><ExternalLink size={16} /></a>}
          </div>
        </Field>
        <Field label="Follow-up date">
          <div className="flex gap-2 items-center">
            <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => saveFollowUp()}>Save</Button>
            {app.followUpDate && (
              <label className="flex items-center gap-1.5 text-xs text-ink/60 dark:text-white/60 shrink-0">
                <input type="checkbox" checked={!!app.followUpDone} onChange={e => saveFollowUp({ followUpDone: e.target.checked })} /> Done
              </label>
            )}
          </div>
        </Field>
        <Field label="Job description">
          {app.jdText
            ? <pre className="text-xs whitespace-pre-wrap bg-paper border-2 border-ink/20 dark:border-white/20 rounded-lg p-3 max-h-48 overflow-auto text-ink/70 dark:text-white/70">{app.jdText}</pre>
            : <p className="text-xs text-ink/50 dark:text-white/50">No job description saved.</p>}
        </Field>
      </div>

      <div className="space-y-4">
        <Field label="Cover letter">
          <Textarea rows={6} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Write or paste a cover letter…" />
          <div className="flex items-center gap-3 mt-2">
            <Button variant="primary" size="sm" icon={FileText} loading={savingCover} onClick={saveCoverLetter}>
              {savingCover ? 'Saving…' : 'Save & generate PDF'}
            </Button>
            {app.generatedFiles?.coverLetter && (
              <a href={app.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"><Download size={14} /> View PDF</a>
            )}
          </div>
        </Field>
        <Field label="Notes">
          <div className="space-y-1.5 max-h-40 overflow-auto">
            {(app.noteEntries || []).length === 0 && <p className="text-xs text-ink/50 dark:text-white/50">No notes yet.</p>}
            {(app.noteEntries || []).slice().reverse().map(n => (
              <div key={n._id} className="flex items-start justify-between gap-2 bg-paper border-2 border-ink/20 dark:border-white/20 rounded-lg px-3 py-2">
                <div>
                  <div className="text-xs text-ink/80 dark:text-white/80">{n.text}</div>
                  <div className="text-[10px] text-ink/40 dark:text-white/40 mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => deleteNote(n._id)} className="text-ink/30 dark:text-white/30 hover:text-comic-red shrink-0"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note…" onKeyDown={e => e.key === 'Enter' && addNote()} />
            <Button variant="secondary" size="sm" onClick={addNote}>Add</Button>
          </div>
        </Field>
      </div>
    </div>
  );
}

// Mobile card (shown < lg instead of the wide table)
function AppCard({ app, expanded, onToggle, updateStatus, onAppChange }) {
  const files = app.generatedFiles || {};
  return (
    <Card padding="p-0" className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
              <span className="truncate">{app.company}</span>
              {app.link && <a href={app.link} target="_blank" rel="noreferrer" className="text-ink/40 dark:text-white/40 hover:text-accent shrink-0"><ExternalLink size={13} /></a>}
            </div>
            <p className="text-sm text-ink/60 dark:text-white/60 truncate font-sans">{app.role}</p>
          </div>
          <button onClick={onToggle} className="text-ink/40 dark:text-white/40 hover:text-accent shrink-0 p-1 -m-1">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={app.status} onChange={e => updateStatus(app._id, e.target.value)}
            className="text-xs font-bold rounded-lg px-2 py-1 capitalize bg-paper border-2 border-ink dark:border-white/50 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/40">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {((app.atsScore?.before || 0) > 0 || (app.atsScore?.after || 0) > 0) && (
            <Badge color="slate" className="tabular-nums">ATS {app.atsScore?.before}%→{app.atsScore?.after}%</Badge>
          )}
          {app.emailSent
            ? <Badge color="green">Email sent</Badge>
            : app.recruiterEmail ? <Link to={`/resume-builder/email/${app._id}`} className="text-accent text-xs font-medium hover:underline">Send email</Link> : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/50 dark:text-white/50">
          {app.source && <span>{app.source}</span>}
          <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
          {app.followUpDate && <span className={isFollowUpDue(app) ? 'text-ink dark:text-white font-bold' : ''}>Follow-up {new Date(app.followUpDate).toLocaleDateString()}{app.followUpDone ? ' ✓' : ''}</span>}
        </div>

        {(files.pdf || files.docx || files.coverLetter) && (
          <div className="mt-2 flex gap-3 text-xs">
            {files.pdf && <a href={files.pdf} target="_blank" rel="noreferrer" className="text-accent hover:underline">PDF</a>}
            {files.docx && <a href={files.docx} target="_blank" rel="noreferrer" className="text-accent hover:underline">DOCX</a>}
            {files.coverLetter && <a href={files.coverLetter} target="_blank" rel="noreferrer" className="text-accent hover:underline">Cover letter</a>}
          </div>
        )}

        {(app.tags || []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(app.tags || []).map(t => <span key={t} className="text-[10px] bg-paper border border-ink/20 dark:border-white/20 text-ink/70 dark:text-white/70 px-1.5 py-0.5 rounded-full">{t}</span>)}
          </div>
        )}
      </div>
      {expanded && <DetailsPanel app={app} onChange={onAppChange} />}
    </Card>
  );
}

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/applications').then(res => { setApps(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setApps(apps.map(a => a._id === id ? { ...a, status } : a));
    await api.patch(`/applications/${id}`, { status });
  };
  const onAppChange = (updated) => setApps(prev => prev.map(a => a._id === updated._id ? { ...a, ...updated } : a));

  const allTags = useMemo(() => {
    const set = new Set();
    apps.forEach(a => (a.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }, [apps]);

  const filtered = apps.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (tagFilter && !(a.tags || []).includes(tagFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${a.company} ${a.role} ${a.location || ''} ${a.source || ''} ${(a.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const pill = (active) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors border-2 ${
      active ? 'bg-comic-yellow border-ink text-ink' : 'bg-paper border-ink/20 dark:border-white/20 text-ink/70 dark:text-white/70 hover:border-ink dark:hover:border-white/60'
    }`;

  if (loading) return <Loading label="Loading applications…" />;

  return (
    <div>
      <PageHeader title="Applications" subtitle={`${apps.length} tracked`}>
        <Link to="/resume-builder/apply"><Button variant="primary">New application</Button></Link>
      </PageHeader>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-white/40" />
        <Input className="pl-9" placeholder="Search company, role, location, source, or tag…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setFilter('all')} className={pill(filter === 'all')}>All · {apps.length}</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={pill(filter === s)}>{s} · {apps.filter(a => a.status === s).length}</button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-5">
          <span className="text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-white/50">Tags</span>
          <button onClick={() => setTagFilter(null)} className={`px-2.5 py-0.5 rounded-full text-xs font-bold border-2 ${!tagFilter ? 'bg-comic-yellow border-ink text-ink' : 'bg-paper border-ink/20 dark:border-white/20 text-ink/60 dark:text-white/60'}`}>All</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} className={`px-2.5 py-0.5 rounded-full text-xs font-bold border-2 ${tagFilter === t ? 'bg-comic-yellow border-ink text-ink' : 'bg-paper border-ink/20 dark:border-white/20 text-ink/60 dark:text-white/60'}`}>{t}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No applications found" hint="Adjust your filters, or add a new application." />
      ) : (
        <>
        {/* Desktop table */}
        <Card padding="p-0" className="hidden lg:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/50 dark:text-white/50 border-b-2 border-ink/20 dark:border-white/20">
                  <th className="py-3 px-3 w-8"></th>
                  <th className="px-3 font-bold">Company</th>
                  <th className="px-3 font-bold">Role</th>
                  <th className="px-3 font-bold">Source</th>
                  <th className="px-3 font-bold">ATS</th>
                  <th className="px-3 font-bold">Follow-up</th>
                  <th className="px-3 font-bold">Email</th>
                  <th className="px-3 font-bold">Status</th>
                  <th className="px-3 font-bold">Files</th>
                  <th className="px-3 font-bold whitespace-nowrap">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <Fragment key={app._id}>
                    <tr className={`border-b border-ink/10 dark:border-white/10 ${isFollowUpDue(app) ? 'bg-comic-yellow/15' : ''}`}>
                      <td className="px-3">
                        <button onClick={() => setExpanded(expanded === app._id ? null : app._id)} className="text-ink/40 dark:text-white/40 hover:text-accent">
                          {expanded === app._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-bold text-ink dark:text-white">
                        <span className="flex items-center gap-1.5">
                          {app.company}
                          {app.link && <a href={app.link} target="_blank" rel="noreferrer" className="text-ink/40 dark:text-white/40 hover:text-accent"><ExternalLink size={13} /></a>}
                        </span>
                      </td>
                      <td className="px-3 text-ink/70 dark:text-white/70">{app.role}</td>
                      <td className="px-3 text-ink/50 dark:text-white/50 text-xs">{app.source || '—'}</td>
                      <td className="px-3 tabular-nums text-ink/60 dark:text-white/60 whitespace-nowrap">
                        {((app.atsScore?.before || 0) > 0 || (app.atsScore?.after || 0) > 0)
                          ? `${app.atsScore?.before}% → ${app.atsScore?.after}%`
                          : <span className="text-ink/30 dark:text-white/30">—</span>}
                      </td>
                      <td className="px-3">
                        {app.followUpDate
                          ? <span className={`text-xs whitespace-nowrap ${isFollowUpDue(app) ? 'text-ink dark:text-white font-bold' : 'text-ink/60 dark:text-white/60'}`}>{new Date(app.followUpDate).toLocaleDateString()}{app.followUpDone ? ' ✓' : ''}</span>
                          : <span className="text-ink/30 dark:text-white/30 text-xs">—</span>}
                      </td>
                      <td className="px-3">
                        {app.emailSent
                          ? <span className="text-comic-green text-xs font-bold">Sent</span>
                          : app.recruiterEmail
                            ? <Link to={`/resume-builder/email/${app._id}`} className="text-accent text-xs font-medium hover:underline">Send</Link>
                            : <span className="text-ink/30 dark:text-white/30 text-xs">—</span>}
                      </td>
                      <td className="px-3">
                        <select value={app.status} onChange={e => updateStatus(app._id, e.target.value)}
                          className="text-xs font-bold rounded-lg px-2 py-1 capitalize bg-paper border-2 border-ink dark:border-white/50 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/40">
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3">
                        {(app.generatedFiles?.pdf || app.generatedFiles?.docx || app.generatedFiles?.coverLetter) ? (
                          <div className="flex gap-2">
                            {app.generatedFiles?.pdf && <a href={app.generatedFiles.pdf} target="_blank" rel="noreferrer" className="text-accent hover:underline text-xs">PDF</a>}
                            {app.generatedFiles?.docx && <a href={app.generatedFiles.docx} target="_blank" rel="noreferrer" className="text-accent hover:underline text-xs">DOCX</a>}
                            {app.generatedFiles?.coverLetter && <a href={app.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="text-accent hover:underline text-xs">CL</a>}
                          </div>
                        ) : <span className="text-ink/30 dark:text-white/30 text-xs">—</span>}
                      </td>
                      <td className="px-3 text-ink/50 dark:text-white/50 text-xs whitespace-nowrap">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    </tr>
                    {expanded === app._id && (
                      <tr><td colSpan={10} className="p-0"><DetailsPanel app={app} onChange={onAppChange} /></td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {filtered.map(app => (
            <AppCard
              key={app._id}
              app={app}
              expanded={expanded === app._id}
              onToggle={() => setExpanded(expanded === app._id ? null : app._id)}
              updateStatus={updateStatus}
              onAppChange={onAppChange}
            />
          ))}
        </div>
        </>
      )}
    </div>
  );
}
