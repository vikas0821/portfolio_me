import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ChevronDown, ChevronRight, Trash2, FileText, Download, ExternalLink } from 'lucide-react';

const STATUSES = ['applied', 'replied', 'interview', 'offer', 'rejected', 'ghosted'];

const STATUS_COLORS = {
  applied: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  replied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-purple-100 text-purple-700',
};

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

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

  const saveTags = async () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const updated = (await api.patch(`/applications/${app._id}`, { tags })).data;
    onChange(updated);
  };

  const saveSource = async () => {
    const updated = (await api.patch(`/applications/${app._id}`, { source: sourceInput.trim() })).data;
    onChange(updated);
  };

  const saveLink = async () => {
    const updated = (await api.patch(`/applications/${app._id}`, { link: linkInput.trim() })).data;
    onChange(updated);
  };

  const saveFollowUp = async (extra = {}) => {
    const updated = (await api.patch(`/applications/${app._id}`, { followUpDate: followUpDate || null, ...extra })).data;
    onChange(updated);
  };

  const saveCoverLetter = async () => {
    setSavingCover(true);
    try {
      const updated = (await api.post(`/applications/${app._id}/cover-letter`, { text: coverLetter })).data;
      onChange(updated);
    } finally {
      setSavingCover(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const updated = (await api.post(`/applications/${app._id}/notes`, { text: noteText })).data;
    onChange(updated);
    setNoteText('');
  };

  const deleteNote = async (noteId) => {
    const updated = (await api.delete(`/applications/${app._id}/notes/${noteId}`)).data;
    onChange(updated);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 border-t dark:border-gray-700">
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Tags</label>
          <div className="flex gap-2">
            <input className={inputCls} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="referral, linkedin" />
            <button onClick={saveTags} className="text-sm px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 shrink-0">Save</button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Source / Portal</label>
          <div className="flex gap-2">
            <input className={inputCls} value={sourceInput} onChange={e => setSourceInput(e.target.value)} placeholder="LinkedIn, Naukri..." />
            <button onClick={saveSource} className="text-sm px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 shrink-0">Save</button>
          </div>
        </div>

        <div>
          <label className={labelCls}>Link</label>
          <div className="flex gap-2">
            <input className={inputCls} value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="https://..." />
            <button onClick={saveLink} className="text-sm px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 shrink-0">Save</button>
            {app.link && (
              <a href={app.link} target="_blank" rel="noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0 flex items-center"><ExternalLink size={16} /></a>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Follow-up Date</label>
          <div className="flex gap-2 items-center">
            <input type="date" className={inputCls} value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
            <button onClick={() => saveFollowUp()} className="text-sm px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 shrink-0">Save</button>
            {app.followUpDate && (
              <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 shrink-0">
                <input type="checkbox" checked={!!app.followUpDone} onChange={e => saveFollowUp({ followUpDone: e.target.checked })} /> Done
              </label>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Job Description</label>
          {app.jdText ? (
            <pre className="text-xs whitespace-pre-wrap bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 max-h-48 overflow-auto">{app.jdText}</pre>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">No job description saved.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelCls}>Cover Letter</label>
          <textarea className={inputCls} rows={6} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Write or paste a cover letter..." />
          <div className="flex items-center gap-3 mt-2">
            <button onClick={saveCoverLetter} disabled={savingCover} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50">
              <FileText size={14} /> {savingCover ? 'Saving...' : 'Save & Generate PDF'}
            </button>
            {app.generatedFiles?.coverLetter && (
              <a href={app.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:underline">
                <Download size={14} /> View PDF
              </a>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <div className="space-y-1 max-h-32 overflow-auto">
            {(app.noteEntries || []).length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500">No notes yet.</p>}
            {(app.noteEntries || []).slice().reverse().map(n => (
              <div key={n._id} className="flex items-start justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                <div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">{n.text}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => deleteNote(n._id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input className={inputCls} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()} />
            <button onClick={addNote} className="text-sm px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 shrink-0">Add</button>
          </div>
        </div>
      </div>
    </div>
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

  const onAppChange = (updated) => {
    setApps(prev => prev.map(a => a._id === updated._id ? { ...a, ...updated } : a));
  };

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
      const haystack = `${a.company} ${a.role} ${a.location || ''} ${a.source || ''} ${(a.tags || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Applications</h1>

      <input
        className={inputCls}
        placeholder="Search by company, role, location, source, or tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-xs font-medium ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>All ({apps.length})</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium ${filter === s ? 'bg-gray-900 text-white' : STATUS_COLORS[s]}`}>
            {s} ({apps.filter(a => a.status === s).length})
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">Tags:</span>
          <button onClick={() => setTagFilter(null)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${!tagFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}>All</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagFilter === t ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}>{t}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500">No applications found.</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-2 px-3"></th>
                <th className="px-3">Company</th>
                <th className="px-3">Role</th>
                <th className="px-3">Source</th>
                <th className="px-3">ATS</th>
                <th className="px-3">Tags</th>
                <th className="px-3">Follow-up</th>
                <th className="px-3">Email</th>
                <th className="px-3">Status</th>
                <th className="px-3">Files</th>
                <th className="px-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <Fragment key={app._id}>
                  <tr className={`border-t dark:border-gray-700 ${isFollowUpDue(app) ? 'bg-amber-50 dark:bg-amber-950/30' : ''}`}>
                    <td className="px-3">
                      <button onClick={() => setExpanded(expanded === app._id ? null : app._id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300">
                        {expanded === app._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className="py-2 px-3 font-medium">
                      <span className="flex items-center gap-1.5">
                        {app.company}
                        {app.link && (
                          <a href={app.link} target="_blank" rel="noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><ExternalLink size={13} /></a>
                        )}
                      </span>
                    </td>
                    <td className="px-3">{app.role}</td>
                    <td className="px-3 text-gray-500 dark:text-gray-400 text-xs">{app.source || '—'}</td>
                    <td className="px-3">{app.atsScore?.before}% → {app.atsScore?.after}%</td>
                    <td className="px-3">
                      <div className="flex flex-wrap gap-1">
                        {(app.tags || []).map(t => <span key={t} className="text-[10px] bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-3">
                      {app.followUpDate ? (
                        <span className={`text-xs ${isFollowUpDue(app) ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                          {new Date(app.followUpDate).toLocaleDateString()}{app.followUpDone ? ' ✓' : ''}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3">
                      {app.emailSent ? (
                        <span className="text-green-600 text-xs">Sent</span>
                      ) : app.recruiterEmail ? (
                        <Link to={`/resume-builder/email/${app._id}`} className="text-gray-900 dark:text-gray-100 text-xs hover:underline">Send</Link>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3">
                      <select value={app.status} onChange={e => updateStatus(app._id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${STATUS_COLORS[app.status]}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3">
                      <div className="flex gap-2">
                        {app.generatedFiles?.pdf && <a href={app.generatedFiles.pdf} target="_blank" rel="noreferrer" className="text-gray-900 dark:text-gray-100 hover:underline text-xs">PDF</a>}
                        {app.generatedFiles?.docx && <a href={app.generatedFiles.docx} target="_blank" rel="noreferrer" className="text-gray-900 dark:text-gray-100 hover:underline text-xs">DOCX</a>}
                        {app.generatedFiles?.coverLetter && <a href={app.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="text-gray-900 dark:text-gray-100 hover:underline text-xs">CL</a>}
                      </div>
                    </td>
                    <td className="px-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                  {expanded === app._id && (
                    <tr>
                      <td colSpan={11} className="p-0">
                        <DetailsPanel app={app} onChange={onAppChange} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
