import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTicket } from '../services/api';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

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
