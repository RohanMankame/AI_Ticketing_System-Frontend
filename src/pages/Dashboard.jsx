const Dashboard = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome the AI Ticketing System dashboard.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg mb-2">Total Tickets</h3>
                    <p className="text-3xl font-bold text-blue-600">124</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg mb-2">Open Issues</h3>
                    <p className="text-3xl font-bold text-yellow-500">45</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg mb-2">Resolved Today</h3>
                    <p className="text-3xl font-bold text-green-500">12</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
