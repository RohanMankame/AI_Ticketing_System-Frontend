import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTicket, draftKnowledgeArticle, createKnowledgeArticle, analyzeTicket, getSimilarTickets, suggestSolution, getKnowledgeArticle } from '../services/api';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    // Draft State
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);
    const [draftData, setDraftData] = useState({ title: '', content: '', type: 'solution', tags: '' });
    const [savingDraft, setSavingDraft] = useState(false);

    // Similar Tickets State
    const [similarTickets, setSimilarTickets] = useState([]);
    const [searchingSimilar, setSearchingSimilar] = useState(false);

    // Suggested Solutions State
    const [suggestedSolutions, setSuggestedSolutions] = useState(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Article Modal State
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(false);

    const handleFindSimilar = async () => {
        try {
            setSearchingSimilar(true);
            const similar = await getSimilarTickets(ticketId);
            setSimilarTickets(similar);
        } catch (error) {
            console.error("Failed to fetch similar tickets", error);
        } finally {
            setSearchingSimilar(false);
        }
    };

    const handleFindSolutions = async () => {
        try {
            setLoadingSuggestions(true);
            const suggestions = await suggestSolution(ticketId);
            setSuggestedSolutions(suggestions);
        } catch (error) {
            console.error("Failed to fetch suggested solutions", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleViewArticle = async (articleId) => {
        try {
            setLoadingArticle(true);
            setShowArticleModal(true);
            const article = await getKnowledgeArticle(articleId);
            setSelectedArticle(article);
        } catch (error) {
            console.error("Failed to fetch article details", error);
            alert("Failed to load article details.");
            setShowArticleModal(false);
        } finally {
            setLoadingArticle(false);
        }
    };

    const closeArticleModal = () => {
        setShowArticleModal(false);
        setSelectedArticle(null);
    };

    const onDraftClick = async () => {
        try {
            setDraftLoading(true);
            const draft = await draftKnowledgeArticle([ticket.id]);

            setDraftData({
                title: draft.title || `Knowledge Base Article for Ticket #${ticket.issue_key}`,
                content: draft.content || '',
                type: 'solution',
                tags: ticket.auto_tags || ''
            });
            setIsDrafting(true);
        } catch (error) {
            console.error("Failed to draft article", error);
            alert("Failed to generate draft article");
        } finally {
            setDraftLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setSavingDraft(true);
            // Ensure tags are formatted as a comma-separated string
            const tagsToSend = Array.isArray(draftData.tags)
                ? draftData.tags.join(',')
                : draftData.tags;

            const payload = {
                ...draftData,
                tags: tagsToSend
            };

            const newArticle = await createKnowledgeArticle(payload);
            alert("Article created successfully!");
            navigate(`/knowledge/${newArticle.id}`);
        } catch (error) {
            console.error("Failed to save article", error);
            alert("Failed to save knowledge article");
        } finally {
            setSavingDraft(false);
        }
    };

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await getTicket(ticketId);
                setTicket(data);

                // Auto-analyze if no solution exists, dont need to analyze if solution exists
                if (data && !data.auto_solution) {
                    analyzeTicket(ticketId).then(analysis => {
                        setTicket(prev => ({
                            ...prev,
                            auto_solution: analysis.auto_solution,
                            auto_tags: analysis.auto_tags
                        }));
                    }).catch(err => console.error("Auto-analysis failed", err));
                }
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

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

    return (
        <div className="max-w-6xl mx-auto p-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 transition-colors"
            >
                ← Back to List
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
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
                                <div className="mt-4">
                                    <div className="text-xs text-gray-500 mb-1">Reporter</div>
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

            {/* AI Auto-Analysis Info */}
            {(ticket.auto_solution || ticket.auto_tags) && (
                <div className="bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800 p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        Analysis
                    </h3>

                    {ticket.auto_tags && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(ticket.auto_tags) ? ticket.auto_tags : (ticket.auto_tags || '').split(',')).map((tag, i) => (
                                    tag.trim() && (
                                        <span key={i} className="px-2 py-1 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-md text-xs text-purple-700 dark:text-purple-300 shadow-sm">
                                            #{tag.trim()}
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {ticket.auto_solution && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Solution</h4>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {ticket.auto_solution}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Similar Tickets Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Similar Tickets
                    </h3>
                    <button
                        onClick={handleFindSimilar}
                        disabled={searchingSimilar}
                        className='text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium shadow-md '
                    >
                        {searchingSimilar ? 'Searching...' : 'Find Similar'}
                    </button>
                </div>

                {similarTickets.length > 0 ? (
                    <div className="space-y-3">
                        {similarTickets.map(st => (
                            <a
                                key={st.ticket.id}
                                href={`/tickets/${st.ticket.id}`}
                                className="block p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline mb-1">
                                        {st.ticket.issue_key}: {st.ticket.summary}
                                    </div>
                                    <span className={`text-xs text-white px-2 py-0.5 rounded-full bg-gray-600 text-gray-700`}>
                                        {st.ticket.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                                        {st.ticket.summary || "No description"}
                                    </p>
                                    <span className="text-xs text-gray-400 ml-2" title="Similarity Score">
                                        {Math.round(st.score * 100)}% match
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    searchingSimilar ? (
                        <div className="text-center py-8 text-gray-500">Searching...</div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">Click "Find Similar" to search for related historical tickets.</div>
                    )
                )}
            </div>

            {/* Relevant Knowledge Articles Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Relevant Knowledge Articles
                    </h3>
                    <button
                        onClick={handleFindSolutions}
                        disabled={loadingSuggestions}
                        className='text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium shadow-md '
                    >
                        {loadingSuggestions ? 'Searching...' : 'Find Articles'}
                    </button>
                </div>

                {suggestedSolutions ? (
                    <div className="space-y-6">
                        {/* Relevant Knowledge Articles */}
                        {suggestedSolutions.relevant_knowledge && suggestedSolutions.relevant_knowledge.length > 0 ? (
                            <div>
                                <div className="space-y-3">
                                    {suggestedSolutions.relevant_knowledge.map((item, index) => (
                                        <div
                                            key={item.article.id || index}
                                            onClick={() => handleViewArticle(item.article.id)}
                                            className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                                                    {item.article.title}
                                                </h5>
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                                    {Math.round(item.score * 100)}% match
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                                                {item.article.content}
                                            </p>
                                            <div className="flex gap-2">
                                                {item.article.tags && item.article.tags.map((tag, tagIdx) => (
                                                    <span key={tagIdx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 italic">
                                No relevant articles found.
                            </div>
                        )}

                    </div>
                ) : (
                    loadingSuggestions ? (
                        <div className="text-center py-8 text-gray-500">Searching knowledge base...</div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">Click "Find Articles" to search for relevant knowledge base entries.</div>
                    )
                )}
            </div>

            {/* AI Action Card - Draft Editor */}
            <div className={`rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ${isDrafting ? 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900' : 'bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-300 dark:border-gray-700'}`}>
                {!isDrafting ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
                            📝
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Draft Knowledge Article</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Use AI to generate a knowledge base article based on this ticket's resolution.
                        </p>
                        <button
                            onClick={onDraftClick}
                            disabled={draftLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {draftLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Generating Draft...
                                </>
                            ) : (
                                <>
                                    Generate Draft
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="text-2xl">📝</span> Draft Editor
                            </h2>
                            <button
                                onClick={() => setIsDrafting(false)}
                                className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white transition-all"
                                    value={draftData.title}
                                    onChange={(e) => setDraftData({ ...draftData, title: e.target.value })}
                                    placeholder="Article Title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                                    <select
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white transition-all appearance-none bg-white"
                                        value={draftData.type}
                                        onChange={(e) => setDraftData({ ...draftData, type: e.target.value })}
                                    >
                                        <option value="solution">Solution</option>
                                        <option value="howto">How-To</option>
                                        <option value="guide">Guide</option>
                                        <option value="faq">FAQ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white transition-all"
                                        value={draftData.tags}
                                        onChange={(e) => setDraftData({ ...draftData, tags: e.target.value })}
                                        placeholder="bug, fix, v1.0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Content (Markdown)</label>
                            <textarea
                                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed dark:bg-gray-700 dark:text-white h-96 transition-all resize-y"
                                value={draftData.content}
                                onChange={(e) => setDraftData({ ...draftData, content: e.target.value })}
                                placeholder="Article content in Markdown..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={handleSaveDraft}
                                disabled={savingDraft}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {savingDraft ? 'Saving...' : 'Publish Article'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Knowledge Article Modal */}
            {showArticleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-fadeIn">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex-1 pr-4">
                                {loadingArticle ? (
                                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                                {selectedArticle?.type || 'Article'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                ID: {selectedArticle?.id}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                                            {selectedArticle?.title}
                                        </h2>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={closeArticleModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {loadingArticle ? (
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
                                    <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse mt-6"></div>
                                </div>
                            ) : (
                                selectedArticle && (
                                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {selectedArticle.content}
                                        </div>

                                        {selectedArticle.tags && (
                                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tags</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Array.isArray(selectedArticle.tags) ? selectedArticle.tags : (selectedArticle.tags || '').split(',')).map((tag, i) => (
                                                        tag.trim() && (
                                                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                                                #{tag.trim()}
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                            <button
                                onClick={closeArticleModal}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TicketDetails;
