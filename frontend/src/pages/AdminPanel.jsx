import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    LayoutDashboard, Users, FileText, Video, TrendingUp, Settings,
    LogOut, Search, Eye, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight,
    CheckCircle2, XCircle
} from 'lucide-react';
import Logo from '../components/Logo';
import * as Queries from './adminQueries';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Helper Components ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-surface-card border border-stroke rounded-2xl shadow-xl overflow-hidden ${className}`}>
        {children}
    </div>
);

const Loader = () => (
    <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
    </div>
);

const ErrorMsg = ({ msg }) => (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{msg}</p>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-[5vh] left-1/2 -translate-x-1/2 w-full max-w-3xl max-h-[90vh] bg-surface-base border border-stroke rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-stroke">
                        <h2 className="text-xl font-bold text-content-base">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl transition-colors"><XCircle className="w-6 h-6 text-content-muted" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

// --- Sub Views ---
const DashboardView = ({ token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;
        Queries.getDashboardStats(token).then(res => {
            setData(res);
            setLoading(false);
        }).catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, []);

    if (loading) return <Loader />;
    if (error) return <ErrorMsg msg={error} />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: data.stats.usersCount, color: 'border-t-brand' },
                    { label: 'Resumes Uploaded', value: data.stats.resumesCount, color: 'border-t-emerald-500' },
                    { label: 'Interviews Completed', value: data.stats.interviewsCount, color: 'border-t-blue-500' },
                    { label: 'Avg ATS Score', value: `${data.stats.avgAtsScore}%`, color: 'border-t-purple-500' }
                ].map((kpi, i) => (
                    <Card key={i} className={`border-t-4 ${kpi.color} p-6`}>
                        <p className="text-content-muted text-sm font-bold uppercase tracking-wider mb-2">{kpi.label}</p>
                        <h3 className="text-4xl font-black text-content-base">{kpi.value}</h3>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">User Signups (30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.userSignupsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} />
                                <YAxis stroke="#ffffff50" fontSize={12} allowDecimals={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                                <Line type="monotone" dataKey="users" stroke="#FF5757" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">Interview Completions (14 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.interviewCompletionsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} />
                                <YAxis stroke="#ffffff50" fontSize={12} allowDecimals={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} cursor={{ fill: '#ffffff05' }} />
                                <Bar dataKey="completions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-content-base mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {data.recentActivity.map((act, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-xl transition-colors">
                            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold shrink-0">
                                {act.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-content-base font-medium truncate">{act.desc}</p>
                                <p className="text-xs text-content-muted">{new Date(act.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {data.recentActivity.length === 0 && <p className="text-content-muted text-center py-4">No recent activity.</p>}
                </div>
            </Card>
        </div>
    );
};

const UsersView = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!token) return;
        Queries.getUsersList(token).then(res => {
            setUsers(res);
            setLoading(false);
        });
    }, []);

    const filtered = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-surface-card border border-stroke rounded-xl pl-12 pr-4 py-3 text-content-base focus:outline-none focus:border-brand"
                    />
                </div>
            </div>

            <Card>
                {loading ? <Loader /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stroke bg-surface-hover/50">
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">User</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Joined</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Resumes</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Avg ATS</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Interviews</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id} className="border-b border-stroke hover:bg-surface-hover/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand/20 flex justify-center items-center text-brand font-bold text-xs shrink-0">
                                                    {u.full_name?.charAt(0) || u.email?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-content-base">{u.full_name || 'No Name'}</p>
                                                    <p className="text-xs text-content-muted">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-content-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm text-content-base font-medium">{u.resumesCount}</td>
                                        <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-md text-xs font-bold ${u.avgAtsScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : u.avgAtsScore > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-hover text-content-muted'}`}>{u.avgAtsScore > 0 ? `${u.avgAtsScore}%` : '-'}</span></td>
                                        <td className="p-4 text-sm text-content-base font-medium">{u.interviewsCount}</td>
                                        <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stroke text-content-muted'}`}>{u.status}</span></td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => setSelectedUser(u)} className="p-2 hover:bg-brand/10 text-brand rounded-lg transition-colors inline-flex"><Eye className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <p className="text-center py-8 text-content-muted">No users found.</p>}
                    </div>
                )}
            </Card>

            <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-surface-card border border-stroke rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-brand/20 flex justify-center items-center text-brand font-black text-2xl shrink-0">
                                {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-content-base">{selectedUser.full_name}</h3>
                                <p className="text-content-muted">{selectedUser.email}</p>
                                <p className="text-xs text-content-muted mt-1">Joined: {new Date(selectedUser.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                                <h4 className="text-sm font-bold text-content-muted uppercase tracking-wider mb-3">Resumes ({selectedUser.resumesCount})</h4>
                                <ul className="space-y-2">
                                    {selectedUser.fullResumes?.map(r => (
                                        <li key={r.id} className="flex justify-between text-sm p-2 bg-surface-hover rounded-lg">
                                            <span className="truncate max-w-[200px] text-content-base">{r.file_name}</span>
                                            <span className="font-bold text-brand">{r.score > 0 ? `${r.score}%` : 'N/A'}</span>
                                        </li>
                                    ))}
                                    {selectedUser.fullResumes?.length === 0 && <li className="text-sm text-content-muted">No resumes uploaded.</li>}
                                </ul>
                            </Card>
                            <Card className="p-4">
                                <h4 className="text-sm font-bold text-content-muted uppercase tracking-wider mb-3">Interviews ({selectedUser.interviewsCount})</h4>
                                <ul className="space-y-2">
                                    {selectedUser.fullInterviews?.map(i => (
                                        <li key={i.id} className="flex justify-between text-sm p-2 bg-surface-hover rounded-lg">
                                            <span className="truncate max-w-[150px] text-content-base">{i.job_role}</span>
                                            <span className="font-bold text-brand">{i.overall_score || 0}/100</span>
                                        </li>
                                    ))}
                                    {selectedUser.fullInterviews?.length === 0 && <li className="text-sm text-content-muted">No interviews completed.</li>}
                                </ul>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const ResumesView = ({ token }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResume, setSelectedResume] = useState(null);

    useEffect(() => {
        if (!token) return;
        Queries.getResumesList(token).then(res => {
            setResumes(res);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                {loading ? <Loader /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stroke bg-surface-hover/50">
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">User</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">File Name</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">ATS Score</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Missing KWs</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumes.map(r => (
                                    <tr key={r.id} className="border-b border-stroke hover:bg-surface-hover/30 transition-colors">
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-content-base">{r.user_name}</p>
                                            <p className="text-xs text-content-muted">{r.user_email}</p>
                                        </td>
                                        <td className="p-4 text-sm text-content-base max-w-[200px] truncate">{r.file_name}</td>
                                        <td className="p-4 text-sm text-content-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${r.ats_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : r.ats_score >= 60 ? 'bg-amber-500/10 text-amber-400' : r.ats_score > 0 ? 'bg-red-500/10 text-red-400' : 'bg-surface-hover text-content-muted'}`}>
                                                {r.ats_score > 0 ? `${r.ats_score}%` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-content-muted">{r.keywords_missing_count}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => setSelectedResume(r)} className="p-2 hover:bg-brand/10 text-brand rounded-lg transition-colors inline-flex"><Eye className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {resumes.length === 0 && <p className="text-center py-8 text-content-muted">No resumes found.</p>}
                    </div>
                )}
            </Card>

            <Modal isOpen={!!selectedResume} onClose={() => setSelectedResume(null)} title="Resume Feedback Summary">
                {selectedResume && (
                    <div className="space-y-4">
                        <div className="p-4 bg-surface-card border border-stroke rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-content-base">{selectedResume.file_name}</p>
                                <p className="text-sm text-content-muted">User: {selectedResume.user_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-brand">{selectedResume.ats_score}%</p>
                                <p className="text-xs text-content-muted uppercase">Match Score</p>
                            </div>
                        </div>
                        {selectedResume.full_report ? (
                            <div className="space-y-4">
                                <Card className="p-4 bg-surface-hover border-none">
                                    <h4 className="font-bold text-content-base mb-2">Missing Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedResume.full_report.missing_keywords?.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-md">{kw}</span>
                                        )) || <span className="text-content-muted text-sm">None</span>}
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <p className="text-content-muted text-center py-4">No ATS report generated for this resume yet.</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const InterviewsView = ({ token }) => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInt, setSelectedInt] = useState(null);

    useEffect(() => {
        if (!token) return;
        Queries.getInterviewsList(token).then(res => {
            setInterviews(res);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                {loading ? <Loader /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stroke bg-surface-hover/50">
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">User</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Role</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Difficulty</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Overall</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Comm.</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider">Content</th>
                                    <th className="p-4 text-xs font-bold text-content-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interviews.map(i => (
                                    <tr key={i.id} className="border-b border-stroke hover:bg-surface-hover/30 transition-colors">
                                        <td className="p-4 text-sm font-bold text-content-base">{i.user_name}</td>
                                        <td className="p-4 text-sm text-content-muted max-w-[150px] truncate">{i.job_role}</td>
                                        <td className="p-4 text-sm"><span className="capitalize px-2 py-1 bg-surface-hover rounded-md text-xs">{i.difficulty}</span></td>
                                        <td className="p-4 text-sm"><span className={`capitalize px-2 py-1 rounded-md text-xs font-bold ${i.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{i.status?.replace('_', ' ')}</span></td>
                                        <td className="p-4 text-sm font-bold text-brand">{i.overall_score || '-'}</td>
                                        <td className="p-4 text-sm text-content-muted">{i.communication_score || '-'}</td>
                                        <td className="p-4 text-sm text-content-muted">{i.content_score || '-'}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => setSelectedInt(i)} className="p-2 hover:bg-brand/10 text-brand rounded-lg transition-colors inline-flex"><Eye className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {interviews.length === 0 && <p className="text-center py-8 text-content-muted">No interviews found.</p>}
                    </div>
                )}
            </Card>

            <Modal isOpen={!!selectedInt} onClose={() => setSelectedInt(null)} title="Interview Details">
                {selectedInt && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="p-4 text-center">
                                <p className="text-xs font-bold text-content-muted uppercase">Overall</p>
                                <p className="text-3xl font-black text-brand mt-1">{selectedInt.overall_score || 0}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-xs font-bold text-content-muted uppercase">Communication</p>
                                <p className="text-3xl font-black text-purple-400 mt-1">{selectedInt.communication_score || 0}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-xs font-bold text-content-muted uppercase">Content</p>
                                <p className="text-3xl font-black text-emerald-400 mt-1">{selectedInt.content_score || 0}</p>
                            </Card>
                        </div>
                        {selectedInt.evaluation_parsed ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-content-base mb-2">Strengths</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-400">
                                        {(selectedInt.evaluation_parsed.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-content-base mb-2">Areas for Improvement</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-amber-400">
                                        {(selectedInt.evaluation_parsed.improvements || []).map((s, idx) => <li key={idx}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-content-base mb-2">Detailed Feedback</h4>
                                    <p className="text-sm text-content-muted whitespace-pre-wrap bg-surface-hover p-4 rounded-xl border border-stroke">
                                        {selectedInt.evaluation_parsed.feedback || 'No detailed feedback provided.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-content-muted text-center py-4">No evaluation data available.</p>
                        )}
                        {selectedInt.transcript && (
                            <div>
                                <h4 className="font-bold text-content-base mb-2">Transcript</h4>
                                <div className="bg-surface-hover p-4 rounded-xl border border-stroke max-h-64 overflow-y-auto text-sm text-content-muted whitespace-pre-wrap font-mono">
                                    {selectedInt.transcript}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const AnalyticsView = ({ token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        Queries.getAnalyticsData(token).then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <Loader />;

    const COLORS = ['#FF5757', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                    <p className="text-content-muted font-bold uppercase tracking-wider text-sm">Avg ATS Score</p>
                    <p className="text-4xl font-black text-brand mt-2">{data.avgAts}%</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-content-muted font-bold uppercase tracking-wider text-sm">Avg Interview Score</p>
                    <p className="text-4xl font-black text-emerald-400 mt-2">{data.avgInterview}/100</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-content-muted font-bold uppercase tracking-wider text-sm">Total Practice Sessions</p>
                    <p className="text-4xl font-black text-purple-400 mt-2">{data.practiceSessions}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">ATS Score Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="range" stroke="#ffffff50" fontSize={12} />
                                <YAxis stroke="#ffffff50" fontSize={12} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">Top Missing Keywords</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topKeywords} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                                <YAxis type="category" dataKey="keyword" stroke="#ffffff50" fontSize={12} width={80} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                                <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">Common Job Roles</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topRoles} layout="vertical" margin={{ left: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                                <YAxis type="category" dataKey="role" stroke="#ffffff50" fontSize={12} width={120} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-content-base mb-6">Interview Difficulty</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.difficultyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {data.difficultyDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            {data.difficultyDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm text-content-muted capitalize">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const SettingsView = ({ token }) => {
    const [supaStatus, setSupaStatus] = useState('checking');
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        if (!token) return;
        Queries.pingSupabase(token).then(res => setSupaStatus(res ? 'connected' : 'error')).catch(() => setSupaStatus('error'));
    }, [token]);

    const handleClearSessions = async () => {
        const input = window.prompt('Type CONFIRM to proceed with clearing all practice sessions:');
        if (input === 'CONFIRM') {
            setClearing(true);
            try {
                await Queries.deletePracticeSessions(token);
                alert('Practice sessions cleared successfully.');
            } catch (err) {
                alert('Failed to clear sessions: ' + err.message);
            }
            setClearing(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const users = await Queries.getUsersList(token);
            const headers = ["ID", "Name", "Email", "Joined", "Resumes", "Avg ATS", "Interviews", "Avg Interview", "Status"];
            const rows = users.map(u => [
                u.id, `"${u.full_name || ''}"`, u.email, u.created_at, u.resumesCount, u.avgAtsScore, u.interviewsCount, u.avgInterviewScore, u.status
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "careercraft_users_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert("Export failed: " + err.message);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-bold text-content-base mb-4 border-b border-stroke pb-4">Admin Information</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-content-muted font-medium">Logged in as</span>
                        <span className="text-content-base font-bold bg-surface-hover px-3 py-1 rounded-lg">careercraftfyp@gmail.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-content-muted font-medium">Version</span>
                        <span className="text-content-base font-bold bg-surface-hover px-3 py-1 rounded-lg">Admin Panel</span>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-content-base mb-4 border-b border-stroke pb-4">System Status</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-content-base font-medium">Supabase Database</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${supaStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : supaStatus === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-surface-hover text-content-muted'}`}>
                            {supaStatus === 'connected' ? 'Connected' : supaStatus === 'error' ? 'Error' : 'Checking...'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-content-base font-medium">OpenAI API</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-content-base font-medium">Tavus API</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-content-base font-medium">Whisper API</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Connected</span>
                    </div>
                </div>
            </Card>

            <Card className="p-6 border-red-500/30">
                <h3 className="text-lg font-bold text-red-400 mb-4 border-b border-red-500/20 pb-4">Danger Zone</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                        <div>
                            <p className="text-content-base font-bold">Clear Practice Sessions</p>
                            <p className="text-sm text-content-muted">Permanently delete all practice sessions data.</p>
                        </div>
                        <button onClick={handleClearSessions} disabled={clearing} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
                            {clearing ? 'Clearing...' : 'Clear Data'}
                        </button>
                    </div>
                    <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                        <div>
                            <p className="text-content-base font-bold">Export User Data</p>
                            <p className="text-sm text-content-muted">Download a CSV of all users and their aggregated stats.</p>
                        </div>
                        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
                            Export CSV
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default function AdminPanel() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setToken(data?.session?.access_token || null);
        });
    }, []);

    if (user?.email !== 'careercraftfyp@gmail.com') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-base text-content-muted gap-4">
                <Shield className="w-12 h-12 text-red-500/50" />
                <p className="font-bold">Admin access restricted.</p>
                <button onClick={() => navigate('/dashboard')} className="text-brand hover:underline text-sm">Return to Dashboard</button>
            </div>
        );
    }

    if (!token) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'resumes', label: 'Resumes', icon: FileText },
        { id: 'interviews', label: 'Interviews', icon: Video },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderView = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardView token={token} />;
            case 'users': return <UsersView token={token} />;
            case 'resumes': return <ResumesView token={token} />;
            case 'interviews': return <InterviewsView token={token} />;
            case 'analytics': return <AnalyticsView token={token} />;
            case 'settings': return <SettingsView token={token} />;
            default: return <DashboardView token={token} />;
        }
    };

    return (
        <div className="flex h-screen bg-surface-base font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[240px] shrink-0 bg-surface-card border-r border-stroke flex flex-col z-20">
                <div className="p-6 flex items-center gap-3 border-b border-stroke">
                    <div className="w-10 h-10 rounded-xl bg-brand p-1.5 shadow-lg shadow-brand/20">
                        <Logo className="w-full h-full" />
                    </div>
                    <div>
                        <h1 className="font-black text-content-base leading-none">Admin</h1>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Panel v1.0</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentPage(item.id)}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-brand/10 text-brand border border-brand/20' : 'text-content-muted hover:bg-surface-hover hover:text-content-base border border-transparent'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stroke bg-surface-hover/30">
                    <div className="flex flex-col gap-3">
                        <div className="text-xs">
                            <p className="text-content-muted">Logged in as</p>
                            <p className="text-content-base font-bold truncate">careercraftfyp@gmail.com</p>
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="flex justify-center items-center gap-2 w-full px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 font-bold text-sm rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" /> Exit Admin
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-[80px] shrink-0 border-b border-stroke bg-surface-card/50 backdrop-blur-md flex items-center px-8 z-10 sticky top-0">
                    <h2 className="text-2xl font-black text-content-base capitalize">{currentPage}</h2>
                </header>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderView()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
