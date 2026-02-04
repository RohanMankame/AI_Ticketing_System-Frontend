import { useState, useEffect } from 'react';
import { getTickets } from '../services/api';

const Dashboard = () => {
  const [counts, setCounts] = useState({ total: 0, open: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tickets = await getTickets();
        const total = tickets.length;
        const open = tickets.filter(t => String(t.status || '').toLowerCase() !== 'done').length;
        setCounts({ total, open });
      } catch (e) {
        console.error('Failed to load tickets for dashboard', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-400">Welcome the AI Ticketing System dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-500">{loading ? '—' : counts.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-2">Open Issues</h3>
          <p className="text-3xl font-bold text-yellow-500">{loading ? '—' : counts.open}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;