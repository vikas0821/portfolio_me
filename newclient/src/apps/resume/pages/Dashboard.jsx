import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  applied: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  replied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-purple-100 text-purple-700',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={stats.total} />
        <StatCard label="Interviews" value={stats.counts.interview || 0} />
        <StatCard label="Avg ATS Improvement" value={`${stats.atsImprovement >= 0 ? '+' : ''}${stats.atsImprovement}%`} sub={`${stats.avgBefore}% → ${stats.avgAfter}%`} />
        <StatCard label="Emails Sent" value={stats.emailsSent} />
      </div>

      {stats.followUpsDue.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl shadow-sm p-5 border border-amber-200 dark:border-amber-800">
          <h2 className="font-semibold mb-3 text-amber-800 dark:text-amber-300">Follow-ups Due ({stats.followUpsDue.length})</h2>
          <ul className="space-y-1">
            {stats.followUpsDue.map(app => (
              <li key={app._id} className="flex justify-between text-sm">
                <span>{app.company} — {app.role}</span>
                <span className="text-amber-700 dark:text-amber-400">{new Date(app.followUpDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
          <Link to="/resume-builder/applications" className="text-sm text-amber-800 dark:text-amber-300 hover:underline mt-2 inline-block">View applications →</Link>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold mb-3">Status Breakdown</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.counts).map(([status, count]) => (
            <span key={status} className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-900'}`}>
              {status}: {count}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Recent Applications</h2>
          <Link to="/resume-builder/applications" className="text-sm text-gray-900 dark:text-gray-100 hover:underline">View all</Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No applications yet. Go to Apply to create one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="py-2">Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>ATS</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map(app => (
                <tr key={app._id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2">{app.company}</td>
                  <td>{app.role}</td>
                  <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span></td>
                  <td>{app.atsScore?.before}% → {app.atsScore?.after}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
