import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend } from 'recharts';
import { getForecast, getForecastByType } from '../services/api';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [typeData, setTypeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historyDays, setHistoryDays] = useState(30);
    const [forecastDays, setForecastDays] = useState(7);

    useEffect(() => {
        fetchData();
    }, [historyDays, forecastDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [volumeResult, typeResult] = await Promise.all([
                getForecast(historyDays, forecastDays),
                getForecastByType(historyDays, forecastDays)
            ]);

            // --- Process Volume Trend Data ---
            // (Data is now derived from combinedTypeData below to ensure consistency)
            /* 
            const historyData = volumeResult.history.map(d => ({...}));
            const forecastData = volumeResult.forecast.map(d => ({...}));
            const combinedData = [...historyData, ...forecastData];
            */

            // --- Process Forecast By Type Data ---
            /* 
               Each item in typeResult.history/forecast looks like: 
               { date: "2023-10-27", counts: { "Bug": 1, "Support": 2 } }
               We need to flatten this for Recharts:
               { date: "2023-10-27", Bug: 1, Support: 2, type: 'History' }
            */

            const processTypeData = (list, type) => list.map(item => {
                const flatItem = { date: item.date, type };
                if (item.counts) {
                    Object.keys(item.counts).forEach(key => {
                        flatItem[key] = item.counts[key];
                    });
                } else {
                    // Fallback: Assume flat structure (e.g., { date: '...', Bug: 1, Support: 2 })
                    Object.keys(item).forEach(key => {
                        if (key !== 'date') {
                            flatItem[key] = item[key];
                        }
                    });
                }
                return flatItem;
            });

            const typeHistory = processTypeData(typeResult.history, 'History');
            const typeForecast = processTypeData(typeResult.forecast, 'Forecast');

            const combinedTypeData = [...typeHistory, ...typeForecast];
            combinedTypeData.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Derive Total Volume Chart Data from Type Data to ensure consistency
            const derivedVolumeData = combinedTypeData.map(item => {
                // Calculate total count for this day by summing known types
                const total = ['Bug', 'Feature Request', 'Support', 'Task'].reduce((sum, key) => sum + (item[key] || 0), 0);

                return {
                    date: item.date,
                    history: item.type === 'History' ? total : null,
                    forecast: item.type === 'Forecast' ? total : null,
                    type: item.type
                };
            });

            setData({
                chartData: derivedVolumeData,
                explanation: volumeResult.explanation
            });

            setTypeData({
                chartData: combinedTypeData
            });

        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            // Determine which value is active (history or forecast)
            const value = dataPoint.history !== null ? dataPoint.history : dataPoint.forecast;
            const type = dataPoint.history !== null ? 'History' : 'Forecast';

            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{new Date(label).toLocaleDateString()}</p>
                    <p className={`text-sm ${type === 'Forecast' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {type}: {value} Tickets
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered predictive insights for your ticketing system.</p>
                </div>

                {/* Controls */}
                <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">History Days</label>
                        <select
                            value={historyDays}
                            onChange={(e) => setHistoryDays(Number(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={14}>Last 14 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={60}>Last 60 Days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Forecast Days</label>
                        <select
                            value={forecastDays}
                            onChange={(e) => setForecastDays(Number(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value={3}>Next 3 Days</option>
                            <option value={7}>Next 7 Days</option>
                            <option value={14}>Next 14 Days</option>
                            <option value={30}>Next 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm">Generating Prediction...</p>
                    </div>
                </div>
            ) : data ? (
                <>
                    {/* Explanation Card */}
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <div className="flex items-start gap-4">

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Forecast Analysis</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {data.explanation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-75">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ticket Volume Trend</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#ef4444" strokeDasharray="3 3" label="Today" />

                                <Area
                                    type="monotone"
                                    dataKey="history"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorHistory)"
                                    name="History"
                                    connectNulls={true}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorForecast)"
                                    name="Forecast"
                                    connectNulls={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Forecast by Type Chart */}
                    {typeData && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-96">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Forecast by Ticket Type</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#ef4444" strokeDasharray="3 3" />
                                    <Bar dataKey="Bug" stackId="a" fill="#ef4444" name="Bug" />
                                    <Bar dataKey="Feature Request" stackId="a" fill="#3b82f6" name="Feature Request" />
                                    <Bar dataKey="Support" stackId="a" fill="#10b981" name="Support" />
                                    <Bar dataKey="Task" stackId="a" fill="#f59e0b" name="Task" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Failed to load analytics data.
                </div>
            )}
        </div>
    );
};

export default Analytics;
