import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Star, Trash2, Pencil } from 'lucide-react';

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

  const setDefault = async (id) => {
    await api.post(`/resumes/${id}/default`);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this resume variant?')) return;
    await api.delete(`/resumes/${id}`);
    load();
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resume Variants</h1>
        <button onClick={createNew} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent/90">
          <Plus size={16} /> New Variant
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-white/10 p-8 text-center text-slate-400 dark:text-slate-500">
          No resumes yet. Create your first variant to get started.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {resumes.map(r => (
            <div key={r._id} className="bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {r.variantName}
                    {r.isDefault && <Star size={14} className="text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{r.name || 'Unnamed'} — {r.headline || 'No headline'}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Template: {r.template}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Link to={`/resume-builder/resumes/${r._id}`} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-accent/90">
                  <Pencil size={14} /> Edit
                </Link>
                <button onClick={() => clone(r._id)} className="text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-accent/90">Clone</button>
                {!r.isDefault && (
                  <button onClick={() => setDefault(r._id)} className="text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-accent/90">Set Default</button>
                )}
                <button onClick={() => remove(r._id)} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 ml-auto">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
