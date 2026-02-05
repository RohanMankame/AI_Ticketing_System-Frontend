import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKnowledgeArticle } from '../services/api';

const KnowledgeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const data = await getKnowledgeArticle(id);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArticle();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <p className="text-gray-500 mb-4">Article not found.</p>
                <button
                    onClick={() => navigate('/knowledge')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Knowledge Base
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 transition-colors group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </button>

            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type: {article.type ? article.type.toUpperCase() : "ARTICLE"}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                        {article.title}
                    </h1>

                    <div className="flex items-start gap-2 mt-4">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mt-1">Tags:</span>
                        {article.tags && article.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tag, i) => (
                                    <span key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-md shadow-sm">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 italic">No tags</span>
                        )}
                    </div>
                </div>

                <div className="p-8 prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                        {article.content}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default KnowledgeDetails;
