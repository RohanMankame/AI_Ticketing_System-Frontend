import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTicket, analyzeTicket } from '../services/api';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const onAnalyzeClick = async () => {
        try {
            setAnalyzing(true);
            const updatedTicket = await analyzeTicket(ticket.id || ticket.issue_key); // use appropriate ID
            // Since backend takes ticket_id (int usually), we should try both or ensure we have the ID.
            // The getTicket response 'ticket' should have the ID.

            // The backend example provided by user uses `ticket_id` (int). 
            // Our ticket object from `getTicket` has `id`.
            // So ticket.id should be correct if it's an integer ID.

            // Wait, the backend code sample:
            // @tickets_bp.route('/<int:ticket_id>/analyze', methods=['POST'])
            // def analyze_ticket(ticket_id):

            // So we must pass the INT id. `ticket.id` should be it.

            // If updatedTicket is returned, update state
            setTicket(updatedTicket);
        } catch (error) {
            console.error("Failed to analyze ticket", error);
            alert("Failed to analyze ticket");
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await getTicket(ticketId);
                setTicket(data);
            } catch (error) {
                console.error("Failed to fetch ticket details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading ticket details...</div>;
    }

    if (!ticket) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Ticket not found.</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    // Helper to format date
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

    return (
        <div className="max-w-6xl mx-auto p-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 transition-colors"
            >
                ← Back to List
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                {ticket.issue_key}
                            </span>
                            <span className="text-xs text-gray-400">ID: {ticket.id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {ticket.summary}
                        </h1>
                    </div>



                </div>

                {/* Info Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column: Description & Main Details */}

                    <div className="lg:col-span-3 space-y-8">




                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">Issue Type</h4>
                                <div className="text-sm font-medium dark:text-white">{ticket.issue_type || 'Bug'}</div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">Priority</h4>
                                <div className={`text-sm font-medium ${ticket.priority === 'High' ? 'text-red-600' :
                                    ticket.priority === 'Medium' ? 'text-yellow-600' : 'text-blue-600'
                                    }`}>
                                    {ticket.priority}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">Status</h4>
                                <div className="text-sm font-medium dark:text-white">{ticket.status}</div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-1">Resolution</h4>
                                <div className="text-sm font-medium dark:text-white">{ticket.resolution || 'Unresolved'}</div>
                            </div>
                        </div>

                        <div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 prose max-w-none">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Description</h3>
                                {ticket.summary || "No description provided."}
                            </div>
                        </div>

                        {/* AI Analysis Section */}
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <span className="text-6xl">✨</span>
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                                    <span>✨ AI Analysis</span>
                                </h3>
                                <button
                                    onClick={onAnalyzeClick}
                                    disabled={analyzing}
                                    className="text-xs bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 border border-blue-200 dark:border-blue-800 backdrop-blur-sm"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-lg">⚡</span> Analyze Ticket
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Suggested Category</h4>
                                    <div className="text-sm font-medium dark:text-white flex items-center gap-2">
                                        {ticket.auto_category ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {ticket.auto_category}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Not analyzed yet</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Detected Tags</h4>
                                    <div className="text-sm font-medium dark:text-white">
                                        {ticket.auto_tags && ticket.auto_tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(ticket.auto_tags) ? ticket.auto_tags : ticket.auto_tags.split(',')).map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                        #{tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Not analyzed yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Right Column: People & Dates */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">People</h3>

                            <div>
                                <div className="text-xs text-gray-500 mb-1">Assignee</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {ticket.assignee ? ticket.assignee[0] : '?'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium dark:text-white">{ticket.assignee || 'Unassigned'}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500 mt-4 mb-1">Reporter</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                            {ticket.reporter ? ticket.reporter[0] : '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium dark:text-white">{ticket.reporter || 'Unknown'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Dates</h3>

                            <div>
                                <div className="text-xs text-gray-500">Created</div>
                                <div className="text-sm font-medium dark:text-white">{formatDate(ticket.created_at)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500">Updated</div>
                                <div className="text-sm font-medium dark:text-white">{formatDate(ticket.updated_at)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500">Due Date</div>
                                <div className="text-sm font-medium dark:text-white">{formatDate(ticket.due_date)}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
