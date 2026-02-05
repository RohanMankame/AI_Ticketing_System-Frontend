import { useState, useEffect } from 'react';
import { getTickets } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, avgTime: 'N/A' });
    const [statusData, setStatusData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const tickets = await getTickets();

                // Basic Stats
                const total = tickets.length;
                const open = tickets.filter(t => !['done', 'resolved', 'closed'].includes(String(t.status || '').toLowerCase())).length;
                const resolved = total - open;

                setStats({ total, open, resolved });

                // Status Distribution for Pie Chart
                const statusCounts = tickets.reduce((acc, t) => {
                    const status = t.status || 'Unknown';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                const sData = Object.keys(statusCounts).map(key => ({
                    name: key,
                    value: statusCounts[key]
                }));
                setStatusData(sData);

                // Priority Distribution for Bar Chart
                const priorityCounts = tickets.reduce((acc, t) => {
                    const priority = t.priority || 'None';
                    acc[priority] = (acc[priority] || 0) + 1;
                    return acc;
                }, {});

                // Ensure consistent order if possible, or just map
                const pData = Object.keys(priorityCounts).map(key => ({
                    name: key,
                    count: priorityCounts[key]
                }));
                setPriorityData(pData);

            } catch (e) {
                console.error('Failed to load tickets for dashboard', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your ticket system performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Tickets</p>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</h3>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-600 cursor-pointer" onClick={() => navigate('/tickets')}>
                        View all tickets →
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Open Issues</p>
                        <h3 className="text-4xl font-bold text-yellow-600 mt-2">{stats.open}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Requires attention</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Resolved</p>
                        <h3 className="text-4xl font-bold text-green-600 mt-2">{stats.resolved}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-4"> Completed tickets</p>
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Detailed Status Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tickets by Priority</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={priorityData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                                <YAxis tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50}>
                                    {
                                        priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'High' || entry.name === 'Critical' ? '#ef4444' :
                                                    entry.name === 'Medium' ? '#f59e0b' :
                                                        '#3b82f6'
                                            } />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;