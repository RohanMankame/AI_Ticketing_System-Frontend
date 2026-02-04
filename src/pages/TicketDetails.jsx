import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTicket, analyzeTicket, suggestSolution, getSimilarTickets } from '../services/api';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    // New state for Suggestions and Similar Tickets
    const [suggestion, setSuggestion] = useState(null);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);

    const [similarTickets, setSimilarTickets] = useState(null);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

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

    const onGenerateSolutionClick = async () => {
        try {
            setLoadingSuggestion(true);
            const data = await suggestSolution(ticket.id);
            setSuggestion(data);
        } catch (error) {
            console.error("Failed to get suggestion", error);
            alert("Failed to get AI suggestion");
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const onFindSimilarClick = async () => {
        try {
            setLoadingSimilar(true);
            const data = await getSimilarTickets(ticket.id);
            setSimilarTickets(data);
        } catch (error) {
            console.error("Failed to get similar tickets", error);
            alert("Failed to find similar tickets");
        } finally {
            setLoadingSimilar(false);
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

            {/* AI Analysis Dashboard Card */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="text-6xl">✨</span>
                    </div>

                    <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 relative z-10">
                        <span>✨ AI Analysis Dashboard</span>
                    </h2>

                    <button
                        onClick={onAnalyzeClick}
                        disabled={analyzing}
                        className="relative z-10 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                        {analyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <span>⚡</span> Analyze Ticket
                            </>
                        )}
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category & Tags */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 h-full">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-blue-500">🏷️</span> Classification
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Suggested Category</h4>
                                    <div className="text-sm font-medium dark:text-white">
                                        {ticket.auto_category ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {ticket.auto_category}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Not analyzed yet</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Detected Tags</h4>
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
                                            <span className="text-gray-400 italic">Not analyzed yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Tickets */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="text-teal-500">🔄</span> Similar Tickets
                            </h3>
                            {ticket.auto_category && !similarTickets && (
                                <button
                                    onClick={onFindSimilarClick}
                                    disabled={loadingSimilar}
                                    className="text-xs text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition-colors font-medium border border-teal-200"
                                >
                                    {loadingSimilar ? 'Searching...' : 'Find Similar'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            {!ticket.auto_category ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-2 min-h-[100px]">
                                    <span className="text-2xl opacity-20">🔒</span>
                                    <span className="text-xs">Analyze ticket to unlock</span>
                                </div>
                            ) : !similarTickets ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-sm min-h-[100px]">
                                    Click 'Find Similar' to search
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    {similarTickets.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No similar tickets found.</p>
                                    ) : (
                                        similarTickets.map((simTicket) => (
                                            <div
                                                key={simTicket.id}
                                                onClick={() => navigate(`/tickets/${simTicket.id}`)}
                                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer transition-colors group shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-gray-500 group-hover:text-teal-600 transition-colors">{simTicket.issue_key || `ID: ${simTicket.id}`}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${simTicket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {simTicket.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                                                    {simTicket.summary}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggested Solution - Full Width below */}
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="text-purple-500">💡</span> Suggested Solution
                            </h3>
                            {ticket.auto_category && !suggestion && (
                                <button
                                    onClick={onGenerateSolutionClick}
                                    disabled={loadingSuggestion}
                                    className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg transition-colors font-medium border border-purple-200"
                                >
                                    {loadingSuggestion ? 'Generating...' : 'Generate Ticket Solution'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            {!ticket.auto_category ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 space-y-2 min-h-[100px]">
                                    <span className="text-2xl opacity-20">🔒</span>
                                    <span className="text-xs">Analyze ticket to unlock</span>
                                </div>
                            ) : !suggestion ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-sm min-h-[100px]">
                                    Click 'Generate Ticket Solution' to get AI suggestions
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap shadow-sm leading-relaxed">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Analysis Result</h4>
                                        {suggestion.ai_suggestion?.suggested_solution || "No solution provided."}
                                    </div>

                                    {suggestion.ai_suggestion?.relevant_links && suggestion.ai_suggestion.relevant_links.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommended Actions & Docs</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                {suggestion.ai_suggestion.relevant_links.map((link, idx) => (
                                                    <li key={idx}>
                                                        {link}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {suggestion.relevant_knowledge && suggestion.relevant_knowledge.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Relevant Knowledge Base Articles</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {suggestion.relevant_knowledge.map((doc, idx) => (
                                                    <a key={idx} href={doc.article?.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors group">
                                                        <span className="text-xl">📄</span>
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600 group-hover:underline line-clamp-1">
                                                                {doc.article?.title || doc.title || "Untitled Article"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                                {doc.article?.content ? doc.article.content.substring(0, 80) + "..." : (doc.page_content ? doc.page_content.substring(0, 80) + "..." : "No preview available")}
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
