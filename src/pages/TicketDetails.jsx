import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTickets } from '../services/api';

const TicketDetails = () => {
    const { state } = useLocation();
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(state?.ticket || null);
    const [loading, setLoading] = useState(!state?.ticket);

    useEffect(() => {
        if (!ticket) {
            const fetchTicket = async () => {
                try {
                    // Fallback: Fetch all tickets and find the one with the matching ID/Key
                    // In a real app, you'd implement GET /tickets/:id
                    const allTickets = await getTickets();
                    const foundTicket = allTickets.find(t =>
                        String(t.id) === ticketId || t.issue_key === ticketId
                    );

                    if (foundTicket) {
                        setTicket(foundTicket);
                    } else {
                        // Handle not found
                        console.error("Ticket not found");
                    }
                } catch (error) {
                    console.error("Failed to fetch ticket details", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTicket();
        }
    }, [ticketId, ticket]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading ticket details...</div>;
    }

    if (!ticket) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Ticket not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
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
                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">#{ticket.issue_key}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${ticket.status === 'Done' ? 'bg-green-100 text-green-800 border-green-200' :
                                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                            {ticket.summary}
                        </h1>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                        {ticket.priority} Priority
                    </span>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                Description
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                                {ticket.summary || "No description provided."}
                            </div>
                        </div>

                        {/* Additional Sections could go here (e.g., Comments, Activity) */}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Assignee
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        {ticket.assignee ? ticket.assignee.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {ticket.assignee || "Unassigned"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Created
                                </h3>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Due Date
                                </h3>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                    {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
