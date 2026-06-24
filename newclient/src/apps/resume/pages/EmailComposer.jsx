import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Send, Loader2 } from 'lucide-react';

const inputCls = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1';

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

  if (loading || !app) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!email) return <div className="text-slate-500 dark:text-slate-400">Loading email preview...</div>;

  const send = async () => {
    setSending(true);
    try {
      const formats = Object.entries(attachFormats).filter(([, v]) => v).map(([k]) => k);
      await api.post('/email/send', {
        applicationId,
        to: email.to,
        subject: email.subject,
        bodyText: email.bodyText,
        attachFormats: formats,
      });
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Compose Email</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{app.role} at {app.company}</p>
      </div>

      {sent ? (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-4">
          Email sent to {email.to} successfully.
          <div className="mt-2"><Link to="/resume-builder/applications" className="text-slate-900 dark:text-slate-100 hover:underline text-sm">Back to applications</Link></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
          <div>
            <label className={labelCls}>Email Template</label>
            <select className={inputCls} value={templateId} onChange={e => setTemplateId(e.target.value)}>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>To</label>
            <input className={inputCls} value={email.to} onChange={e => setEmail({ ...email, to: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Subject</label>
            <input className={inputCls} value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Body</label>
            <textarea className={inputCls} rows={12} value={email.bodyText} onChange={e => setEmail({ ...email, bodyText: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Preview</label>
            <div className="border rounded-lg p-3 bg-slate-50 dark:bg-[#0f0f0f]/40 text-sm whitespace-pre-wrap">{email.bodyText}</div>
          </div>

          <div>
            <label className={labelCls}>Attachments</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1"><input type="checkbox" checked={attachFormats.pdf} onChange={e => setAttachFormats(a => ({ ...a, pdf: e.target.checked }))} /> Resume (PDF)</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={attachFormats.docx} onChange={e => setAttachFormats(a => ({ ...a, docx: e.target.checked }))} /> Resume (DOCX)</label>
              {app.generatedFiles?.coverLetter && (
                <label className="flex items-center gap-1"><input type="checkbox" checked={attachFormats.coverLetter} onChange={e => setAttachFormats(a => ({ ...a, coverLetter: e.target.checked }))} /> Cover Letter (PDF)</label>
              )}
            </div>
          </div>

          <button onClick={send} disabled={sending || !email.to}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      )}
    </div>
  );
}
