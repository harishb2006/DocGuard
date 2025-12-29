

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart, Activity, HelpCircle, Cloud, Loader2, Lock } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';

interface QueryData {
    question: string;
    user_email: string;
    timestamp: string;
    has_answer: boolean;
}

interface KeywordData {
    text: string;
    value: number;
}

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const { token, isAdmin, loading: authLoading, loginWithGoogle } = useAuth();
    const [recentQueries, setRecentQueries] = useState<QueryData[]>([]);
    const [wordCloudData, setWordCloudData] = useState<KeywordData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!token || !isAdmin) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                const [queriesRes, cloudRes] = await Promise.all([
                    fetch('http://localhost:8000/admin/analytics/queries', { headers }),
                    fetch('http://localhost:8000/admin/analytics/word-cloud', { headers })
                ]);

                if (queriesRes.ok) {
                    const data = await queriesRes.json();
                    setRecentQueries(data.recent_queries || []);
                } else {
                    setError("Failed to fetch queries");
                }

                if (cloudRes.ok) {
                    const data = await cloudRes.json();
                    setWordCloudData(data.words || []);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
                setError("Failed to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isAdmin, authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!token || !isAdmin) {
        return (
            <div className="min-h-screen bg-[#DDE2FF] flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">
                        You need administrator privileges to view this dashboard.
                    </p>
                    <button
                        onClick={loginWithGoogle}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all w-full mb-4"
                    >
                        Sign In with Google
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 font-medium hover:text-slate-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DDE2FF] p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-2 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to Home
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <BarChart className="text-indigo-600" />
                            Admin Analytics Dashboard
                        </h1>
                        <p className="text-slate-600 mt-1">Insights into employee questions and policy gaps.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                    </div>
                ) : error ? (
                    <div className="bg-rose-100 text-rose-800 p-4 rounded-xl text-center font-medium">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Word Cloud / Top Keywords */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white">
                            <div className="flex items-center gap-3 mb-6">
                                <Cloud className="text-indigo-500" />
                                <h2 className="text-xl font-bold text-slate-800">Common Topics (Word Cloud)</h2>
                            </div>

                            <div className="h-80 w-full">
                                {wordCloudData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart data={wordCloudData.slice(0, 10)} layout="vertical" margin={{ left: 40 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="text"
                                                type="category"
                                                width={100}
                                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                                {wordCloudData.slice(0, 10).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        No data available yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Queries List */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="text-emerald-500" />
                                <h2 className="text-xl font-bold text-slate-800">Recent Employee Questions</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-80">
                                {recentQueries.length > 0 ? (
                                    recentQueries.map((q, idx) => (
                                        <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">
                                                    {new Date(q.timestamp).toLocaleDateString()}
                                                </span>
                                                {q.has_answer ? (
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                                        Answered
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                                                        No Answer
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-700 font-medium">"{q.question}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 py-10">
                                        No queries recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-start gap-6">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <HelpCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Why this data matters?</h3>
                            <p className="text-indigo-200 max-w-2xl leading-relaxed">
                                Understanding what employees are asking helps identify gaps in your policy documents.
                                If many people ask about "Remote Work" but get no answer, it might be time to upload a new policy PDF!
                            </p>
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full opacity-50 blur-3xl"></div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPage;
