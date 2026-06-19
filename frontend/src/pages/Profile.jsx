import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Activity, Calendar, FileText, Video, Bell, Target, Award, Key, Edit2, Save, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile({ embedded = false }) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [stats, setStats] = useState({ totalResumes: 0, totalInterviews: 0, lastInterviewDate: null });

    const initialName = user?.user_metadata?.full_name || '';
    const [formData, setFormData] = useState({
        firstName: initialName.split(' ')[0] || '',
        lastName: initialName.split(' ').slice(1).join(' ') || '',
    });

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            const name = user.user_metadata.full_name;
            setFormData({
                firstName: name.split(' ')[0] || '',
                lastName: name.split(' ').slice(1).join(' ') || '',
            });
        }
    }, [user]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const firstInitial = formData.firstName?.[0]?.toUpperCase() || 'U';
    const lastInitial = formData.lastName?.[0]?.toUpperCase() || '';
    const userInitial = `${firstInitial}${lastInitial}` || 'U';

    let memberSince = 'Today';
    let accountAgeDays = 0;
    let lastActiveStr = 'Today';

    if (user?.created_at) {
        const date = new Date(user.created_at);
        if (!isNaN(date.getTime())) {
            memberSince = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const diffTime = new Date().getTime() - date.getTime();
            accountAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (accountAgeDays < 0) accountAgeDays = 0;
        }
    }

    let lastInterviewStr = 'None';
    if (stats.lastInterviewDate) {
        const interviewDate = new Date(stats.lastInterviewDate);
        if (!isNaN(interviewDate.getTime())) {
            const diffTime = new Date().getTime() - interviewDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) lastInterviewStr = 'Today';
            else if (diffDays === 1) lastInterviewStr = 'Yesterday';
            else lastInterviewStr = `${diffDays} days ago`;
        }
    }

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const token = session.access_token;
                const res = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalResumes: data.totalResumes || 0,
                        totalInterviews: data.totalInterviews || 0,
                        lastInterviewDate: data.lastInterviewDate || null,
                    });
                }
            } catch (error) {
                // Ignore API errors gracefully
            }
        };
        fetchStats();
    }, [supabase]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ full_name: fullName })
            });

            if (!res.ok) throw new Error('Failed to update profile');

            // Re-fetch user or update local metadata if needed
            // The AuthContext usually listens to changes, but metadata might need a manual refresh or just wait for session sync
            await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className={`flex flex-col text-slate-200 font-sans w-full ${!embedded ? 'min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto' : ''}`}>
            {!embedded && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                            <p className="text-dark-400">Manage your account information and preferences</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Personal Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="card glass p-8 shadow-xl shadow-black/20 border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-primary-500/30 rounded-lg text-sm bg-primary-500/10 hover:bg-primary-500/20 transition-colors text-primary-400 font-medium"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-primary-500/20"
                                    >
                                        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-dark-500 font-bold uppercase tracking-wider ml-1">First Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-dark-400">
                                            <span className="text-xs">{firstInitial}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            readOnly={!isEditing}
                                            placeholder="Enter first name"
                                            className={`input-field !pl-20 transition-all ${isEditing ? 'bg-dark-900 border-primary-500/50 ring-2 ring-primary-500/10' : 'bg-dark-800/80 border-dark-700 text-white cursor-default focus:ring-0'}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-dark-500 font-bold uppercase tracking-wider ml-1">Last Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-dark-400">
                                            <span className="text-xs">{lastInitial || firstInitial}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            readOnly={!isEditing}
                                            placeholder="Enter last name"
                                            className={`input-field !pl-20 transition-all ${isEditing ? 'bg-dark-900 border-primary-500/50 ring-2 ring-primary-500/10' : 'bg-dark-800/80 border-dark-700 text-white cursor-default focus:ring-0'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 opacity-80">
                                <label className="text-xs text-dark-500 font-bold uppercase tracking-wider ml-1">Email Address (Managed by Auth)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="input-field !pl-16 bg-dark-900/40 border-dark-800 text-dark-400 cursor-not-allowed focus:ring-0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-dark-500 font-bold uppercase tracking-wider ml-1">Member Since</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                    <input
                                        type="text"
                                        value={memberSince}
                                        readOnly
                                        className="input-field pl-12 bg-dark-900/40 border-dark-800 text-dark-400 cursor-not-allowed focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column - Stats & Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Account Statistics */}
                    <div className="card glass p-6 shadow-xl shadow-black/20 border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Account Statistics</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300 flex items-center gap-2"><FileText className="w-4 h-4 text-dark-500" /> Resumes Uploaded</span>
                                <span className="text-white font-bold">{stats.totalResumes}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300 flex items-center gap-2"><Video className="w-4 h-4 text-dark-500" /> Interviews Completed</span>
                                <span className="text-white font-bold">{stats.totalInterviews}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300 flex items-center gap-2"><Activity className="w-4 h-4 text-dark-500" /> Account Age</span>
                                <span className="text-white font-bold">{accountAgeDays} days</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300 flex items-center gap-2"><Target className="w-4 h-4 text-dark-500" /> Last Interview</span>
                                <span className="text-white font-bold">{lastInterviewStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="card glass p-6 shadow-xl shadow-black/20 border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Subscription</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300">Current Plan</span>
                                <span className="text-white font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">Free</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-300">Status</span>
                                <span className="text-emerald-400 font-bold">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card glass p-6 shadow-xl shadow-black/20 border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>

                        <div className="space-y-3">
                            <button className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-3 text-white">
                                <Settings className="w-4 h-4" /> Account Settings
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dark-700 hover:border-dark-600 rounded-lg text-sm bg-dark-800/50 hover:bg-dark-700 transition-colors text-dark-300 font-medium">
                                <Shield className="w-4 h-4" /> Security
                            </button>
                        </div>
                    </div>

                </motion.div>
            </div>

        </div>
    );
}
