import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Save, Trash2, Star } from 'lucide-react';
import HtmlBodyEditor from '../components/HtmlBodyEditor';

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

const PLACEHOLDERS = ['recruiterName', 'company', 'role', 'location', 'jobRef', 'candidateName', 'candidateHeadline', 'candidateEmail', 'candidatePhone', 'candidateLinkedin', 'topSkills', 'topSkillsList'];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/email/templates').then(res => { setTemplates(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const update = (id, key, val) => setTemplates(templates.map(t => t._id === id ? { ...t, [key]: val } : t));

  const save = async (tpl) => {
    await api.put(`/email/templates/${tpl._id}`, tpl);
    load();
  };

  const setDefault = async (tpl) => {
    await Promise.all(templates.filter(t => t.isDefault).map(t => api.put(`/email/templates/${t._id}`, { ...t, isDefault: false })));
    await api.put(`/email/templates/${tpl._id}`, { ...tpl, isDefault: true });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this template?')) return;
    await api.delete(`/email/templates/${id}`);
    load();
  };

  const create = async () => {
    await api.post('/email/templates', {
      name: 'New Template',
      subject: 'Application for {{role}} at {{company}}',
      bodyHtml: '<p>Dear {{recruiterName}},</p><p>...</p>',
    });
    load();
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <button onClick={create} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
          <Plus size={16} /> New Template
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300">
        Available placeholders: {PLACEHOLDERS.map(p => `{{${p}}}`).join(', ')}
      </div>

      <div className="space-y-4">
        {templates.map(tpl => (
          <div key={tpl._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 flex-1">
                <input className={inputCls + ' font-semibold'} value={tpl.name} onChange={e => update(tpl._id, 'name', e.target.value)} />
                {tpl.isDefault && <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />}
              </div>
              <div className="flex gap-2 ml-3">
                {!tpl.isDefault && <button onClick={() => setDefault(tpl)} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700">Set Default</button>}
                <button onClick={() => save(tpl)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700"><Save size={14} /> Save</button>
                <button onClick={() => remove(tpl._id)} className="text-red-400 hover:text-red-600 px-2"><Trash2 size={16} /></button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Subject</label>
              <input className={inputCls} value={tpl.subject} onChange={e => update(tpl._id, 'subject', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Body (HTML)</label>
              <HtmlBodyEditor value={tpl.bodyHtml} onChange={val => update(tpl._id, 'bodyHtml', val)} rows={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
