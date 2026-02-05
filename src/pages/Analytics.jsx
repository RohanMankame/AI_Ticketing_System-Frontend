import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getForecast } from '../services/api';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historyDays, setHistoryDays] = useState(30);
    const [forecastDays, setForecastDays] = useState(7);

    useEffect(() => {
        fetchData();
    }, [historyDays, forecastDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getForecast(historyDays, forecastDays);

            // Transform data for chart: Merge history and forecast into uniform structure
            // Each data point will have 'date', 'history' (value or null), and 'forecast' (value or null)
            const historyData = result.history.map(d => ({
                date: d.date,
                history: d.count,
                forecast: null,
                type: 'History'
            }));

            const forecastData = result.forecast.map(d => ({
                date: d.date,
                history: null,
                forecast: d.count,
                type: 'Forecast'
            }));

            const combinedData = [...historyData, ...forecastData];
            combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

            setData({
                chartData: combinedData,
                explanation: result.explanation
            });
        } catch (error) {
            console.error("Failed to fetch forecast", error);
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
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white dark:bg-blue-900 rounded-lg shadow-sm text-2xl">
                                📊
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Forecast Analysis</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {data.explanation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[500px]">
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
