import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Save, Trash2, Star, Mail } from 'lucide-react';
import HtmlBodyEditor from '../components/HtmlBodyEditor';
import { PageHeader, Card, Button, Field, Input, Badge, Loading, EmptyState } from '../components/ui';

const PLACEHOLDERS = ['recruiterName', 'company', 'role', 'location', 'jobRef', 'candidateName', 'candidateHeadline', 'candidateEmail', 'candidatePhone', 'candidateLinkedin', 'topSkills'];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/email/templates').then(res => { setTemplates(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const update = (id, key, val) => setTemplates(templates.map(t => t._id === id ? { ...t, [key]: val } : t));
  const save = async (tpl) => { await api.put(`/email/templates/${tpl._id}`, tpl); load(); };
  const setDefault = async (tpl) => {
    await Promise.all(templates.filter(t => t.isDefault).map(t => api.put(`/email/templates/${t._id}`, { ...t, isDefault: false })));
    await api.put(`/email/templates/${tpl._id}`, { ...tpl, isDefault: true });
    load();
  };
  const remove = async (id) => { if (!confirm('Delete this template?')) return; await api.delete(`/email/templates/${id}`); load(); };
  const create = async () => {
    await api.post('/email/templates', {
      name: 'New Template',
      subject: 'Application for {{role}} at {{company}}',
      bodyHtml: '<p>Dear {{recruiterName}},</p><p>…</p>',
    });
    load();
  };

  if (loading) return <Loading label="Loading templates…" />;

  return (
    <div>
      <PageHeader title="Email Templates" subtitle="Reusable, mail-merged messages for recruiters.">
        <Button variant="primary" icon={Plus} onClick={create}>New Template</Button>
      </PageHeader>

      <Card padding="p-4" className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-white/50 mb-2">Available placeholders</p>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map(p => <code key={p} className="text-xs px-2 py-0.5 rounded-md bg-paper border-2 border-ink/30 dark:border-white/30 text-accent">{`{{${p}}}`}</code>)}
        </div>
      </Card>

      {templates.length === 0 ? (
        <EmptyState icon={Mail} title="No templates yet" hint="Create one to speed up recruiter outreach." action={<Button variant="primary" icon={Plus} onClick={create}>New Template</Button>} />
      ) : (
        <div className="space-y-4">
          {templates.map(tpl => (
            <Card key={tpl._id} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                  <Input className="font-semibold" value={tpl.name} onChange={e => update(tpl._id, 'name', e.target.value)} />
                  {tpl.isDefault && <Badge color="amber" className="gap-1 shrink-0"><Star size={11} className="fill-current" /> Default</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {!tpl.isDefault && <Button variant="ghost" size="sm" icon={Star} onClick={() => setDefault(tpl)}>Set default</Button>}
                  <Button variant="primary" size="sm" icon={Save} onClick={() => save(tpl)}>Save</Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => remove(tpl._id)} />
                </div>
              </div>
              <Field label="Subject"><Input value={tpl.subject} onChange={e => update(tpl._id, 'subject', e.target.value)} /></Field>
              <Field label="Body (HTML)"><HtmlBodyEditor value={tpl.bodyHtml} onChange={val => update(tpl._id, 'bodyHtml', val)} rows={8} /></Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
