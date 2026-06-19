import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Bell, FileText, Video, Target, Activity,
    Download, ChevronDown, BarChart2, User, Settings, LogOut, ArrowRight, Brain, Zap, Sparkles, Sun, Moon, TrendingUp, TrendingDown, Menu, X
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
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'history'
    
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
        if (activeTab === 'Overview') { fetchStats(); fetchPendingDrills(); }
        if (activeTab === 'Resume Analyzer' && history.length === 0) fetchHistory();
    }, [activeTab]);

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

    const renderOverview = () => {
        const resumesGrowth = liveStats?.growth?.resumes ?? 0;
        const atsGrowth = liveStats?.growth?.atsScore ?? 0;

        return (
        <div className="space-y-6">
            {viewMode === 'history' ? renderHistory() : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-max">
                    {/* Welcome Hero - Span 8 */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="lg:col-span-8 card-bento bg-surface-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-glow blur-[100px] rounded-full pointer-events-none -mt-32 -mr-32" />
                        <div className="flex-1 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-glow text-brand font-bold text-[10px] uppercase tracking-widest mb-4 border border-brand/20">
                                <Zap className="w-3 h-3 fill-current" /> System Online
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-content-base mb-3 tracking-tight">
                                Welcome back,<br/><span className="text-brand">{userName}</span>
                            </h2>
                            <p className="text-content-muted font-medium mb-8 max-w-md leading-relaxed text-sm">
                                Your neural training is calculating at peak efficiency. You are fully on track to dominate the upcoming technical evaluations.
                            </p>
                            <button onClick={() => setActiveTab('Training Hub')} className="btn-primary shadow-lg shadow-brand-glow hover:-translate-y-1 w-full sm:w-auto">
                                Launch Training Sequence <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
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
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} 
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
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="lg:col-span-7 card-bento p-6 flex flex-col bg-surface-card min-h-[350px]">
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
                        {/* Avg ATS */}
                        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: 0.3}} className="card-bento p-6 flex-1 bg-surface-card flex items-center justify-between group">
                            <div>
                                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-bold uppercase tracking-widest text-[10px] mb-4 w-fit">
                                    <Target className="w-3 h-3" /> Average Score
                                </div>
                                <h3 className="text-4xl font-black text-content-base tracking-tighter">
                                    <AnimatedValue value={liveStats?.avgAtsScore ?? '0'} loading={loadingStats} />
                                    <span className="text-lg text-content-muted ml-0.5">/100</span>
                                </h3>
                            </div>
                            <div className="w-16 h-16 rounded-full border-[6px] border-amber-500/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-amber-500" />
                            </div>
                        </motion.div>
                        
                        {/* Total Interviews */}
                        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: 0.4}} className="card-bento p-6 flex-1 bg-surface-card flex items-center justify-between group">
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
                    </div>

                    {/* Interview Overview - Span 12 */}
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.5}} className="lg:col-span-12 card-bento p-6 bg-surface-card h-[350px] flex flex-col">
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
                            initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.6}}
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
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
                        <div className="card-bento p-10 bg-brand text-white overflow-hidden relative border-none">
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full pointer-events-none -mt-20 -mr-20" />
                            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8 text-center md:text-left">
                                <div className="flex-1">
                                    <h3 className="text-4xl font-black tracking-tight mb-4 text-white">AI Mock Interview<br/><span className="text-emerald-200">Protocol</span></h3>
                                    <p className="text-emerald-50 mb-8 max-w-lg text-lg font-medium leading-relaxed">
                                        Practice with a lifelike AI interviewer that adapts to your target role and company. Get real-time verbal feedback.
                                    </p>
                                    <Link to="/interview" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-black hover:scale-105 transition-transform shadow-xl w-full md:w-auto text-lg">
                                        <Video className="w-5 h-5" /> Initialize Session
                                    </Link>
                                </div>
                                <div className="hidden md:flex p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                                    <Brain className="w-32 h-32 text-white/90" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { emoji: '🎭', title: 'Lifelike AI Interviewer', desc: 'Real-time conversational response using advanced speech AI' },
                                { emoji: '🧠', title: 'Role-Specific Questions', desc: 'Dynamic algorithmic generation tailored to your precise target' },
                                { emoji: '⏱️', title: 'Extensive Analysis', desc: 'Comprehensive soft and technical skill breakdown post-session' },
                            ].map(f => (
                                <div key={f.title} className="card-bento p-8 bg-surface-card hover:-translate-y-1 transition-transform">
                                    <div className="text-5xl mb-6 bg-surface-base w-20 h-20 rounded-2xl flex items-center justify-center border border-stroke shadow-sm">{f.emoji}</div>
                                    <h4 className="text-content-base font-black text-lg mb-2 tracking-tight">{f.title}</h4>
                                    <p className="text-content-muted font-medium text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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
        <div className="flex h-screen overflow-hidden bg-surface-base text-content-base font-sans transition-colors duration-300">
            {/* Desktop Sidebar (Push Rail) */}
            <aside className="group/sidebar w-[80px] hover:w-72 transition-all duration-300 ease-in-out border-r border-stroke bg-surface-card hidden lg:flex flex-col z-20 shrink-0 shadow-sm relative overflow-hidden">
                <div className="h-[76px] flex items-center px-5 border-b border-stroke gap-4 shrink-0 bg-surface-card sticky top-0">
                    <Link to="/" className="flex items-center gap-4 w-[240px] shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-brand-glow shrink-0">
                            <Logo className="w-full h-full" />
                        </div>
                        <div className="flex flex-col leading-none truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            <span className="text-lg font-black text-content-base uppercase italic tracking-tighter">CareerCraft</span>
                            <span className="text-[10px] font-black tracking-widest text-brand mt-0.5">CAREER INTELLIGENCE</span>
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
                                className={`flex items-center px-1.5 py-1.5 rounded-xl transition-all font-bold tracking-tight text-sm text-left group overflow-hidden ${
                                    isActive 
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
            <div className="w-[calc(100vw-80px)] shrink-0 flex flex-col min-w-0 overflow-hidden relative bg-surface-base transform-gpu">
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
                            className="p-2.5 rounded-xl border border-stroke text-content-muted bg-surface-base hover:bg-surface-hover transition-colors shadow-sm cursor-pointer"
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
                <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 relative">
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
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm text-left ${
                                                isActive ? 'bg-brand text-white shadow-md' : 'text-content-muted hover:bg-surface-hover'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-content-muted'}`} />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-stroke bg-surface-card shrink-0">
                                <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="btn-primary w-full shadow-sm bg-surface-hover border border-stroke text-red-500 hover:bg-red-500/10">
                                    <LogOut className="w-4 h-4" /> Disconnect
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
