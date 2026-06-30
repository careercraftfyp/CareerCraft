import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Bell, FileText, Video, Target, Activity,
    Download, ChevronDown, BarChart2, User, Settings, LogOut, ArrowRight, ArrowLeft, Brain, Zap, Sparkles, Sun, Moon, TrendingUp, TrendingDown, Menu, X, Cpu, CheckCircle, Shield, AlertCircle, MessageSquare, BarChart3, Mic, Clock
} from 'lucide-react';
import Logo from '../components/Logo';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ResumeUpload from './ResumeUpload';
import Profile from './Profile';
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';
import PracticeHub from './PracticeHub';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('Overview');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview', 'history', or 'interview_history'

    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [liveStats, setLiveStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [pendingDrills, setPendingDrills] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && window.innerWidth < 1024) {
                // Keep menu open logic primarily handled by overlay
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const res = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch stats');
                const data = await res.json();
                setLiveStats(data);
            } catch (err) {
                console.error('Stats fetch error:', err);
            } finally {
                setLoadingStats(false);
            }
        };
        const fetchPendingDrills = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const res = await fetch(`${API_URL}/training/drills`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const pending = (data.drills || []).filter(d => d.status !== 'completed').length;
                    setPendingDrills(pending);
                }
            } catch (err) { /* Non-critical */ }
        };
        if (activeTab === 'Overview' || activeTab === 'Interview Prep') { fetchStats(); fetchPendingDrills(); }
        if (activeTab === 'Resume Analyzer' && history.length === 0) fetchHistory();
        if (activeTab === 'Interview Prep' && interviewHistory.length === 0) fetchInterviewHistory();
    }, [activeTab]);

    useEffect(() => {
        if (viewMode === 'interview_history' && interviewHistory.length === 0) {
            fetchInterviewHistory();
        }
    }, [viewMode]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    const tabs = [
        { name: 'Overview', icon: BarChart2, description: 'Stats & Progression' },
        { name: 'Resume Analyzer', icon: FileText, description: 'ATS Optimization' },
        { name: 'Interview Prep', icon: Video, description: 'AI Mock Sessions' },
        { name: 'Training Hub', icon: Zap, description: 'Skill Acquisition' },
    ];

    const AnimatedValue = ({ value, className, loading }) => (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.span
                    key="loader"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-block"
                >
                    <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
                </motion.span>
            ) : (
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={className}
                >
                    {value}
                </motion.span>
            )}
        </AnimatePresence>
    );

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_URL}/resumes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch history');
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error('History fetch error:', err);
        }
    };

    const fetchInterviewHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_URL}/interviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch interview history');
            const data = await res.json();
            const completed = (data || []).filter(i => i.status === 'completed');
            setInterviewHistory(completed);
        } catch (err) {
            console.error('Interview history fetch error:', err);
        }
    };


    const renderHistory = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => {
                        setViewMode('overview');
                        setSelectedResume(null);
                        setActiveTab('Overview');
                    }}
                    className="flex items-center gap-2 text-content-muted hover:text-content-base transition-colors font-bold uppercase tracking-widest text-[10px] bg-surface-base px-4 py-2 rounded-xl border border-stroke shadow-sm"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Overview
                </button>
            </div>

            {selectedResume ? (
                <ResumeAnalysisResult result={selectedResume} onReset={() => setSelectedResume(null)} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((resume) => (
                        <motion.div
                            key={resume.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSelectedResume(resume)}
                            className="card-bento p-6 cursor-pointer group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-24 h-24 text-content-base" />
                            </div>
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="p-3 rounded-2xl bg-brand-glow text-brand group-hover:-translate-y-1 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-content-base italic tracking-tighter">{resume.analysis.overall_score}</div>
                                    <div className="text-[10px] text-content-muted font-bold uppercase tracking-[0.2em] mt-1">ATS Score</div>
                                </div>
                            </div>
                            <div className="mb-auto">
                                <h4 className="font-bold text-content-base truncate mb-1 group-hover:text-brand transition-colors text-lg tracking-tight">{resume.file_name}</h4>
                                <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest mb-4">
                                    Analyzed on {new Date(resume.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-stroke relative z-10 mt-6">
                                <span className="px-3 py-1.5 rounded-lg bg-surface-hover text-[10px] text-brand font-bold uppercase tracking-[0.1em] border border-stroke">
                                    {resume.analysis.field_of_expertise}
                                </span>
                                <ArrowRight className="w-5 h-5 text-content-muted group-hover:translate-x-1 group-hover:text-brand transition-all" />
                            </div>
                        </motion.div>
                    ))}
                    {history.length === 0 && (
                        <div className="col-span-full py-32 text-center card-bento border-dashed flex flex-col items-center justify-center gap-4 bg-transparent border-2 border-stroke">
                            <div className="w-16 h-16 rounded-3xl bg-surface-hover flex items-center justify-center text-content-muted border border-stroke">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-content-muted font-bold tracking-[0.2em] uppercase text-xs">No resumes archived in the neural core</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderInterviewHistory = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 print:hidden">
                <button
                    onClick={() => {
                        setViewMode('overview');
                        setSelectedInterview(null);
                        setActiveTab('Overview');
                    }}
                    className="flex items-center gap-2 text-content-muted hover:text-content-base transition-colors font-bold uppercase tracking-widest text-[10px] bg-surface-base px-4 py-2 rounded-xl border border-stroke shadow-sm cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview
                </button>
            </div>

            {selectedInterview ? (
                <div className="space-y-8 max-w-4xl mx-auto relative z-10 print:max-w-full print:mx-0 print:p-0">
                    <div className="flex justify-between items-center mb-4 print:hidden">
                        <button
                            onClick={() => setSelectedInterview(null)}
                            className="inline-flex items-center gap-2 text-content-muted hover:text-content-base transition-colors text-sm font-bold uppercase tracking-wider cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Return to Archives
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 text-content-muted hover:text-brand transition-colors text-sm font-bold uppercase tracking-wider cursor-pointer bg-surface-base px-4 py-2 rounded-xl border border-stroke shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                    </div>

                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-xs font-black uppercase tracking-[0.2em] mb-4"
                        >
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Assessment Complete
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-content-base tracking-tighter mb-4 uppercase"
                        >
                            Performance <span className="gradient-text">Report</span>
                        </motion.h1>
                        <p className="text-content-muted font-bold text-sm uppercase tracking-widest">
                            {selectedInterview.job_role} • {selectedInterview.job_field}
                        </p>
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
                            <div className="text-6xl font-black text-content-base">
                                {selectedInterview.evaluation?.overallScore || selectedInterview.overall_score}%
                            </div>
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
                                    <span className="text-content-base flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-brand" /> Communication
                                    </span>
                                    <span className="text-content-base">
                                        {selectedInterview.evaluation?.communicationScore || 0}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-surface-card rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedInterview.evaluation?.communicationScore || 0}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-brand"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-2">
                                    <span className="text-content-base flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-content-muted" /> Content Relevance
                                    </span>
                                    <span className="text-content-base">
                                        {selectedInterview.evaluation?.contentRelevanceScore || 0}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-surface-card rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${selectedInterview.evaluation?.contentRelevanceScore || 0}%` }}
                                        transition={{ duration: 1, delay: 0.6 }}
                                        className="h-full bg-content-muted"
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
                                {(selectedInterview.evaluation?.strengths || []).map((item, i) => (
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
                                {(selectedInterview.evaluation?.improvements || []).map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
                                        <span className="text-content-base text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Acoustic Analysis (if available) */}
                    {selectedInterview.evaluation?.acousticAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="card-bento p-8 shadow-xl border-white/5"
                        >
                            <h3 className="text-content-muted text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Mic className="w-4 h-4 text-brand" /> Acoustic Voice Analysis
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                        <Activity className="w-4 h-4 text-brand" /> Speech Rate
                                    </div>
                                    <div className="text-2xl font-black text-content-base">
                                        {selectedInterview.evaluation.acousticAnalysis.estimated_syllables_per_minute}{' '}
                                        <span className="text-xs text-content-muted">syl/min</span>
                                    </div>
                                    <div className="text-sm text-content-muted mt-1">
                                        {selectedInterview.evaluation.acousticAnalysis.speech_rate_category}
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                        <Zap className="w-4 h-4 text-secondary-400" /> Voice Tone
                                    </div>
                                    <div className="text-lg font-black text-content-base leading-tight mt-1">
                                        {selectedInterview.evaluation.acousticAnalysis.tone_analysis}
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2 mb-2 text-content-base font-bold text-sm uppercase tracking-wider">
                                        <Clock className="w-4 h-4 text-amber-400" /> Hesitations
                                    </div>
                                    <div className="text-2xl font-black text-content-base">
                                        {selectedInterview.evaluation.acousticAnalysis.pauses_detected}{' '}
                                        <span className="text-xs text-content-muted">pauses</span>
                                    </div>
                                    <div className="text-sm text-content-muted mt-1">
                                        {selectedInterview.evaluation.acousticAnalysis.long_hesitations > 0
                                            ? `${selectedInterview.evaluation.acousticAnalysis.long_hesitations} long hesitations`
                                            : 'No long hesitations'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Feedback */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="card-bento p-8 shadow-xl border-white/5"
                    >
                        <h3 className="text-content-muted text-xs font-black uppercase tracking-widest mb-4">AI Interviewer Feedback</h3>
                        <p className="text-content-base text-lg font-medium leading-relaxed italic">
                            "{selectedInterview.evaluation?.feedback || selectedInterview.feedback}"
                        </p>
                    </motion.div>


                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviewHistory.map((interview) => (
                        <motion.div
                            key={interview.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSelectedInterview(interview)}
                            className="card-bento p-6 cursor-pointer group relative overflow-hidden flex flex-col h-full hover:border-indigo-500/30 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Video className="w-24 h-24 text-content-base" />
                            </div>
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:-translate-y-1 transition-transform border border-indigo-500/20">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-content-base italic tracking-tighter">
                                        {interview.evaluation?.overallScore || interview.overall_score}%
                                    </div>
                                    <div className="text-[10px] text-content-muted font-bold uppercase tracking-[0.2em] mt-1">Overall</div>
                                </div>
                            </div>
                            <div className="mb-auto">
                                <h4 className="font-bold text-content-base truncate mb-1 group-hover:text-indigo-400 transition-colors text-lg tracking-tight">
                                    {interview.job_role}
                                </h4>
                                <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest mb-4">
                                    Conducted on {new Date(interview.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-stroke relative z-10 mt-6">
                                <span className="px-3 py-1.5 rounded-lg bg-surface-hover text-[10px] text-indigo-400 font-bold uppercase tracking-[0.1em] border border-stroke">
                                    {interview.difficulty} • {interview.mode}
                                </span>
                                <ArrowRight className="w-5 h-5 text-content-muted group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                    {interviewHistory.length === 0 && (
                        <div className="col-span-full py-32 text-center card-bento border-dashed flex flex-col items-center justify-center gap-4 bg-transparent border-2 border-stroke">
                            <div className="w-16 h-16 rounded-3xl bg-surface-hover flex items-center justify-center text-content-muted border border-stroke">
                                <Video className="w-8 h-8 text-indigo-400" />
                            </div>
                            <p className="text-content-muted font-bold tracking-[0.2em] uppercase text-xs">No mock sessions archived in the neural core</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderOverview = () => {
        const resumesGrowth = liveStats?.growth?.resumes ?? 0;
        const atsGrowth = liveStats?.growth?.atsScore ?? 0;

        return (
            <div className="space-y-6">
                {viewMode === 'history' ? renderHistory() : viewMode === 'interview_history' ? renderInterviewHistory() : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-max">
                        {/* Welcome Hero - Span 8 */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 card-bento bg-surface-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-glow blur-[100px] rounded-full pointer-events-none -mt-32 -mr-32" />
                            <div className="flex-1 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-glow text-brand font-bold text-[10px] uppercase tracking-widest mb-4 border border-brand/20">
                                    <Zap className="w-3 h-3 fill-current" /> System Online
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-content-base mb-3 tracking-tight">
                                    Welcome back,<br /><span className="text-brand">{userName}</span>
                                </h2>
                                <p className="text-content-muted font-medium mb-8 max-w-md leading-relaxed text-sm">
                                    Your neural training is calculating at peak efficiency. You are fully on track to dominate the upcoming technical evaluations.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={() => setActiveTab('Training Hub')} className="btn-primary shadow-lg shadow-brand-glow hover:-translate-y-1 w-full sm:w-auto">
                                        Launch Training Sequence <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                    <button onClick={() => window.print()} className="px-6 py-3 rounded-xl border border-stroke text-content-base font-bold hover:bg-surface-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full sm:w-auto bg-surface-base">
                                        <Download className="w-4 h-4" /> Export Report
                                    </button>
                                </div>
                            </div>
                            <div className="relative w-40 h-40 shrink-0 z-10 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-[10px] border-surface-hover" />
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="80" cy="80" r="70"
                                        fill="transparent" stroke="var(--brand)"
                                        strokeWidth="10" strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * parseInt(liveStats?.trainingProgress || 0)) / 100}
                                        className="transition-all duration-1000 ease-out" strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-content-base italic">
                                        <AnimatedValue value={liveStats?.trainingProgress || '0%'} loading={loadingStats} />
                                    </span>
                                    <span className="text-[9px] font-bold text-content-muted uppercase tracking-widest">Mastery</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stat 1 - Total Resumes - Span 4 */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            onClick={() => { fetchHistory(); setViewMode('history'); }}
                            className="lg:col-span-4 card-bento p-6 flex flex-col bg-surface-card hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-auto relative z-10">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform border border-blue-500/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 font-bold text-sm bg-surface-base px-2 py-1 rounded-lg border border-stroke ${resumesGrowth >= 0 ? 'text-brand' : 'text-red-500'}`}>
                                    {resumesGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span>{Math.abs(resumesGrowth)}</span>
                                </div>
                            </div>
                            <div className="mt-8 relative z-10">
                                <h3 className="text-5xl font-black text-content-base tracking-tighter mb-1">
                                    <AnimatedValue value={liveStats?.totalResumes ?? '0'} loading={loadingStats} />
                                </h3>
                                <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em]">Archived Resumes</p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <FileText className="w-32 h-32 text-content-base" />
                            </div>
                        </motion.div>

                        {/* Chart 1 - ATS Trend - Span 7 */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-7 card-bento p-6 flex flex-col bg-surface-card min-h-[350px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-brand" />
                                    <h3 className="font-bold text-lg text-content-base tracking-tight">ATS Score Progression</h3>
                                </div>
                                <div className={`flex items-center gap-1.5 font-bold text-xs bg-brand-glow text-brand px-3 py-1.5 rounded-lg border border-brand/20`}>
                                    {atsGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span>{Math.abs(atsGrowth)}% vs Last Period</span>
                                </div>
                            </div>
                            {(!liveStats?.atsTrend || liveStats.atsTrend.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-base rounded-xl border border-dashed border-stroke">
                                    <FileText className="w-10 h-10 text-content-muted mb-3" />
                                    <p className="text-content-base font-medium text-sm leading-relaxed">Submit a resume to the <span className="text-brand">Analyzer</span><br />to start tracking progression.</p>
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-full min-h-[250px] -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={liveStats?.atsTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--stroke)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                                            <YAxis stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} fontWeight="bold" />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--stroke)', borderRadius: '12px', color: 'var(--content-base)', fontWeight: 'bold' }} itemStyle={{ color: 'var(--brand)' }} />
                                            <Area type="monotone" dataKey="score" stroke="var(--brand)" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </motion.div>

                        {/* Small Stat Stack - Span 5 */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            {/* Total Interviews */}
                            <motion.div 
                                onClick={() => {
                                    setViewMode('interview_history');
                                    setSelectedInterview(null);
                                    setActiveTab('Overview');
                                }}
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: 0.3 }} 
                                className="card-bento p-6 flex-1 bg-surface-card flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 active:scale-[0.98] transition-all"
                            >
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 font-bold uppercase tracking-widest text-[10px] mb-4 w-fit">
                                        <Video className="w-3 h-3" /> Sessions
                                    </div>
                                    <h3 className="text-4xl font-black text-content-base tracking-tighter">
                                        <AnimatedValue value={liveStats?.totalInterviews ?? '0'} loading={loadingStats} />
                                    </h3>
                                </div>
                                <div className="w-16 h-16 rounded-full border-[6px] border-indigo-500/20 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-indigo-500" />
                                </div>
                            </motion.div>

                            {/* Avg ATS */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card-bento p-6 flex-1 bg-surface-card flex items-center justify-between group">
                                <div>
                                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-bold uppercase tracking-widest text-[10px] mb-4 w-fit">
                                        <Target className="w-3 h-3" /> Average Score
                                    </div>
                                    <h3 className="text-4xl font-black text-content-base tracking-tighter">
                                        <AnimatedValue value={liveStats?.avgAtsScore ?? '0'} loading={loadingStats} />
                                        <span className="text-lg text-content-muted ml-0.5"> </span>
                                    </h3>
                                </div>
                                <div className="w-16 h-16 rounded-full border-[6px] border-amber-500/20 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-amber-500" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Interview Overview - Span 12 */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-12 card-bento p-6 bg-surface-card h-[350px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-5 h-5 text-indigo-500" />
                                    <h3 className="font-bold text-lg text-content-base tracking-tight">Interview Readiness Metrics</h3>
                                </div>
                            </div>
                            {(!liveStats?.interviewScores || liveStats.interviewScores.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-base rounded-xl border border-dashed border-stroke">
                                    <Video className="w-10 h-10 text-content-muted mb-3" />
                                    <p className="text-content-base font-medium text-sm leading-relaxed">Launch an <span className="text-indigo-500">AI Mock Interview</span><br />to unlock comprehensive skill dimensions.</p>
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-full min-h-[200px] mt-4 -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={liveStats?.interviewScores} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--stroke)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                                            <YAxis stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} fontWeight="bold" />
                                            <Tooltip cursor={{ fill: 'var(--surface-hover)', opacity: 0.8 }} contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--stroke)', borderRadius: '12px', fontWeight: 'bold' }} />
                                            <Bar dataKey="score" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                                {liveStats?.interviewScores?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['var(--brand)', '#8b5cf6', '#3b82f6', '#f59e0b'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </motion.div>

                        {/* Pending Drills Banner — Only shown if there are incomplete drills */}
                        {pendingDrills > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                className="lg:col-span-12 card-bento p-6 bg-surface-card flex items-center justify-between gap-6 border-brand/30 bg-brand/5 hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
                                        <Zap className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-content-base tracking-tight">
                                            {pendingDrills} Pending Drill{pendingDrills !== 1 ? 's' : ''} Waiting
                                        </h4>
                                        <p className="text-xs text-content-muted font-medium mt-0.5">
                                            AI-generated practice exercises are ready for you in the Training Hub.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('Training Hub')}
                                    className="btn-primary shrink-0 whitespace-nowrap"
                                >
                                    Go to Practice Hub <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return renderOverview();
            case 'Resume Analyzer':
                return (
                    <div className="space-y-12 pb-16">
                        <ResumeUpload embedded={true} />
                        <div className="border-t border-stroke pt-16 mt-8">
                            <div className="max-w-5xl mx-auto">
                                {renderHistory()}
                            </div>
                        </div>
                    </div>
                );
            case 'Interview Prep':
                const latestScores = liveStats?.interviewScores || [];
                const hasPastSessions = (liveStats?.totalInterviews || 0) > 0 && latestScores.some(s => s.score > 0);

                return (
                    <div className="space-y-12 pb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`space-y-8 max-w-5xl mx-auto ${selectedInterview ? 'print:hidden' : ''}`}>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Column: AI Recruiter Station */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-black uppercase tracking-widest">
                                            <Sparkles className="w-3.5 h-3.5" /> Practice Center
                                        </div>
                                        <h3 className="text-3xl font-black text-content-base tracking-tight uppercase italic font-sans">AI Mock Interview</h3>
                                        <p className="text-content-muted text-sm font-medium leading-relaxed max-w-xl">
                                            Start an interactive mock interview with our AI recruiter. Practice speaking and get real-time feedback on your answers and speech.
                                        </p>
                                    </div>

                                    {/* AI Recruiter Feed Container */}
                                    <div className="card-bento p-6 bg-surface-card border-stroke overflow-hidden relative">
                                        {/* Scanlines Effect */}
                                        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_50%,transparent_50%)] bg-[size:100%_4px]" />

                                        <div className="relative aspect-[16/10] bg-surface-base border border-stroke rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner group">
                                            {/* Corner Accents */}
                                            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-content-muted/30" />
                                            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-content-muted/30" />
                                            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-content-muted/30" />
                                            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-content-muted/30" />

                                            {/* Status Indicators */}
                                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-brand-glow border border-brand/20 rounded-full">
                                                <span className="w-2 h-2 rounded-full bg-brand animate-pulse shadow-[0_0_8px_rgba(200,141,142,0.5)]"></span>
                                                <span className="text-brand text-[9px] font-black uppercase tracking-wider">AI Online</span>
                                            </div>

                                            <div className="absolute top-6 right-6 flex items-center gap-4 text-content-muted text-[9px] font-black uppercase tracking-wider">
                                                <span>Network Stable</span>
                                                <span>Active Stream</span>
                                            </div>

                                            {/* Central Avatar Visual */}
                                            <div className="flex flex-col items-center gap-4 mt-4">
                                                <div className="w-24 h-24 rounded-full bg-brand-glow border-2 border-brand/30 flex items-center justify-center shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                                                    {/* Outer rotating/pulsing ring */}
                                                    <div className="absolute inset-[-6px] rounded-full border border-dashed border-brand/40 animate-[spin_20s_linear_infinite]" />
                                                    <Brain className="w-10 h-10 text-brand animate-pulse" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-content-base font-black text-sm uppercase tracking-wider">Sarah - AI Recruiter</h4>
                                                    <p className="text-[10px] text-content-muted font-bold uppercase tracking-widest mt-1">Specializing in Behavioral & Technical Interviews</p>
                                                </div>
                                            </div>

                                            {/* Simulated Audio Frequency Visualizer */}
                                            <div className="absolute bottom-6 left-6 right-6 h-6 flex items-end justify-center gap-1">
                                                {Array.from({ length: 24 }).map((_, idx) => {
                                                    const delay = (idx % 6) * 0.15;
                                                    const height = [16, 24, 8, 20, 12, 28][idx % 6];
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ height: 4 }}
                                                            animate={{ height: [4, height, 4] }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                delay: delay,
                                                                ease: "easeInOut"
                                                            }}
                                                            className="w-1.5 rounded-full bg-brand/35"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                                            <Link to="/interview" className="btn-primary w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-glow">
                                                <Video className="w-5 h-5" /> Initialize Session
                                            </Link>
                                            <div className="text-content-muted text-[10px] font-black uppercase tracking-wider text-center sm:text-left">
                                                * The session uses your mic and camera.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Systems & Analytics */}
                                <div className="lg:col-span-5 space-y-6">
                                    {/* Checklist Console */}
                                    <div className="card-bento p-6">
                                        <h4 className="text-[11px] text-content-muted font-black uppercase tracking-[0.2em] mb-4">System Status</h4>
                                        <div className="space-y-3">
                                            {[
                                                { text: "Voice Channel Connected", ok: true },
                                                { text: "Speech-to-Text Ready", ok: true },
                                                { text: "Evaluation System Active", ok: true },
                                                { text: "Microphone Access OK", ok: true }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 py-1">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                                    <span className="text-[10px] text-content-base font-black uppercase tracking-wider">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Performance stats */}
                                    <div className="card-bento p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[11px] text-content-muted font-black uppercase tracking-[0.2em]">Your Last Session Scores</h4>
                                                {hasPastSessions && (
                                                    <span className="text-[9px] font-black text-brand uppercase tracking-widest">Evaluated</span>
                                                )}
                                            </div>

                                            {hasPastSessions ? (
                                                <div className="space-y-5">
                                                    {latestScores.map((scoreObj, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                                                                <span className="text-content-base">{scoreObj.name}</span>
                                                                <span className="text-brand">{scoreObj.score}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-surface-base border border-stroke rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-brand rounded-full transition-all duration-1000"
                                                                    style={{ width: `${scoreObj.score}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="pt-4 border-t border-stroke flex justify-between items-center">
                                                        <span className="text-[9px] text-content-muted font-black uppercase tracking-widest">
                                                            Completed on {liveStats?.lastInterviewDate ? new Date(liveStats.lastInterviewDate).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        <Link to={`/interview/report/${liveStats?.lastInterviewId || ''}`} className="text-brand hover:underline text-[9px] font-black uppercase tracking-widest">
                                                            Full Report →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-surface-base border border-stroke flex items-center justify-center text-content-muted">
                                                        <Target className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-content-base font-bold text-xs uppercase tracking-wider">No Scores Available</p>
                                                        <p className="text-content-muted text-[9px] font-bold uppercase tracking-widest mt-1 max-w-[240px] mx-auto leading-relaxed">
                                                            Complete your first mock interview to see your scores here.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* General Advice / Quick tips */}
                                    <div className="p-6 bg-brand/5 border border-brand/10 rounded-2xl space-y-4">
                                        <h4 className="text-[11px] text-brand font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Quick Tips
                                        </h4>
                                        <p className="text-[10px] text-content-muted font-bold uppercase tracking-wider leading-relaxed">
                                            The AI recruiter evaluates your answers, speaking speed, and tone. During technical questions, explain your thought process clearly step-by-step.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className={`border-t border-stroke pt-16 mt-8 ${selectedInterview ? 'print:border-none print:pt-0 print:mt-0' : ''}`}>
                            <div className="max-w-5xl mx-auto">
                                {renderInterviewHistory()}
                            </div>
                        </div>
                    </div>
                );
            case 'Training Hub':
                return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><PracticeHub /></motion.div>;
            case 'Profile':
                return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto"><Profile embedded={true} /></motion.div>;
            default:
                return renderOverview();
        }
    };

    return (
        <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible bg-surface-base text-content-base font-sans transition-colors duration-300">
            {/* Desktop Sidebar (Push Rail) */}
            <aside className="group/sidebar w-[80px] hover:w-72 transition-all duration-300 ease-in-out border-r border-stroke bg-surface-card hidden lg:flex flex-col z-20 shrink-0 shadow-sm relative overflow-hidden">
                <div className="h-[76px] flex items-center px-5 border-b border-stroke gap-4 shrink-0 bg-surface-card sticky top-0">
                    <Link to="/" className="flex items-center gap-4 w-[240px] shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-brand-glow shrink-0">
                            <Logo className="w-full h-full" />
                        </div>
                        <div className="flex flex-col leading-none truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            <span className="text-lg font-black text-content-base uppercase italic tracking-tighter">CareerCraft</span>
                            <span className="text-[10px] font-black tracking-widest text-brand mt-0.5">INTELLIGENCE</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-3 flex flex-col gap-2 scrollbar-hide select-none">
                    <div className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em] px-4 mb-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">Navigation Map</div>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.name;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center px-1.5 py-1.5 rounded-xl transition-all font-bold tracking-tight text-sm text-left group overflow-hidden ${isActive
                                    ? 'bg-brand/10 text-brand shadow-sm border border-brand/20'
                                    : 'text-content-muted hover:bg-surface-hover hover:text-content-base border border-transparent'
                                    }`}
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-brand text-white shadow-md shadow-brand-glow' : 'text-content-muted group-hover:text-brand bg-transparent'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col w-[200px] ml-4 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    <span className="truncate">{tab.name}</span>
                                    {!isActive && <span className="text-[10px] font-medium opacity-70 tracking-wide mt-0.5 truncate">{tab.description}</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-stroke bg-surface-card shrink-0">
                    <button
                        onClick={() => setActiveTab('Profile')}
                        className={`flex items-center p-1.5 rounded-xl transition-colors overflow-hidden ${activeTab === 'Profile' ? 'bg-surface-hover border border-stroke' : 'hover:bg-surface-hover border border-transparent'}`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-surface-hover border border-stroke flex items-center justify-center text-content-muted font-black shrink-0 text-sm">
                            {userInitial}
                        </div>
                        <div className="flex flex-col text-left opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ml-4 w-[200px] whitespace-nowrap">
                            <span className="text-sm font-black text-content-base truncate">{userName}</span>
                            <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider truncate">Manage Account</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Viewport */}
            <div className="w-full lg:w-[calc(100vw-80px)] print:w-full shrink-0 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative bg-surface-base transform-gpu">
                {/* Top Header */}
                <header className="h-[76px] border-b border-stroke bg-surface-card/90 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 z-30 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl border border-stroke bg-surface-base text-content-muted hover:text-content-base"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black text-content-base tracking-tight hidden sm:block">
                            {activeTab}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                                document.documentElement.setAttribute('data-theme', newTheme);
                                localStorage.setItem('theme', newTheme);
                                setTheme(newTheme);
                            }}
                            className="p-2.5 rounded-xl border border-stroke text-content-muted bg-surface-base hover:bg-surface-hover transition-colors shadow-sm cursor-pointer hidden sm:block"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 block" /> : <Moon className="w-5 h-5 block" />}
                        </button>

                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2.5 rounded-xl border border-stroke text-content-muted bg-surface-base hover:bg-surface-hover transition-colors shadow-sm"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-3 w-2 h-2 bg-brand rounded-full border-2 border-surface-base" />
                            </button>
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-surface-card border border-stroke rounded-2xl shadow-2xl overflow-hidden py-8 z-50 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-surface-hover border border-stroke flex items-center justify-center mb-4">
                                            <Bell className="w-6 h-6 text-content-muted" />
                                        </div>
                                        <p className="text-content-base font-black text-base tracking-tight">Notifications Clear</p>
                                        <p className="text-content-muted text-xs font-medium mt-1">You have no new alerts at this time.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scrollable Area */}
                <main className="flex-1 overflow-y-auto print:overflow-visible w-full p-4 sm:p-6 lg:p-8 relative">
                    {loadingStats && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-glow overflow-hidden z-50">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-1/3 h-full bg-brand shadow-[0_0_10px_var(--brand)]"
                            />
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto pb-24">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-surface-card border-r border-stroke z-50 flex flex-col lg:hidden"
                        >
                            <div className="h-[76px] flex items-center justify-between px-6 border-b border-stroke shrink-0">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                                        <Logo className="w-full h-full" />
                                    </div>
                                    <span className="text-lg font-black text-content-base uppercase italic tracking-tighter">CareerCraft</span>
                                </Link>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-surface-hover text-content-muted">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                                <div className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em] px-4 mb-2">Menu Map</div>
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.name;
                                    return (
                                        <button
                                            key={tab.name}
                                            onClick={() => { setActiveTab(tab.name); setIsMobileMenuOpen(false); }}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm text-left ${isActive ? 'bg-brand text-white shadow-md' : 'text-content-muted hover:bg-surface-hover'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-content-muted'}`} />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-stroke bg-surface-card shrink-0 space-y-2">
                                <button onClick={() => { setActiveTab('Profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all font-bold text-sm text-left ${activeTab === 'Profile' ? 'bg-brand text-white shadow-md' : 'text-content-muted hover:bg-surface-hover'}`}>
                                    <User className={`w-5 h-5 ${activeTab === 'Profile' ? 'text-white' : 'text-content-muted'}`} />
                                    <span>Profile</span>
                                </button>
                                <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-500 font-bold text-sm border border-red-500/20 hover:bg-red-500/10 transition-colors">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
