import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Bell, FileText, Video, Target, Activity,
    Download, ChevronDown, BarChart2, User, Settings, LogOut, ArrowRight, Brain, Zap, Sparkles
} from 'lucide-react';
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
    const [history, setHistory] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'history'
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);

    const [liveStats, setLiveStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
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

        if (activeTab === 'Overview') {
            fetchStats();
        }

        if (activeTab === 'Resume Analyzer' && history.length === 0) {
            fetchHistory();
        }

        // Also refetch history if we navigate to Overview and want to see history (optional, dashboard auto-updates)
    }, [activeTab]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    const tabs = [
        { name: 'Overview', icon: BarChart2 },
        { name: 'Resume Analyzer', icon: FileText },
        { name: 'Interview Prep', icon: Video },
        { name: 'Training Hub', icon: Zap },
        { name: 'Profile', icon: User }
    ];

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

    const renderHeader = () => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-white mb-1"
                >
                    {activeTab === 'Overview' ? (
                        <>Welcome back, <span className="gradient-text">{userName}</span></>
                    ) : activeTab}
                </motion.h2>
                <p className="text-sm text-dark-400">
                    {activeTab === 'Overview' && 'Your career preparation is trending upwards'}
                    {activeTab === 'Resume Analyzer' && 'Upload and optimize your resume for ATS systems'}
                    {activeTab === 'Interview Prep' && 'Practice and review your AI mock interviews'}
                    {activeTab === 'Training Hub' && 'Enhance your skills with targeted training modules'}
                    {activeTab === 'Profile' && 'Manage your account information and preferences'}
                </p>
            </div>

            {activeTab === 'Overview' && (
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-dark-700 rounded-lg text-sm bg-dark-800/50 hover:bg-dark-700 transition-colors text-white">
                        Last Month <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-sm py-2 px-4 text-white">
                        <Download className="w-4 h-4" /> <span>Download Report</span>
                    </button>
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => {
                        setViewMode('overview');
                        setSelectedResume(null);
                        setActiveTab('Overview');
                    }}
                    className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] bg-dark-800 px-4 py-2 rounded-xl border border-dark-700"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
                </button>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Resume <span className="gradient-text">History</span></h3>
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
                            className="card glass p-6 cursor-pointer hover:border-primary-500/30 group transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-16 h-16" />
                            </div>
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-white italic tracking-tighter">{resume.analysis.overall_score}</div>
                                    <div className="text-[8px] text-dark-500 font-black uppercase tracking-[0.2em]">ATS Score</div>
                                </div>
                            </div>
                            <h4 className="font-bold text-white truncate mb-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{resume.file_name}</h4>
                            <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest mb-4">
                                Analyzed on {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                                <span className="px-2 py-1 rounded bg-dark-900/50 text-[8px] text-primary-400 font-black uppercase tracking-[0.2em] border border-primary-500/20">
                                    {resume.analysis.field_of_expertise}
                                </span>
                                <ArrowRight className="w-4 h-4 text-dark-500 group-hover:translate-x-1 group-hover:text-primary-400 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                    {history.length === 0 && (
                        <div className="col-span-full py-32 text-center card glass border-dashed flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-dark-800 flex items-center justify-center text-dark-600">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-dark-400 font-black tracking-[0.2em] uppercase text-xs">No resumes archived in the neural core</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderOverview = () => {
        const stats = [
            { label: 'Total Resumes', value: liveStats?.totalResumes ?? '0', icon: FileText, color: 'text-blue-400', clickable: true, growth: liveStats?.growth?.resumes ?? 0 },
            { label: 'Total Interviews', value: liveStats?.totalInterviews ?? '0', icon: Video, color: 'text-emerald-400', growth: liveStats?.growth?.interviews ?? 0 },
            { label: 'Avg ATS Score', value: liveStats?.avgAtsScore ?? '0/100', icon: Target, color: 'text-amber-400', growth: liveStats?.growth?.atsScore ?? 0, growthSuffix: '%' },
            { label: 'Training ROI', value: liveStats?.trainingProgress ?? '0%', icon: Zap, color: 'text-purple-400', clickable: true, tab: 'Training Hub', growth: liveStats?.growth?.trainingProgress ?? 0, growthSuffix: '%' }
        ];

        return (
        <div className="space-y-8">
            {viewMode === 'history' ? renderHistory() : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        if (stat.clickable) {
                                            if (stat.tab === 'Training Hub') {
                                                setActiveTab('Training Hub');
                                            } else {
                                                fetchHistory();
                                                setViewMode('history');
                                            }
                                        }
                                    }}
                                    className={`card flex flex-col shadow-lg shadow-black/20 ${stat.clickable ? 'cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 group' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-sm font-medium text-dark-400">{stat.label}</p>
                                        <div className={`p-2 rounded-lg bg-dark-900/50 ${stat.color} ${stat.clickable ? 'group-hover:scale-110 transition-transform' : ''}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                    <div className={`mt-2 text-[10px] flex items-center gap-1 font-bold ${stat.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <span>{stat.growth >= 0 ? '↑' : '↓'} {Math.abs(stat.growth)}{stat.growthSuffix || ''}</span>
                                        <span className="text-dark-500 font-medium tracking-normal">from last week</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* ATS Trend */}
                        <div className="card min-h-[400px] flex flex-col shadow-lg shadow-black/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary-400" />
                                    <h3 className="font-semibold text-lg text-white">ATS Score Trend</h3>
                                </div>
                            </div>
                            {(!liveStats?.atsTrend || liveStats.atsTrend.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 m-4 ml-0 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700">
                                    <FileText className="w-10 h-10 text-dark-500 mb-3" />
                                    <p className="text-dark-300 font-medium text-sm leading-relaxed">Submit a resume to the <span className="text-primary-400">Analyzer</span><br />to start tracking your ATS progression scores here.</p>
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-full min-h-[300px] -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={liveStats?.atsTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                                itemStyle={{ color: '#0ea5e9' }}
                                            />
                                            <Area type="monotone" dataKey="score" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Interview Scores */}
                        <div className="card min-h-[400px] flex flex-col shadow-lg shadow-black/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-fuchsia-400" />
                                    <h3 className="font-semibold text-lg text-white">Interview Readiness</h3>
                                </div>
                            </div>
                            {(!liveStats?.interviewScores || liveStats.interviewScores.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 m-4 ml-0 bg-dark-800/20 rounded-2xl border border-dashed border-dark-700">
                                    <Video className="w-10 h-10 text-dark-500 mb-3" />
                                    <p className="text-dark-300 font-medium text-sm leading-relaxed">Launch an <span className="text-fuchsia-400">AI Mock Interview</span><br />to unlock your comprehensive soft & technical skill metrics.</p>
                                </div>
                            ) : (
                                <div className="flex-1 w-full h-full min-h-[300px] -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={liveStats?.interviewScores} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                            />
                                            <Bar dataKey="score" fill="#d946ef" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                                {liveStats?.interviewScores?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#d946ef', '#a855f7', '#8b5cf6', '#6366f1'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Training Progress (New) */}
                        <div className="lg:col-span-2 card p-8 flex flex-col sm:flex-row items-center gap-12 bg-gradient-to-br from-dark-800 to-dark-900 border-primary-500/10">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                        <Zap className="w-3 h-3 fill-current" /> Mastery Level
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Training <span className="gradient-text">Efficiency</span></h3>
                                    <p className="text-dark-400 text-sm font-medium max-w-md">
                                        Your neural training progress is calculated based on completed practice sessions and AI-identified skill acquisitions.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-dark-900/50 border border-dark-800">
                                        <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1">Drills Completed</p>
                                        <p className="text-2xl font-black text-white italic">{liveStats?.completedPractice || 0}<span className="text-dark-600 text-sm ml-1">/ {liveStats?.totalPractice || 0}</span></p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-dark-900/50 border border-dark-800">
                                        <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-1">Target Score</p>
                                        <p className="text-2xl font-black text-primary-400 italic">95%</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('Training Hub')}
                                    className="btn-primary w-full sm:w-auto"
                                >
                                    Launch Training Core
                                </button>
                            </div>
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-[12px] border-dark-800" />
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="84"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeDasharray={527}
                                        strokeDashoffset={527 - (527 * parseInt(liveStats?.trainingProgress || 0)) / 100}
                                        className="text-primary-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-white italic">{liveStats?.trainingProgress || '0%'}</span>
                                    <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Growth</span>
                                </div>
                                <div className="absolute -top-2 -right-2 p-3 bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/20 animate-bounce">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
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
                        <div className="border-t border-dark-800 pt-16 mt-8">
                            <div className="max-w-5xl mx-auto px-4">
                                {renderHistory()}
                            </div>
                        </div>
                    </div>
                );
            case 'Interview Prep':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Launch Card */}
                        <div className="relative overflow-hidden bg-dark-800 border border-primary-500/20 rounded-3xl p-10 glass shadow-2xl shadow-black/40">
                            <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-primary-500/20 rounded-2xl border border-primary-500/30">
                                        <Video className="w-8 h-8 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">AI Mock Interview</h3>
                                        <p className="text-primary-300 text-sm font-medium">Powered by Tavus Conversational AI</p>
                                    </div>
                                </div>
                                <p className="text-dark-300 mb-10 max-w-xl text-lg leading-relaxed">
                                    Practice with a lifelike AI interviewer that adapts to your target role and company.
                                    Get real-time verbal feedback and build interview confidence.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/interview"
                                        className="btn-primary inline-flex items-center justify-center gap-2 text-white px-8"
                                    >
                                        <Video className="w-5 h-5" />
                                        Launch Session
                                    </Link>
                                    <button className="btn-secondary px-8">
                                        View Past Sessions
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Feature Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { emoji: '🎭', title: 'Lifelike AI Interviewer', desc: 'Powered by Tavus conversational video' },
                                { emoji: '🧠', title: 'Role-Specific Questions', desc: 'Interview questions tailored to your target role' },
                                { emoji: '⏱️', title: 'Up to 20 minutes', desc: 'Full-length sessions for comprehensive practice' },
                            ].map(f => (
                                <div key={f.title} className="card p-6 border-dark-700/50 hover:border-primary-500/30 transition-all shadow-md shadow-black/10">
                                    <div className="text-4xl mb-4">{f.emoji}</div>
                                    <h4 className="text-white font-bold text-base mb-2">{f.title}</h4>
                                    <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'Training Hub':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PracticeHub />
                    </motion.div>
                );
            case 'Profile':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Profile embedded={true} />
                    </motion.div>
                );
            default:
                return renderOverview();
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-dark-900 text-slate-200 font-sans">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-dark-800 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-40">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-black text-xl transition-transform group-hover:scale-110 shadow-lg shadow-primary-500/20">
                        C
                    </div>
                    <div>
                        <h1 className="font-black text-xl leading-none tracking-tight text-white uppercase italic">CareerCraft</h1>
                        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-[0.2em] mt-1">AI Intelligence</p>
                    </div>
                </Link>

                <div className="flex items-center gap-8">

                    <div className="flex items-center gap-4">
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative text-dark-400 hover:text-white transition-all p-2.5 rounded-xl hover:bg-dark-800 border border-transparent hover:border-dark-700"
                            >
                                <Bell className="w-5 h-5" />
                                {/* Optional: You can keep or remove the pulse ping dot if you want to pretend there's a notification, or hide it when clicked */}
                            </button>
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-64 bg-dark-800 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden py-6 z-50 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-dark-900/50 border border-dark-700/50 flex items-center justify-center mb-3">
                                            <Bell className="w-5 h-5 text-dark-500" />
                                        </div>
                                        <p className="text-dark-300 font-bold text-sm">No new notifications</p>
                                        <p className="text-dark-500 font-medium text-xs mt-1">You're all caught up!</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-dark-700 mx-2" />

                        <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block max-w-[150px]">
                                <p className="font-bold text-sm text-white truncate">{userName}</p>
                                <p className="text-[10px] text-dark-400 font-black uppercase tracking-wider">Free Plan</p>
                            </div>
                            <div className="relative" ref={profileRef}>
                                <div
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-lg shadow-xl shadow-primary-500/10 cursor-pointer hover:scale-105 transition-transform">
                                    {userInitial}
                                </div>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-3 w-48 bg-dark-800 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 flex flex-col"
                                        >
                                            <div className="px-4 py-3 border-b border-dark-700/50 mb-1 block sm:hidden">
                                                <p className="text-sm font-bold text-white truncate">{userName}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    setActiveTab('Profile');
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-colors w-full text-left"
                                            >
                                                <User className="w-4 h-4 text-primary-400" />
                                                Profile Settings
                                            </button>
                                            <div className="h-px bg-dark-700/50 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    signOut();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full pt-8 pb-32">
                {/* Navigation Tabs */}
                <nav className="flex space-x-10 border-b border-dark-800/80 mb-12 overflow-x-auto pb-px scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.name;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2.5 pb-5 pt-2 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 relative group ${isActive
                                    ? 'border-primary-500 text-white'
                                    : 'border-transparent text-dark-500 hover:text-dark-300'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary-400' : 'text-dark-600 group-hover:text-dark-400'}`} />
                                {tab.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabUnderline"
                                        className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderHeader()}
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
