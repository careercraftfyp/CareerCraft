import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight,
    Copy, Trash2, ChevronDown, ChevronUp, Check,
    Loader2, RotateCcw, Star, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DOMAINS = [
    { name: 'Computer Science', emoji: '💻', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    hover: 'hover:border-blue-500/50 hover:bg-blue-500/15' },
    { name: 'Business',         emoji: '📊', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   hover: 'hover:border-amber-500/50 hover:bg-amber-500/15' },
    { name: 'Marketing',        emoji: '📣', color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    hover: 'hover:border-pink-500/50 hover:bg-pink-500/15' },
    { name: 'Engineering',      emoji: '⚙️', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  hover: 'hover:border-orange-500/50 hover:bg-orange-500/15' },
    { name: 'Finance',          emoji: '💰', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', hover: 'hover:border-emerald-500/50 hover:bg-emerald-500/15' },
    { name: 'Healthcare',       emoji: '🏥', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     hover: 'hover:border-red-500/50 hover:bg-red-500/15' },
    { name: 'Law',              emoji: '⚖️', color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  hover: 'hover:border-purple-500/50 hover:bg-purple-500/15' },
    { name: 'Education',        emoji: '📚', color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    hover: 'hover:border-teal-500/50 hover:bg-teal-500/15' },
];

const STAR_STEPS = [
    { key: 'situation', label: 'Situation', hint: 'Set the scene. Where were you? What was going on?', color: 'text-blue-400' },
    { key: 'task', label: 'Task', hint: 'What was your responsibility or challenge in that situation?', color: 'text-purple-400' },
    { key: 'action', label: 'Action', hint: 'What specific steps did YOU take? Use "I", not "we".', color: 'text-amber-400' },
    { key: 'result', label: 'Result', hint: 'What was the outcome? Quantify where possible.', color: 'text-emerald-400' },
];

export default function STARBuilder() {
    const [step, setStep] = useState(0); // 0=domain, 1=question, 2=star form, 3=result
    const [starStep, setStarStep] = useState(0); // 0=S, 1=T, 2=A, 3=R
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [hoveredDomain, setHoveredDomain] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [starFields, setStarFields] = useState({ situation: '', task: '', action: '', result: '' });
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishedResult, setPolishedResult] = useState(null);
    const [stories, setStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(false);
    const [expandedStory, setExpandedStory] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [staticCount, setStaticCount] = useState(5);

    useEffect(() => {
        fetchStories();
    }, []);

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    const fetchStories = async () => {
        setLoadingStories(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/training/star/stories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStories(data.stories || []);
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        } finally {
            setLoadingStories(false);
        }
    };

    const handleDomainSelect = async (domain) => {
        setSelectedDomain(domain);
        setStep(1);
        setLoadingQuestions(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/training/star/questions?domain=${encodeURIComponent(domain.name)}`);
            const data = await res.json();
            setQuestions(data.questions || []);
            setStaticCount(data.staticCount || 5);
        } catch (err) {
            setError('Failed to load questions. Please try again.');
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleSubmitSTAR = async () => {
        setIsPolishing(true);
        setError(null);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/training/star`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    domain: selectedDomain.name,
                    question: selectedQuestion,
                    ...starFields
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error);
            }
            const data = await res.json();
            setPolishedResult(data.story);
            setStep(3);
            fetchStories(); // refresh story bank
        } catch (err) {
            setError(err.message || 'Failed to polish answer. Please try again.');
        } finally {
            setIsPolishing(false);
        }
    };

    const handleDeleteStory = async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/training/star/stories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStories(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete story', err);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(polishedResult?.polished_answer || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setStep(0);
        setStarStep(0);
        setSelectedDomain(null);
        setSelectedQuestion(null);
        setStarFields({ situation: '', task: '', action: '', result: '' });
        setPolishedResult(null);
        setError(null);
    };

    const currentStarStep = STAR_STEPS[starStep];
    const isLastStarStep = starStep === STAR_STEPS.length - 1;

    return (
        <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
                {['Domain', 'Question', 'STAR', 'Result'].map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${
                            i < step ? 'bg-brand text-white' :
                            i === step ? 'bg-brand/20 text-brand border border-brand/40' :
                            'bg-surface-hover text-content-muted border border-stroke'
                        }`}>
                            {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                            i === step ? 'text-brand' : 'text-content-muted'
                        }`}>{label}</span>
                        {i < 3 && <div className="w-6 h-px bg-stroke mx-1" />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 0: Domain Selection */}
                {step === 0 && (
                    <motion.div key="domain" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-content-base uppercase italic tracking-tight mb-1">Select Your Domain</h3>
                            <p className="text-content-muted text-sm">We'll generate STAR questions tailored to your field.</p>
                        </div>

                        {/* Pill chip selector */}
                        <motion.div className="flex flex-wrap gap-2.5">
                            {DOMAINS.map((domain, i) => {
                                const isHovered = hoveredDomain === domain.name;
                                return (
                                    <motion.button
                                        key={domain.name}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                        whileTap={{ scale: 0.95 }}
                                        onMouseEnter={() => setHoveredDomain(domain.name)}
                                        onMouseLeave={() => setHoveredDomain(null)}
                                        onClick={() => handleDomainSelect(domain)}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                                            isHovered
                                                ? `${domain.bg} ${domain.border} ${domain.color} scale-105 shadow-lg`
                                                : 'border-stroke bg-surface-hover text-content-muted'
                                        }`}
                                    >
                                        <span className="text-base leading-none">{domain.emoji}</span>
                                        <span>{domain.name}</span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>

                        <p className="text-[10px] text-content-muted font-black uppercase tracking-widest">
                            {DOMAINS.length} domains available · Click any to continue
                        </p>
                    </motion.div>
                )}

                {/* STEP 1: Question Selection */}
                {step === 1 && (
                    <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => setStep(0)} className="text-content-muted hover:text-content-base text-xs font-black uppercase tracking-widest transition-colors">← Back</button>
                            <span className="text-content-muted text-xs">|</span>
                            <span className={`text-xs font-black uppercase tracking-widest ${selectedDomain?.color}`}>{selectedDomain?.name}</span>
                        </div>
                        <h3 className="text-xl font-black text-content-base uppercase italic tracking-tight">Choose a Question</h3>
                        <p className="text-content-muted text-sm">Select the behavioral question you want to answer using the STAR method.</p>

                        {loadingQuestions ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-14 bg-surface-hover rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {questions.map((q, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => { setSelectedQuestion(q); setStep(2); setStarStep(0); }}
                                        className="w-full card-bento p-4 flex items-center justify-between gap-4 text-left hover:border-brand/30 hover:bg-brand/5 group transition-all"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <span className={`mt-0.5 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                                                i < staticCount
                                                    ? 'bg-surface-hover text-content-muted border-stroke'
                                                    : `bg-brand/10 text-brand border-brand/20`
                                            }`}>
                                                {i < staticCount ? 'General' : selectedDomain?.name}
                                            </span>
                                            <span className="text-sm font-medium text-content-base leading-snug">{q}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                        {error && <ErrorCard message={error} />}
                    </motion.div>
                )}

                {/* STEP 2: STAR Form */}
                {step === 2 && (
                    <motion.div key="starform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-content-muted">
                                {STAR_STEPS.map((s, i) => (
                                    <span key={s.key} className={i <= starStep ? 'text-brand' : ''}>{s.label[0]}</span>
                                ))}
                            </div>
                            <div className="h-1 bg-surface-hover rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-brand rounded-full"
                                    animate={{ width: `${((starStep + 1) / 4) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>

                        {/* Selected Question Context */}
                        <div className="p-4 bg-surface-hover rounded-xl border border-stroke">
                            <p className="text-[10px] text-content-muted font-black uppercase tracking-widest mb-1">Your Question</p>
                            <p className="text-sm text-content-base font-medium italic">{selectedQuestion}</p>
                        </div>

                        {/* Current STAR Field */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={starStep}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="card-bento p-8 space-y-5"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-6xl font-black italic ${currentStarStep.color}`}>{currentStarStep.label[0]}</span>
                                    <div>
                                        <h4 className="font-black text-content-base text-xl uppercase italic">{currentStarStep.label}</h4>
                                        <p className="text-content-muted text-sm">{currentStarStep.hint}</p>
                                    </div>
                                </div>
                                <textarea
                                    value={starFields[currentStarStep.key]}
                                    onChange={(e) => setStarFields(prev => ({ ...prev, [currentStarStep.key]: e.target.value }))}
                                    placeholder={`Describe the ${currentStarStep.label.toLowerCase()}...`}
                                    rows={5}
                                    className="input-field resize-none w-full"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {error && <ErrorCard message={error} />}

                        <div className="flex gap-3">
                            <button
                                onClick={() => starStep > 0 ? setStarStep(s => s - 1) : setStep(1)}
                                className="btn-secondary"
                            >
                                ← Back
                            </button>
                            {isLastStarStep ? (
                                <button
                                    onClick={handleSubmitSTAR}
                                    disabled={!starFields.result || isPolishing}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPolishing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> AI Coach is polishing your answer...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Polish with AI</>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStarStep(s => s + 1)}
                                    disabled={!starFields[currentStarStep.key]}
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next → {STAR_STEPS[starStep + 1]?.label}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: AI Result */}
                {step === 3 && polishedResult && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        {/* Polished Answer */}
                        <div className="card-bento p-6 border-brand/20 bg-brand/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-brand">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Polished Answer</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-content-muted hover:text-content-base transition-colors px-3 py-1.5 bg-surface-hover rounded-lg border border-stroke"
                                >
                                    {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                                </button>
                            </div>
                            <p className="text-content-base leading-relaxed text-sm">{polishedResult.polished_answer}</p>
                        </div>

                        {/* Improvement Tips */}
                        <div className="card-bento p-6 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-content-muted">3 Improvement Tips from AI Coach</h4>
                            <ul className="space-y-2">
                                {(polishedResult.improvement_tips || []).map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-brand/20">{i + 1}</span>
                                        <span className="text-sm text-content-base">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleReset} className="btn-primary flex-1">
                                <RotateCcw className="w-4 h-4" /> Build Another Story
                            </button>
                            <button
                                onClick={() => document.getElementById('story-bank')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-secondary"
                            >
                                <Star className="w-4 h-4" /> View Story Bank
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STORY BANK ─────────────────────────────────────────────────────── */}
            <div id="story-bank" className="border-t border-stroke pt-8 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-content-muted flex items-center gap-2">
                    <Star className="w-4 h-4 text-brand" /> Story Bank ({stories.length} saved)
                </h3>

                {loadingStories ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-surface-hover rounded-xl animate-pulse" />)}
                    </div>
                ) : stories.length === 0 ? (
                    <div className="py-12 text-center card-bento border-dashed bg-transparent flex flex-col items-center gap-3">
                        <Star className="w-8 h-8 text-content-muted" />
                        <p className="text-content-muted text-xs font-black uppercase tracking-widest">No stories yet. Build your first STAR answer above.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stories.map((story) => (
                            <motion.div key={story.id} layout className="card-bento overflow-hidden">
                                <div
                                    className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface-hover transition-colors"
                                    onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">{story.domain}</span>
                                        </div>
                                        <p className="text-sm font-bold text-content-base truncate">{story.question}</p>
                                        <p className="text-xs text-content-muted mt-1 line-clamp-1">{story.polished_answer?.substring(0, 100)}...</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                                            className="p-2 text-content-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {expandedStory === story.id ? <ChevronUp className="w-4 h-4 text-content-muted" /> : <ChevronDown className="w-4 h-4 text-content-muted" />}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedStory === story.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden border-t border-stroke"
                                        >
                                            <div className="p-5 space-y-4">
                                                <p className="text-sm text-content-base leading-relaxed">{story.polished_answer}</p>
                                                {story.improvement_tips?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">Improvement Tips</p>
                                                        <ul className="space-y-1">
                                                            {story.improvement_tips.map((tip, i) => (
                                                                <li key={i} className="text-xs text-content-muted flex items-start gap-2">
                                                                    <span className="text-brand font-bold">·</span> {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ErrorCard({ message }) {
    return (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{message}</p>
        </div>
    );
}
