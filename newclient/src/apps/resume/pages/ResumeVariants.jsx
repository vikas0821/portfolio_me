import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Star, Trash2, Pencil, Copy, Layers, FileText } from 'lucide-react';
import { PageHeader, Card, Button, Badge, EmptyState, Loading } from '../components/ui';

const BLANK_RESUME = {
  variantName: 'New Resume',
  template: 'classic',
  name: '', headline: '', email: '', phone: '', location: '', linkedin: '',
  summary: '', skills: [], certifications: [], projects: [], employment: [],
  experience: [], education: [], languages: '', gender: '', nationality: '',
};

export default function ResumeVariants() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => api.get('/resumes').then(res => { setResumes(res.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const createNew = async () => {
    const name = prompt('Name for this resume variant (e.g. "Backend Focused")', 'New Resume');
    if (!name) return;
    const res = await api.post('/resumes', { ...BLANK_RESUME, variantName: name });
    navigate(`/resume-builder/resumes/${res.data._id}`);
  };

  const clone = async (id) => {
    const full = (await api.get(`/resumes/${id}`)).data;
    const name = prompt('Name for the cloned variant', `${full.variantName} (copy)`);
    if (!name) return;
    delete full._id; delete full.createdAt; delete full.updatedAt; delete full.__v;
    full.variantName = name;
    full.isDefault = false;
    const res = await api.post('/resumes', full);
    navigate(`/resume-builder/resumes/${res.data._id}`);
  };

  const setDefault = async (id) => { await api.post(`/resumes/${id}/default`); load(); };
  const remove = async (id) => {
    if (!confirm('Delete this resume variant?')) return;
    await api.delete(`/resumes/${id}`); load();
  };

  if (loading) return <Loading label="Loading resumes…" />;

  return (
    <div>
      <PageHeader title="Resume Variants" subtitle="Tailor different versions of your résumé for different roles.">
        <Button variant="primary" icon={Plus} onClick={createNew}>New Variant</Button>
      </PageHeader>

      {resumes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No résumés yet"
          hint="Create your first variant to start applying."
          action={<Button variant="primary" icon={Plus} onClick={createNew}>New Variant</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {resumes.map(r => (
            <Card key={r._id} className="flex flex-col group hover:border-accent/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{r.variantName}</span>
                    {r.isDefault && <Badge color="amber" className="gap-1"><Star size={11} className="fill-current" /> Default</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{r.name || 'Unnamed'} — {r.headline || 'No headline'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">{r.template} template</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button variant="secondary" size="sm" icon={Pencil} onClick={() => navigate(`/resume-builder/resumes/${r._id}`)}>Edit</Button>
                <Button variant="ghost" size="sm" icon={Copy} onClick={() => clone(r._id)}>Clone</Button>
                {!r.isDefault && <Button variant="ghost" size="sm" icon={Star} onClick={() => setDefault(r._id)}>Set default</Button>}
                <Button variant="danger" size="sm" icon={Trash2} className="ml-auto" onClick={() => remove(r._id)} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
