import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, ArrowRight } from 'lucide-react';
import { PageHeader, Card, Button, Field, Input, Select, Textarea } from '../components/ui';

const STATUSES = ['applied', 'replied', 'interview', 'offer', 'rejected', 'ghosted'];
const SOURCES = ['LinkedIn', 'Naukri', 'Indeed', 'Company Website', 'Referral', 'AngelList/Wellfound', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function Apply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: '', role: '', location: '', jobRef: '',
    recruiterName: '', recruiterEmail: '', jdText: '', coverLetter: '',
    tags: '', followUpDate: '',
    source: '', link: '', status: 'applied', appliedAt: today(),
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/applications', form);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Application" subtitle="Log a job application you applied to." />

      <form onSubmit={submit} className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mt-5">
        <Card>
          <h2 className="font-display text-lg tracking-wide text-ink dark:text-white mb-4">Job details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company *"><Input required value={form.company} onChange={e => update('company', e.target.value)} /></Field>
            <Field label="Role *"><Input required value={form.role} onChange={e => update('role', e.target.value)} /></Field>
            <Field label="Location"><Input value={form.location} onChange={e => update('location', e.target.value)} /></Field>
            <Field label="Job ref"><Input value={form.jobRef} onChange={e => update('jobRef', e.target.value)} /></Field>
            <Field label="Source / Portal">
              <Input list="sources" value={form.source} onChange={e => update('source', e.target.value)} placeholder="LinkedIn, Naukri…" />
              <datalist id="sources">{SOURCES.map(s => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Link"><Input type="url" placeholder="https://…" value={form.link} onChange={e => update('link', e.target.value)} /></Field>
            <Field label="Recruiter name"><Input value={form.recruiterName} onChange={e => update('recruiterName', e.target.value)} /></Field>
            <Field label="Recruiter email"><Input type="email" value={form.recruiterEmail} onChange={e => update('recruiterEmail', e.target.value)} /></Field>
            <Field label="Status"><Select value={form.status} onChange={e => update('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</Select></Field>
            <Field label="Applied date"><Input type="date" value={form.appliedAt} onChange={e => update('appliedAt', e.target.value)} /></Field>
            <Field label="Tags"><Input placeholder="referral, linkedin" value={form.tags} onChange={e => update('tags', e.target.value)} /></Field>
            <Field label="Follow-up date"><Input type="date" value={form.followUpDate} onChange={e => update('followUpDate', e.target.value)} /></Field>
          </div>

          <Field label="Job description (optional)" className="mt-4">
            <Textarea rows={9} value={form.jdText} onChange={e => update('jdText', e.target.value)} placeholder="Paste the job description here…" />
          </Field>

          <Field label="Cover letter (optional)" className="mt-4">
            <Textarea rows={5} value={form.coverLetter} onChange={e => update('coverLetter', e.target.value)} placeholder="Write or paste a cover letter to attach as a PDF…" />
          </Field>

          <div className="flex flex-wrap gap-2 mt-5">
            <Button type="submit" variant="primary" icon={Send} loading={loading}>
              {loading ? 'Saving…' : 'Add to tracker'}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {result ? (
            <Card>
              <h2 className="font-display text-lg tracking-wide text-ink dark:text-white mb-3">Application added</h2>
              <p className="text-sm text-ink/60 dark:text-white/60 font-sans mb-3">
                {result.application.company} — {result.application.role}
              </p>
              <button onClick={() => navigate('/resume-builder/applications')} className="inline-flex items-center gap-1 text-sm font-bold text-ink/60 dark:text-white/60 hover:text-accent transition-colors">
                Go to tracker <ArrowRight size={14} />
              </button>
            </Card>
          ) : (
            <Card className="text-sm text-ink/50 dark:text-white/50 font-sans">
              Fill in the details and add it to your tracker.
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}
