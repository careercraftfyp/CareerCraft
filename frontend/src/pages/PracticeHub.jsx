import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Target, CheckCircle2, ArrowRight, Sparkles,
    BookOpen, MessageSquare, Zap, Play, Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PracticeHub = () => {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [weakAreas, setWeakAreas] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch(`${API_URL}/interviews/recommendations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            const data = await res.json();
            setRecommendations(data.recommendations || []);
            setWeakAreas(data.weakAreas || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`${API_URL}/interviews/recommendations/${id}/complete`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setRecommendations(prev =>
                    prev.map(ex => ex.id === id ? { ...ex, status: 'completed' } : ex)
                );
                if (selectedExercise?.id === id) {
                    setSelectedExercise(prev => ({ ...prev, status: 'completed' }));
                }
            }
        } catch (err) {
            console.error('Failed to complete exercise:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-dark-400 font-bold uppercase tracking-widest text-xs">Analyzing Performance History...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="space-y-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-primary-400 font-black uppercase tracking-[0.3em] text-[10px]"
                >
                    <Zap className="w-3 h-3 fill-current" /> Neural Training Core
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-white italic uppercase tracking-tight"
                >
                    AI Personalized <span className="gradient-text">Practice Hub</span>
                </motion.h2>
                <p className="text-dark-400 max-w-2xl font-medium">
                    We've analyzed your recent interviews to identify growth patterns. Engage in these targeted exercises to optimize your performance.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identified Weak Areas */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card glass p-6 border-primary-500/20 bg-primary-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Target className="w-24 h-24 text-primary-400" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-400" /> Focus Zones
                        </h3>
                        <div className="space-y-3">
                            {weakAreas.length > 0 ? weakAreas.map((area, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 bg-dark-900/50 p-3 rounded-xl border border-dark-800"
                                >
                                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                    <span className="text-xs font-bold text-slate-300">{area}</span>
                                </motion.div>
                            )) : (
                                <p className="text-xs text-dark-500 italic">Complete more interviews to refine your focus zones.</p>
                            )}
                        </div>
                    </div>

                    <div className="card glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-emerald-400" /> Training ROI
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase text-dark-400 tracking-wider">Completion Rate</span>
                                <span className="text-xl font-black text-white italic">
                                    {Math.round((recommendations.filter(ex => ex.status === 'completed').length / (recommendations.length || 1)) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(recommendations.filter(ex => ex.status === 'completed').length / (recommendations.length || 1)) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exercises List / Detail */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedExercise ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="card glass p-8 border-primary-500/30 bg-primary-500/5 space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                                            {selectedExercise.exercise_type === 'behavioral' ? <MessageSquare className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{selectedExercise.content.title}</h3>
                                            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em]">{selectedExercise.area_of_focus}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedExercise(null)}
                                        className="text-dark-400 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
                                    >
                                        Back to List
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">The Objective</label>
                                        <p className="text-slate-300 text-sm leading-relaxed">{selectedExercise.content.description}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Scenario Context</label>
                                        <div className="p-4 rounded-2xl bg-dark-900/80 border border-dark-800 text-slate-300 text-sm italic leading-relaxed">
                                            "{selectedExercise.content.scenario}"
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-primary-500/10 border border-primary-500/20 space-y-4">
                                    <div className="flex items-center gap-2 text-primary-400">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Expert Advice</span>
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed italic">{selectedExercise.content.targeted_advice}</p>
                                </div>

                                <div className="flex gap-4">
                                    {selectedExercise.status !== 'completed' ? (
                                        <button
                                            onClick={() => handleComplete(selectedExercise.id)}
                                            className="btn-primary w-full md:w-auto"
                                        >
                                            Mark as Completed
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs py-3 px-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <CheckCircle2 className="w-5 h-5" /> Efficiency Certified
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.3em] mb-6">Recommended Drills</h3>
                                {recommendations.map((ex, i) => (
                                    <motion.div
                                        key={ex.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedExercise(ex)}
                                        className={`card glass p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-primary-500/40 hover:bg-primary-500/5 group transition-all ${ex.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl ${ex.status === 'completed' ? 'bg-dark-800 text-dark-400' : 'bg-gradient-primary text-white shadow-primary-500/10'}`}>
                                                {ex.exercise_type === 'behavioral' ? <MessageSquare className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-white uppercase italic tracking-tight">{ex.content.title}</h4>
                                                    {ex.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                                </div>
                                                <p className="text-xs text-dark-400 line-clamp-1">{ex.content.description}</p>
                                                <div className="flex gap-2 pt-1">
                                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-dark-800 text-dark-400 border border-dark-700">{ex.area_of_focus}</span>
                                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">{ex.exercise_type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-dark-400 group-hover:text-primary-400 transition-colors uppercase font-black text-[10px] tracking-widest">
                                            {ex.status === 'completed' ? 'Review' : 'Start Drill'} <Play className={`w-3 h-3 ${ex.status === 'completed' ? 'hidden' : 'block'}`} /> <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.div>
                                ))}

                                {recommendations.length === 0 && (
                                    <div className="py-20 text-center card bg-dark-900/50 border-dashed border-dark-800 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-dark-800 flex items-center justify-center text-dark-600">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <p className="text-dark-400 font-black tracking-[0.2em] uppercase text-[10px] max-w-sm leading-relaxed">The Neural Engine requires more interactive data. Complete more interviews to activate training protocols.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PracticeHub;
