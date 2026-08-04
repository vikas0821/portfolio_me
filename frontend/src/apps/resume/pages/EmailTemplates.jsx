import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Save, Trash2, Star, Mail, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import HtmlBodyEditor from '../components/HtmlBodyEditor';
import { PageHeader, Card, Button, Field, Input, Badge, Loading, EmptyState } from '../components/ui';

const PLACEHOLDERS = ['recruiterName', 'company', 'role', 'location', 'jobRef', 'candidateName', 'candidateHeadline', 'candidateEmail', 'candidatePhone', 'candidateLinkedin', 'topSkills'];

function TemplateCard({ tpl, open, onToggle, allTemplates, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(tpl);
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/email/templates/${tpl._id}`, draft);
      onSaved(res.data);
    } finally {
      setSaving(false);
    }
  };
  const setDefault = async () => {
    await Promise.all(allTemplates.filter(t => t.isDefault && t._id !== tpl._id).map(t => api.put(`/email/templates/${t._id}`, { ...t, isDefault: false })));
    const res = await api.put(`/email/templates/${tpl._id}`, { ...draft, isDefault: true });
    onSaved(res.data);
  };
  const remove = async () => { if (!confirm('Delete this template?')) return; await api.delete(`/email/templates/${tpl._id}`); onDeleted(tpl._id); };

  if (!open) {
    return (
      <Card padding="p-4" className="flex flex-wrap items-center gap-3">
        <button onClick={onToggle} className="text-ink/40 dark:text-white/40 hover:text-accent shrink-0">
          <ChevronRight size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink dark:text-white truncate">{tpl.name}</span>
            {tpl.isDefault && <Badge color="amber" className="gap-1 shrink-0"><Star size={11} className="fill-current" /> Default</Badge>}
          </div>
          <p className="text-xs text-ink/50 dark:text-white/50 truncate font-sans">{tpl.subject}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={onToggle}>Edit</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={remove} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onToggle} className="text-ink/40 dark:text-white/40 hover:text-accent shrink-0">
          <ChevronDown size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <Input className="font-semibold" value={draft.name} onChange={e => set('name', e.target.value)} />
          {draft.isDefault && <Badge color="amber" className="gap-1 shrink-0"><Star size={11} className="fill-current" /> Default</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {!draft.isDefault && <Button variant="ghost" size="sm" icon={Star} onClick={setDefault}>Set default</Button>}
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={remove} />
        </div>
      </div>
      <Field label="Subject"><Input value={draft.subject} onChange={e => set('subject', e.target.value)} /></Field>
      <Field label="Body (HTML)"><HtmlBodyEditor value={draft.bodyHtml} onChange={val => set('bodyHtml', val)} rows={8} /></Field>
    </Card>
  );
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => api.get('/email/templates').then(res => { setTemplates(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const onSaved = () => {
    setOpenId(null);
    load();
  };
  const onDeleted = (id) => {
    setTemplates(prev => prev.filter(t => t._id !== id));
    if (openId === id) setOpenId(null);
  };
  const create = async () => {
    const res = await api.post('/email/templates', {
      name: 'New Template',
      subject: 'Application for {{role}} at {{company}}',
      bodyHtml: '<p>Dear {{recruiterName}},</p><p>…</p>',
    });
    setTemplates(prev => [...prev, res.data]);
    setOpenId(res.data._id);
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
        <div className="space-y-3">
          {templates.map(tpl => (
            <TemplateCard
              key={tpl._id}
              tpl={tpl}
              open={openId === tpl._id}
              onToggle={() => setOpenId(openId === tpl._id ? null : tpl._id)}
              allTemplates={templates}
              onSaved={onSaved}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
