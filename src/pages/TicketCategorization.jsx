import { useState, useEffect } from 'react';
import { getTicketTags, getTicketsByTag } from '../services/api';
import { Tag, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TicketCategorization = () => {
    const navigate = useNavigate();
    const [tags, setTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(true);
    const [selectedTag, setSelectedTag] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const data = await getTicketTags();
                setTags(data.tags || []);
                // Select first tag by default if available
                if (data.tags && data.tags.length > 0) {
                    setSelectedTag(data.tags[0].tag);
                }
            } catch (err) {
                console.error("Failed to fetch tags:", err);
                setError("Failed to load tags.");
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        if (!selectedTag) return;

        const fetchTickets = async () => {
            setLoadingTickets(true);
            try {
                const data = await getTicketsByTag(selectedTag);
                setTickets(data.tickets || []);
            } catch (err) {
                console.error("Failed to fetch tickets for tag:", err);
                setTickets([]); // Clear tickets on error or keep previous? Clearing seems safer to indicate state
            } finally {
                setLoadingTickets(false);
            }
        };

        fetchTickets();
    }, [selectedTag]);

    if (loadingTags) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <Loader className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Categorization</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Explore tickets grouped by automatically identified tags.
                </p>
            </div>

            {/* Tags Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-500" />
                    Available Tags
                </h2>
                <div className="flex flex-wrap gap-3">
                    {tags.map((item) => (
                        <button
                            key={item.tag}
                            onClick={() => setSelectedTag(item.tag)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full border transition-colors ${selectedTag === item.tag
                                ? 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-100'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <span className="font-medium capitalize">{item.tag}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedTag === item.tag
                                ? 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100'
                                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                }`}>
                                {item.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    Tickets tagged with "{selectedTag}"
                </h2>

                {loadingTickets ? (
                    <div className="flex justify-center p-12">
                        <Loader className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">#{ticket.id}</span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${ticket.priority === 'High' || ticket.priority === 'Critical'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                            : ticket.priority === 'Medium'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${['Resolved', 'Closed'].includes(ticket.status)
                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {ticket.summary}
                                </h3>
                                {ticket.auto_solution && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                        <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span><span className="font-semibold">Suggested Solution:</span> {ticket.auto_solution}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No tickets found for this tag.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketCategorization;
