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
        <Card className="mt-6 !border-comic-yellow bg-comic-yellow/15">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} className="text-ink dark:text-white" />
            <h2 className="font-display text-lg tracking-wide text-ink dark:text-white">Follow-ups due ({stats.followUpsDue.length})</h2>
          </div>
          <ul className="divide-y divide-ink/15 dark:divide-white/15">
            {stats.followUpsDue.map(app => (
              <li key={app._id} className="flex justify-between items-center py-2 text-sm">
                <span className="text-ink dark:text-white font-sans">{app.company} — <span className="text-ink/60 dark:text-white/60">{app.role}</span></span>
                <span className="text-ink dark:text-white font-bold tabular-nums">{new Date(app.followUpDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
          <Link to="/resume-builder/applications" className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-ink dark:text-white hover:gap-2 transition-all">
            View applications <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-display text-lg tracking-wide text-ink dark:text-white mb-4">Status breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.counts).map(([status, count]) => (
            <Badge key={status} color={STATUS_BADGE[status] || 'slate'} className="capitalize">
              {status} · {count}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="mt-6" padding="p-0">
        <div className="flex justify-between items-center px-5 py-4 border-b-2 border-ink/15 dark:border-white/15">
          <h2 className="font-display text-lg tracking-wide text-ink dark:text-white">Recent applications</h2>
          <Link to="/resume-builder/applications" className="text-sm font-bold text-accent hover:underline">View all</Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-ink/50 dark:text-white/50 p-8 text-center font-sans">No applications yet. Head to <Link to="/resume-builder/apply" className="text-accent hover:underline">Apply</Link> to create one.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/50 dark:text-white/50 border-b-2 border-ink/15 dark:border-white/15">
                <th className="py-2.5 px-5 font-bold">Company</th>
                <th className="px-3 font-bold">Role</th>
                <th className="px-3 font-bold">Status</th>
                <th className="px-5 font-bold text-right">ATS</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map(app => (
                <tr key={app._id} className="border-b border-ink/10 dark:border-white/10 last:border-0">
                  <td className="py-3 px-5 font-bold text-ink dark:text-white">{app.company}</td>
                  <td className="px-3 text-ink/60 dark:text-white/60">{app.role}</td>
                  <td className="px-3"><Badge color={STATUS_BADGE[app.status] || 'slate'} className="capitalize">{app.status}</Badge></td>
                  <td className="px-5 text-right tabular-nums text-ink/60 dark:text-white/60">{app.atsScore?.before}% → {app.atsScore?.after}%</td>
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
