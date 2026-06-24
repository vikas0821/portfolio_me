import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, FileSearch, Download, Mail, ListPlus, ArrowRight } from 'lucide-react';
import { PageHeader, Card, Button, Field, Input, Select, Textarea, Segmented, Badge } from '../components/ui';

const STATUSES = ['applied', 'replied', 'interview', 'offer', 'rejected', 'ghosted'];
const SOURCES = ['LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Referral', 'AngelList/Wellfound', 'Other'];
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
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Application" subtitle="Generate a tailored résumé, or log one you applied to elsewhere." />

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'generate', label: 'Generate & Apply', icon: FileSearch },
          { value: 'external', label: 'Track External', icon: ListPlus },
        ]}
      />
      {mode === 'external' && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          For jobs you already applied to elsewhere (LinkedIn, Naukri, a company site…). This just logs it — no résumé file is generated.
        </p>
      )}

      <form onSubmit={submit} className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mt-5">
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Job details</h2>

          {mode === 'external' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company *"><Input required value={form.company} onChange={e => update('company', e.target.value)} /></Field>
              <Field label="Role *"><Input required value={form.role} onChange={e => update('role', e.target.value)} /></Field>
              <Field label="Source / Portal">
                <Input list="sources" value={form.source} onChange={e => update('source', e.target.value)} placeholder="LinkedIn, Naukri…" />
                <datalist id="sources">{SOURCES.map(s => <option key={s} value={s} />)}</datalist>
              </Field>
              <Field label="Link"><Input type="url" placeholder="https://…" value={form.link} onChange={e => update('link', e.target.value)} /></Field>
              <Field label="Status"><Select value={form.status} onChange={e => update('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</Select></Field>
              <Field label="Applied date"><Input type="date" value={form.appliedAt} onChange={e => update('appliedAt', e.target.value)} /></Field>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company *"><Input required value={form.company} onChange={e => update('company', e.target.value)} /></Field>
              <Field label="Role *"><Input required value={form.role} onChange={e => update('role', e.target.value)} /></Field>
              <Field label="Location"><Input value={form.location} onChange={e => update('location', e.target.value)} /></Field>
              <Field label="Job ref"><Input value={form.jobRef} onChange={e => update('jobRef', e.target.value)} /></Field>
              <Field label="Recruiter name"><Input value={form.recruiterName} onChange={e => update('recruiterName', e.target.value)} /></Field>
              <Field label="Recruiter email"><Input type="email" value={form.recruiterEmail} onChange={e => update('recruiterEmail', e.target.value)} /></Field>
              <Field label="Tags"><Input placeholder="referral, linkedin" value={form.tags} onChange={e => update('tags', e.target.value)} /></Field>
              <Field label="Follow-up date"><Input type="date" value={form.followUpDate} onChange={e => update('followUpDate', e.target.value)} /></Field>
            </div>
          )}

          {mode === 'generate' && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Résumé variant">
                <Select value={form.resumeVariantId} onChange={e => update('resumeVariantId', e.target.value)}>
                  {resumes.map(r => <option key={r._id} value={r._id}>{r.variantName}{r.isDefault ? ' (default)' : ''}</option>)}
                </Select>
              </Field>
              <Field label="Template">
                <Select value={form.template} onChange={e => update('template', e.target.value)}>
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                </Select>
              </Field>
            </div>
          )}

          <Field label={`Job description${mode === 'external' ? ' (optional)' : ''}`} className="mt-4">
            <Textarea rows={9} value={form.jdText} onChange={e => update('jdText', e.target.value)} placeholder="Paste the job description here…" />
          </Field>

          {mode === 'generate' && (
            <Field label="Cover letter (optional)" className="mt-4">
              <Textarea rows={5} value={form.coverLetter} onChange={e => update('coverLetter', e.target.value)} placeholder="Write or paste a cover letter to attach as a PDF…" />
            </Field>
          )}

          <div className="flex flex-wrap gap-2 mt-5">
            {mode === 'generate' && (
              <Button type="button" variant="secondary" icon={FileSearch} loading={analyzing}
                disabled={!form.jdText || !form.resumeVariantId} onClick={analyze}>
                {analyzing ? 'Analyzing…' : 'Check ATS score'}
              </Button>
            )}
            <Button type="submit" variant="primary" icon={Send} loading={loading}>
              {loading ? 'Saving…' : mode === 'external' ? 'Add to tracker' : 'Generate application'}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {atsPreview && (
            <Card>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-1">ATS match</h2>
              <div className="text-4xl font-bold text-accent tabular-nums">{atsPreview.score}%</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{atsPreview.matched.length} / {atsPreview.total} keywords matched</p>
              {atsPreview.missing.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsPreview.missing.map(kw => <Badge key={kw} color="red">{kw}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          )}

          {result && (
            <Card>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
                {result.application.generatedFiles?.pdf ? 'Application generated' : 'Application added'}
              </h2>
              {result.application.generatedFiles?.pdf && (
                <div className="flex gap-6 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">ATS before</div>
                    <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{result.ats.before.score}%</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">ATS after</div>
                    <div className="text-2xl font-bold tabular-nums text-accent">{result.ats.after.score}%</div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                {result.application.generatedFiles?.pdf && <a href={result.application.generatedFiles.pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline"><Download size={14} /> PDF</a>}
                {result.application.generatedFiles?.docx && <a href={result.application.generatedFiles.docx} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline"><Download size={14} /> DOCX</a>}
                {result.application.generatedFiles?.html && <a href={result.application.generatedFiles.html} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline"><Download size={14} /> HTML</a>}
                {result.application.generatedFiles?.coverLetter && <a href={result.application.generatedFiles.coverLetter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline"><Download size={14} /> Cover letter</a>}
              </div>
              {form.recruiterEmail && (
                <Button variant="success" icon={Mail} className="mt-4 w-full" onClick={() => navigate(`/resume-builder/email/${result.application._id}`)}>
                  Compose &amp; send email
                </Button>
              )}
              <button onClick={() => navigate('/resume-builder/applications')} className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                Go to tracker <ArrowRight size={14} />
              </button>
            </Card>
          )}

          {!atsPreview && !result && (
            <Card className="text-sm text-slate-400 dark:text-slate-500">
              {mode === 'generate'
                ? 'Run an ATS check or generate the application — results show here.'
                : 'Fill in the details and add it to your tracker.'}
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}
