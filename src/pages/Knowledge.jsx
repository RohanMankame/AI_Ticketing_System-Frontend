import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKnowledgeArticles, searchKnowledge } from '../services/api';

const Knowledge = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const data = await getKnowledgeArticles();
            setArticles(data || []);
        } catch (error) {
            console.error("Failed to fetch knowledge base", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            return fetchArticles();
        }

        try {
            setLoading(true);
            const data = await searchKnowledge(searchQuery);
            // Search returns {score, article} objects, need to map to article
            const results = data.map(item => ({
                ...item.article,
                _score: item.score // Keep score if needed
            }));
            setArticles(results || []);
        } catch (error) {
            console.error("Search failed", error);
            setArticles([]); // Clear on error or ensure empty array
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Explore documentation, guides, and tutorials.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full pl-2 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">
                        {searchQuery ? 'No articles match search' : 'No articles found.'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); fetchArticles(); }}
                            className="text-blue-600 mt-2 hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => navigate(`/knowledge/${article.id}`)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {article.type || "General"}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {article.title}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                {article.content}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-blue-500">
                                    Read more →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Knowledge;
