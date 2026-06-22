import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, FileSearch, Download, Mail, ListPlus } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';
const STATUSES = ['applied', 'replied', 'interview', 'offer', 'rejected', 'ghosted'];
const SOURCES = ['LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Referral', 'AngelList/Wellfound', 'Other'];

function Field({ label, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} {...props} />
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

export default function Apply() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('generate'); // 'generate' | 'external'
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({
    company: '', role: '', location: '', jobRef: '',
    recruiterName: '', recruiterEmail: '', jdText: '',
    resumeVariantId: '', template: '',
    tags: '', followUpDate: '', coverLetter: '',
    source: '', link: '', status: 'applied', appliedAt: today(),
  });
  const [atsPreview, setAtsPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api.get('/resumes').then(res => {
      setResumes(res.data);
      const def = res.data.find(r => r.isDefault) || res.data[0];
      if (def) setForm(f => ({ ...f, resumeVariantId: def._id, template: def.template }));
    });
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const analyze = async () => {
    if (!form.jdText || !form.resumeVariantId) return;
    setAnalyzing(true);
    try {
      const res = await api.post('/ats/analyze', { jdText: form.jdText, resumeId: form.resumeVariantId });
      setAtsPreview(res.data);
    } finally {
      setAnalyzing(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = mode === 'external'
        ? { ...form, resumeVariantId: '' }
        : { ...form, source: '', status: undefined, appliedAt: undefined };
      const res = await api.post('/applications', payload);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Application</h1>

      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${mode === 'generate' ? 'bg-gray-900 text-white' : 'border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <FileSearch size={16} /> Generate Resume & Apply
        </button>
        <button type="button" onClick={() => setMode('external')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${mode === 'external' ? 'bg-gray-900 text-white' : 'border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <ListPlus size={16} /> Track External Application
        </button>
      </div>
      {mode === 'external' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          For jobs you already applied to elsewhere (LinkedIn, Naukri, a company site, etc.). This just logs it for tracking — no resume file is generated.
        </p>
      )}

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="font-semibold">Job Details</h2>

          {mode === 'external' ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company *" required value={form.company} onChange={e => update('company', e.target.value)} />
              <Field label="Role *" required value={form.role} onChange={e => update('role', e.target.value)} />
              <div>
                <label className={labelCls}>Source / Portal</label>
                <input className={inputCls} list="sources" value={form.source} onChange={e => update('source', e.target.value)} placeholder="LinkedIn, Naukri..." />
                <datalist id="sources">
                  {SOURCES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <Field label="Link" type="url" placeholder="https://..." value={form.link} onChange={e => update('link', e.target.value)} />
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={e => update('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="Applied Date" type="date" value={form.appliedAt} onChange={e => update('appliedAt', e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company *" required value={form.company} onChange={e => update('company', e.target.value)} />
              <Field label="Role *" required value={form.role} onChange={e => update('role', e.target.value)} />
              <Field label="Location" value={form.location} onChange={e => update('location', e.target.value)} />
              <Field label="Job Ref" value={form.jobRef} onChange={e => update('jobRef', e.target.value)} />
              <Field label="Recruiter Name" value={form.recruiterName} onChange={e => update('recruiterName', e.target.value)} />
              <Field label="Recruiter Email" type="email" value={form.recruiterEmail} onChange={e => update('recruiterEmail', e.target.value)} />
              <Field label="Tags (comma separated)" placeholder="referral, linkedin" value={form.tags} onChange={e => update('tags', e.target.value)} />
              <Field label="Follow-up Date" type="date" value={form.followUpDate} onChange={e => update('followUpDate', e.target.value)} />
            </div>
          )}

          {mode === 'generate' && (
            <>
              <div>
                <label className={labelCls}>Resume Variant</label>
                <select className={inputCls} value={form.resumeVariantId} onChange={e => update('resumeVariantId', e.target.value)}>
                  {resumes.map(r => <option key={r._id} value={r._id}>{r.variantName}{r.isDefault ? ' (default)' : ''}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Template</label>
                <select className={inputCls} value={form.template} onChange={e => update('template', e.target.value)}>
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelCls}>Job Description {mode === 'external' && '(optional)'}</label>
            <textarea className={inputCls} rows={10} value={form.jdText} onChange={e => update('jdText', e.target.value)} placeholder="Paste the job description here..." />
          </div>

          {mode === 'generate' && (
            <div>
              <label className={labelCls}>Cover Letter (optional)</label>
              <textarea className={inputCls} rows={6} value={form.coverLetter} onChange={e => update('coverLetter', e.target.value)} placeholder="Write or paste a cover letter to attach as a PDF..." />
            </div>
          )}

          <div className="flex gap-2">
            {mode === 'generate' && (
              <button type="button" onClick={analyze} disabled={analyzing || !form.jdText || !form.resumeVariantId}
                className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                <FileSearch size={16} /> {analyzing ? 'Analyzing...' : 'Check ATS Score'}
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50">
              <Send size={16} /> {loading ? 'Saving...' : mode === 'external' ? 'Add to Tracker' : 'Generate Application'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {atsPreview && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-2">ATS Match (current resume)</h2>
              <div className="text-3xl font-bold">{atsPreview.score}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{atsPreview.matched.length} / {atsPreview.total} keywords matched</div>
              {atsPreview.missing.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Missing keywords:</div>
                  <div className="flex flex-wrap gap-1">
                    {atsPreview.missing.map(kw => <span key={kw} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{kw}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <h2 className="font-semibold">{result.application.generatedFiles?.pdf ? 'Application Generated' : 'Application Added'}</h2>
              {result.application.generatedFiles?.pdf && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">ATS Before</div>
                    <div className="text-xl font-bold">{result.ats.before.score}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">ATS After</div>
                    <div className="text-xl font-bold">{result.ats.after.score}%</div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {result.application.generatedFiles?.pdf && <a href={result.application.generatedFiles.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:underline"><Download size={14} /> PDF</a>}
                {result.application.generatedFiles?.docx && <a href={result.application.generatedFiles.docx} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:underline"><Download size={14} /> DOCX</a>}
                {result.application.generatedFiles?.html && <a href={result.application.generatedFiles.html} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:underline"><Download size={14} /> HTML</a>}
                {result.application.generatedFiles?.coverLetter && <a href={result.application.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 hover:underline"><Download size={14} /> Cover Letter</a>}
              </div>
              {form.recruiterEmail && (
                <button onClick={() => navigate(`/resume-builder/email/${result.application._id}`)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                  <Mail size={16} /> Compose & Send Email to Recruiter
                </button>
              )}
              <button onClick={() => navigate('/resume-builder/applications')} className="text-sm text-gray-900 dark:text-gray-100 hover:underline">Go to Applications tracker</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
