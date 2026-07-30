import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FileText, CalendarClock, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { PageHeader, Card, StatCard, Badge, Loading, STATUS_BADGE } from '../components/ui';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <Loading label="Loading dashboard…" />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your job search at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={stats.total} icon={FileText} accent />
        <StatCard label="Interviews" value={stats.counts.interview || 0} icon={CalendarClock} />
        <StatCard
          label="Avg ATS lift"
          value={`${stats.atsImprovement >= 0 ? '+' : ''}${stats.atsImprovement}%`}
          sub={`${stats.avgBefore}% → ${stats.avgAfter}%`}
          icon={TrendingUp}
        />
        <StatCard label="Emails sent" value={stats.emailsSent} icon={Mail} />
      </div>

      {stats.followUpsDue.length > 0 && (
        <Card className="mt-6 border-amber-300/70 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} className="text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-300">Follow-ups due ({stats.followUpsDue.length})</h2>
          </div>
          <ul className="divide-y divide-amber-200/60 dark:divide-amber-500/10">
            {stats.followUpsDue.map(app => (
              <li key={app._id} className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-700 dark:text-slate-200">{app.company} — <span className="text-slate-500 dark:text-slate-400">{app.role}</span></span>
                <span className="text-amber-700 dark:text-amber-400 font-medium tabular-nums">{new Date(app.followUpDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
          <Link to="/resume-builder/applications" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:gap-2 transition-all">
            View applications <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Status breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.counts).map(([status, count]) => (
            <Badge key={status} color={STATUS_BADGE[status] || 'slate'} className="capitalize">
              {status} · {count}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="mt-6" padding="p-0">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent applications</h2>
          <Link to="/resume-builder/applications" className="text-sm font-medium text-accent hover:underline">View all</Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 p-8 text-center">No applications yet. Head to <Link to="/resume-builder/apply" className="text-accent hover:underline">Apply</Link> to create one.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                <th className="py-2.5 px-5 font-semibold">Company</th>
                <th className="px-3 font-semibold">Role</th>
                <th className="px-3 font-semibold">Status</th>
                <th className="px-5 font-semibold text-right">ATS</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map(app => (
                <tr key={app._id} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                  <td className="py-3 px-5 font-medium text-slate-800 dark:text-slate-100">{app.company}</td>
                  <td className="px-3 text-slate-500 dark:text-slate-400">{app.role}</td>
                  <td className="px-3"><Badge color={STATUS_BADGE[app.status] || 'slate'} className="capitalize">{app.status}</Badge></td>
                  <td className="px-5 text-right tabular-nums text-slate-500 dark:text-slate-400">{app.atsScore?.before}% → {app.atsScore?.after}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
