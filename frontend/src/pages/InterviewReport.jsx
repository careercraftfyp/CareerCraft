import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle, AlertCircle, Loader2, ArrowLeft,
    BarChart3, MessageSquare, Target, Zap, Activity, Mic, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function InterviewReport() {
    const { sessionId } = useParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchReport = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const res = await fetch(`${API_URL}/interviews/${sessionId}/report`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 202) {
                    // Still processing
                    if (isMounted) {
                        setTimeout(() => {
                            fetchReport(); // Poll again in 3 seconds
                        }, 3000);
                    }
                    return;
                }

                if (!res.ok) throw new Error('Failed to fetch report');

                const data = await res.json();
                if (isMounted) {
                    setReport(data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        };

        fetchReport();

        return () => { isMounted = false; };
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <Loader2 className="w-12 h-12 text-brand animate-spin mb-6" />
                    <h2 className="text-content-base text-xl font-bold uppercase tracking-widest mb-2">Analyzing Neural Patterns</h2>
                    <p className="text-content-muted mb-8">Processing audio transcript and evaluating responses...</p>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 15 }} // Show after 15 seconds of waiting
                    >
                        <p className="text-content-muted text-sm mb-4">This is taking longer than expected...</p>
                        <Link to="/dashboard" className="text-brand hover:text-content-base text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Return to Command Center
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    if (error && !report) {
        return (
            <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-400">{error}</p>
                </div>
                <Link to="/dashboard" className="btn-primary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-base py-20 px-6 relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-glow blur-[120px] rounded-full" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-content-muted hover:text-content-base mb-8 transition-colors text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" /> Return to Base
                </Link>

                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-xs font-black uppercase tracking-[0.2em] mb-4"
                    >
                        <CheckCircle className="w-4 h-4" /> Assessment Complete
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-content-base tracking-tighter mb-4 uppercase"
                    >
                        Performance <span className="gradient-text">Report</span>
                    </motion.h1>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Overall Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-bento p-8 shadow-xl border-white/5 flex flex-col items-center justify-center text-center md:col-span-1"
                    >
                        <Target className="w-8 h-8 text-brand mb-4" />
                        <h3 className="text-content-muted text-xs font-black uppercase tracking-widest mb-2">Overall Score</h3>
                        <div className="text-6xl font-black text-content-base">{report.overallScore}%</div>
                    </motion.div>

                    {/* Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-bento p-6 shadow-xl border-white/5 md:col-span-2 flex flex-col justify-center space-y-6"
                    >
                        <div>
                            <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                                <span className="text-content-base flex items-center gap-2"><MessageSquare className="w-4 h-4 text-brand" /> Communication</span>
                                <span className="text-content-base">{report.communicationScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-card rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${report.communicationScore}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-brand"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                                <span className="text-content-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-secondary-400" /> Content Relevance</span>
                                <span className="text-content-base">{report.contentRelevanceScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-card rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${report.contentRelevanceScore}%` }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="h-full bg-secondary-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl"
                    >
                        <h3 className="text-emerald-500 text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Zap className="w-5 h-5" /> Key Strengths
                        </h3>
                        <ul className="space-y-4">
                            {report.strengths.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                    <span className="text-content-base text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Areas for Improvement */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl"
                    >
                        <h3 className="text-amber-400 text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5" /> Areas For Improvement
                        </h3>
                        <ul className="space-y-4">
                            {report.improvements.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
                                    <span className="text-content-base text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Acoustic Analysis (if available) */}
                {report.acousticAnalysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="mt-6 card-bento p-8 shadow-xl border-white/5"
                    >
                        <h3 className="text-content-muted text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-brand" /> Acoustic Voice Analysis
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                    <Activity className="w-4 h-4 text-brand" /> Speech Rate
                                </div>
                                <div className="text-2xl font-black text-content-base">{report.acousticAnalysis.estimated_syllables_per_minute} <span className="text-xs text-content-muted">syl/min</span></div>
                                <div className="text-sm text-content-muted mt-1">{report.acousticAnalysis.speech_rate_category}</div>
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                    <Zap className="w-4 h-4 text-secondary-400" /> Voice Tone
                                </div>
                                <div className="text-lg font-black text-content-base leading-tight mt-1">{report.acousticAnalysis.tone_analysis}</div>
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                    <Clock className="w-4 h-4 text-amber-400" /> Hesitations
                                </div>
                                <div className="text-2xl font-black text-content-base">{report.acousticAnalysis.pauses_detected} <span className="text-xs text-content-muted">pauses</span></div>
                                <div className="text-sm text-content-muted mt-1">{report.acousticAnalysis.long_hesitations > 0 ? `${report.acousticAnalysis.long_hesitations} long hesitations` : 'No long hesitations'}</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* AI Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 card-bento p-8 shadow-xl border-white/5"
                >
                    <h3 className="text-content-muted text-xs font-black uppercase tracking-widest mb-4">AI Interviewer Feedback</h3>
                    <p className="text-content-base text-lg font-medium leading-relaxed italic">
                        "{report.feedback}"
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
