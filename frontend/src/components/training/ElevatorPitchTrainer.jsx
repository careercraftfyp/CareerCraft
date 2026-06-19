import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Square,
    RotateCcw, ChevronDown, ChevronUp, AlertCircle, Loader2,
    Check, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DOMAINS = [
    { name: 'Computer Science', emoji: '💻', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
    { name: 'Business',         emoji: '📊', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
    { name: 'Marketing',        emoji: '📣', color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/30' },
    { name: 'Engineering',      emoji: '⚙️', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30' },
    { name: 'Finance',          emoji: '💰', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { name: 'Healthcare',       emoji: '🏥', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30' },
    { name: 'Law',              emoji: '⚖️', color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30' },
    { name: 'Education',        emoji: '📚', color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/30' },
];

// Circular Score Gauge component
function ScoreGauge({ score, max = 10, label, color = 'var(--brand)' }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const pct = score / max;
    const strokeDashoffset = circumference - pct * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--surface-hover)" strokeWidth="10" />
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="transparent" stroke={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-content-base italic">{score}</span>
                    <span className="text-[9px] text-content-muted font-bold">/ {max}</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-content-muted">{label}</span>
        </div>
    );
}

export default function ElevatorPitchTrainer() {
    const [step, setStep] = useState(0); // 0=domain, 1=input, 2=result
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [hoveredDomain, setHoveredDomain] = useState(null);
    const [activeTab, setActiveTab] = useState('type'); // 'type' | 'record'

    // Type tab state
    const [pitchText, setPitchText] = useState('');
    const [timerActive, setTimerActive] = useState(false);
    const [timerValue, setTimerValue] = useState(60);
    const timerRef = useRef(null);

    // Record tab state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcribedText, setTranscribedText] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    // Submission state
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [result, setResult] = useState(null);
    const [showExample, setShowExample] = useState(false);
    const [error, setError] = useState(null);

    // Progress chart state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [filterDomain, setFilterDomain] = useState('');

    const wordCount = (pitchText || transcribedText).trim().split(/\s+/).filter(Boolean).length;

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (selectedDomain) fetchHistory(selectedDomain.name);
    }, [selectedDomain]);

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    const fetchHistory = async (domain) => {
        setLoadingHistory(true);
        try {
            const token = await getToken();
            const url = `${API_URL}/training/pitch/history${domain ? `?domain=${encodeURIComponent(domain)}` : ''}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setHistory(data.attempts || []);
        } catch (err) {
            console.error('Failed to fetch pitch history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const startTimer = () => {
        setTimerValue(60);
        setTimerActive(true);
        timerRef.current = setInterval(() => {
            setTimerValue(v => {
                if (v <= 1) {
                    clearInterval(timerRef.current);
                    setTimerActive(false);
                    return 0;
                }
                return v - 1;
            });
        }, 1000);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.start(500);
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access in your browser settings.');
        }
    };

    const stopRecording = () => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                resolve(blob);
                // stop all tracks
                mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
            };
            mediaRecorderRef.current.stop();
            clearInterval(recordingTimerRef.current);
            setIsRecording(false);
        });
    };

    const handleStopAndTranscribe = async () => {
        const blob = await stopRecording();
        if (!blob) return;
        setIsTranscribing(true);
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('audio', blob, 'pitch.webm');
            const res = await fetch(`${API_URL}/training/transcribe`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            setTranscribedText(data.transcript || '');
        } catch (err) {
            setError('Failed to transcribe audio. Please try the text tab instead.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleSubmit = async () => {
        const textToSubmit = activeTab === 'type' ? pitchText : transcribedText;
        if (!textToSubmit) return;
        setIsEvaluating(true);
        setError(null);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/training/pitch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ pitchText: textToSubmit, domain: selectedDomain.name })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            setResult(data.attempt);
            setStep(2);
            fetchHistory(selectedDomain.name);
        } catch (err) {
            setError(err.message || 'Evaluation failed. Please try again.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const formatTime = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

    const chartData = history.map((a, i) => ({
        attempt: `#${a.attempt_number || i + 1}`,
        Structure: a.structure_score,
        Tone: a.tone_score,
        Overall: a.overall_score
    }));

    // word count: green below 140, amber 140-150 (approaching limit), red over 150
    const wordCountColor = wordCount > 150 ? 'text-red-400' : wordCount >= 140 ? 'text-amber-400' : wordCount > 0 ? 'text-emerald-400' : 'text-content-muted';

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">

                {/* STEP 0: Domain Selection */}
                {step === 0 && (
                    <motion.div key="domain" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-content-base uppercase italic tracking-tight mb-1">Select Your Domain</h3>
                            <p className="text-content-muted text-sm">The AI will tailor evaluation and example pitch to your field.</p>
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
                                        onClick={() => { setSelectedDomain(domain); setStep(1); }}
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

                {/* STEP 1: Pitch Input */}
                {step === 1 && (
                    <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setStep(0)} className="text-content-muted hover:text-content-base text-xs font-black uppercase tracking-widest transition-colors">← Back</button>
                            <span className="text-content-muted text-xs">|</span>
                            <span className={`text-xs font-black uppercase tracking-widest ${selectedDomain?.color}`}>
                                One-Minute Elevator Pitch — {selectedDomain?.name}
                            </span>
                        </div>

                        {/* Tab Toggle */}
                        <div className="flex bg-surface-hover rounded-xl p-1 w-fit border border-stroke">
                            {['type', 'record'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab ? 'bg-brand text-white shadow-md' : 'text-content-muted hover:text-content-base'
                                    }`}
                                >
                                    {tab === 'type' ? '⌨ Type' : '🎙 Record'}
                                </button>
                            ))}
                        </div>

                        {/* TYPE TAB */}
                        {activeTab === 'type' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="card-bento p-6 space-y-4">
                                    <textarea
                                        value={pitchText}
                                        onChange={e => setPitchText(e.target.value)}
                                        placeholder="Hi, I'm [Name]. I'm a [role] with experience in [skills]. My goal is to [value proposition]..."
                                        rows={7}
                                        className="input-field resize-none w-full"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-black uppercase tracking-widest ${wordCountColor}`}>
                                            {wordCount} / 150 max words
                                            {wordCount > 150 && <span className="ml-1">⚠ Over limit</span>}
                                        </span>
                                        {!timerActive ? (
                                            <button onClick={startTimer} className="btn-secondary text-xs px-4 py-2">
                                                ⏱ Start 60s Timer
                                            </button>
                                        ) : (
                                            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                                                timerValue <= 10 ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-brand border-brand/20 bg-brand/5'
                                            }`}>
                                                ⏱ {timerValue}s remaining
                                            </div>
                                        )}
                                    </div>
                                    {timerValue === 0 && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold">
                                            ⏱ Time's up! Submit what you have — AI will evaluate your progress so far.
                                        </div>
                                    )}
                                    {wordCount > 150 && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                                            ✂ Over 150 words — try to trim for a sharper 60-second pitch.
                                        </div>
                                    )}
                                </div>
                                {wordCount > 0 && wordCount <= 30 && (
                                    <p className="text-xs text-content-muted">Write a bit more — AI will give better feedback with more context, but you can submit anytime.</p>
                                )}
                            </motion.div>
                        )}

                        {/* RECORD TAB */}
                        {activeTab === 'record' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="card-bento p-8 flex flex-col items-center gap-6">
                                    {isTranscribing ? (
                                        <div className="flex flex-col items-center gap-4 py-8">
                                            <Loader2 className="w-10 h-10 text-brand animate-spin" />
                                            <p className="text-xs font-black uppercase tracking-widest text-content-muted">Transcribing Audio...</p>
                                        </div>
                                    ) : transcribedText ? (
                                        <div className="w-full space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">Transcribed Pitch</p>
                                            <div className="p-4 bg-surface-hover rounded-xl border border-stroke text-sm text-content-base leading-relaxed">
                                                {transcribedText}
                                            </div>
                                            <button
                                                onClick={() => { setTranscribedText(''); setRecordingTime(0); }}
                                                className="text-xs text-content-muted hover:text-content-base font-bold uppercase tracking-widest transition-colors"
                                            >
                                                ← Record Again
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={isRecording ? handleStopAndTranscribe : startRecording}
                                                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 ${
                                                    isRecording
                                                        ? 'bg-red-500/20 border-red-500 text-red-400'
                                                        : 'bg-brand/20 border-brand text-brand hover:bg-brand hover:text-white'
                                                }`}
                                            >
                                                {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                                            </motion.button>
                                            {isRecording && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-sm font-black text-red-400 uppercase tracking-widest">{formatTime(recordingTime)}</span>
                                                </motion.div>
                                            )}
                                            <p className="text-xs text-content-muted text-center">
                                                {isRecording ? 'Click stop when finished — audio will be transcribed automatically' : 'Click the mic to start recording your 60-second pitch'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {error && <ErrorCard message={error} />}

                        <button
                            onClick={handleSubmit}
                            disabled={
                                isEvaluating ||
                                (activeTab === 'type' && wordCount === 0) ||
                                (activeTab === 'record' && !transcribedText)
                            }
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEvaluating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> AI is evaluating your pitch...</>
                            ) : (
                                <>Submit for Evaluation <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: Results */}
                {step === 2 && result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        {/* Word Count Banner — only warn when over the limit */}
                        {result.word_count > 150 && (
                            <div className="p-3 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                                ✂ {result.word_count} words — over the 150-word limit. Trimming to under 150 will make your pitch sharper and fit within 60 seconds.
                            </div>
                        )}

                        {/* Score Gauges */}
                        <div className="card-bento p-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-content-muted mb-8 text-center">Your Pitch Scores</h4>
                            <div className="flex justify-around flex-wrap gap-6">
                                <ScoreGauge score={result.structure_score} label="Structure" color="#3b82f6" />
                                <ScoreGauge score={result.tone_score} label="Tone" color="var(--brand)" />
                                <ScoreGauge score={result.overall_score} label="Overall" color="#10b981" />
                            </div>
                        </div>

                        {/* AI Feedback */}
                        <div className="card-bento p-6 space-y-3 border-brand/20 bg-brand/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand">AI Coach Feedback</p>
                            <p className="text-sm text-content-base leading-relaxed">{result.feedback}</p>
                        </div>

                        {/* Example Pitch (collapsible) */}
                        <div className="card-bento overflow-hidden">
                            <button
                                onClick={() => setShowExample(v => !v)}
                                className="w-full p-5 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
                            >
                                <span className="text-xs font-black uppercase tracking-widest text-content-base">See Example Pitch</span>
                                {showExample ? <ChevronUp className="w-4 h-4 text-content-muted" /> : <ChevronDown className="w-4 h-4 text-content-muted" />}
                            </button>
                            <AnimatePresence>
                                {showExample && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-stroke"
                                    >
                                        <div className="p-5">
                                            <p className="text-sm text-content-base leading-relaxed italic">{result.example_pitch}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={() => { setStep(1); setResult(null); setPitchText(''); setTranscribedText(''); setTimerValue(60); setTimerActive(false); }} className="btn-secondary w-full">
                            <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PROGRESS CHART ─────────────────────────────────────────────────── */}
            {selectedDomain && (
                <div className="border-t border-stroke pt-8 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-content-muted">Progress Over Time</h3>
                        <select
                            value={filterDomain}
                            onChange={e => { setFilterDomain(e.target.value); fetchHistory(e.target.value || undefined); }}
                            className="input-field text-xs py-1.5 px-3 w-auto"
                        >
                            <option value="">All Domains</option>
                            {DOMAINS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>

                    {loadingHistory ? (
                        <div className="h-48 bg-surface-hover rounded-xl animate-pulse" />
                    ) : chartData.length === 0 ? (
                        <div className="py-12 text-center card-bento border-dashed bg-transparent flex flex-col items-center gap-3">
                            <p className="text-content-muted text-xs font-black uppercase tracking-widest">Complete your first pitch to see your progress here.</p>
                        </div>
                    ) : (
                        <div className="card-bento p-6" style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="var(--stroke)" vertical={false} />
                                    <XAxis dataKey="attempt" stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" />
                                    <YAxis stroke="var(--content-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} fontWeight="bold" />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--stroke)', borderRadius: '12px', fontWeight: 'bold' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    <Line type="monotone" dataKey="Structure" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Tone" stroke="var(--brand)" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Overall" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
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
