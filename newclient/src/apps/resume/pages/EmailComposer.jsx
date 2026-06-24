import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Loading } from '../components/ui';

export default function EmailComposer() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [email, setEmail] = useState(null);
  const [attachFormats, setAttachFormats] = useState({ pdf: true, docx: false, coverLetter: false });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function load() {
      const [appRes, tplRes] = await Promise.all([
        api.get(`/applications/${applicationId}`),
        api.get('/email/templates'),
      ]);
      setApp(appRes.data);
      setTemplates(tplRes.data);
      const def = tplRes.data.find(t => t.isDefault) || tplRes.data[0];
      if (def) setTemplateId(def._id);
      setLoading(false);
    }
    load();
  }, [applicationId]);

  useEffect(() => {
    if (!templateId) return;
    api.post('/email/preview', { applicationId, templateId }).then(res => setEmail(res.data));
  }, [templateId, applicationId]);

  if (loading || !app) return <Loading label="Loading…" />;
  if (!email) return <Loading label="Loading preview…" />;

  const send = async () => {
    setSending(true);
    try {
      const formats = Object.entries(attachFormats).filter(([, v]) => v).map(([k]) => k);
      await api.post('/email/send', { applicationId, to: email.to, subject: email.subject, bodyText: email.bodyText, attachFormats: formats });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Compose email" subtitle={`${app.role} at ${app.company}`} />

      {sent ? (
        <Card className="border-emerald-300/70 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 size={18} /> Email sent to {email.to}
          </div>
          <Link to="/resume-builder/applications" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:gap-2 transition-all">
            Back to applications <ArrowRight size={14} />
          </Link>
        </Card>
      ) : (
        <Card className="space-y-4">
          <Field label="Email template">
            <Select value={templateId} onChange={e => setTemplateId(e.target.value)}>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </Select>
          </Field>
          <Field label="To"><Input value={email.to} onChange={e => setEmail({ ...email, to: e.target.value })} /></Field>
          <Field label="Subject"><Input value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })} /></Field>
          <Field label="Body"><Textarea rows={12} value={email.bodyText} onChange={e => setEmail({ ...email, bodyText: e.target.value })} /></Field>

          <Field label="Attachments">
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={attachFormats.pdf} onChange={e => setAttachFormats(a => ({ ...a, pdf: e.target.checked }))} /> Résumé (PDF)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={attachFormats.docx} onChange={e => setAttachFormats(a => ({ ...a, docx: e.target.checked }))} /> Résumé (DOCX)</label>
              {app.generatedFiles?.coverLetter && (
                <label className="flex items-center gap-2"><input type="checkbox" checked={attachFormats.coverLetter} onChange={e => setAttachFormats(a => ({ ...a, coverLetter: e.target.checked }))} /> Cover letter (PDF)</label>
              )}
            </div>
          </Field>

          <Button variant="success" icon={Send} loading={sending} disabled={!email.to} onClick={send}>
            {sending ? 'Sending…' : 'Send email'}
          </Button>
        </Card>
      )}
    </div>
  );
}
