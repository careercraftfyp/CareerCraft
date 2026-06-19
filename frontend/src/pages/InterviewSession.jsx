import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Video, Mic, MicOff, PhoneOff, Sparkles,
    Briefcase, Building, ChevronRight, Loader2,
    CheckCircle, AlertCircle, X, Rocket, Cpu, Target, Shield,
    ArrowLeft, FileText, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, isLoading, error }) {
    const location = useLocation();
    const navigate = useNavigate();
    const resumeState = location.state;

    const [position, setPosition] = useState('');
    const [field, setField] = useState(resumeState?.field ? 'Custom' : 'Software Engineering');
    const [customField, setCustomField] = useState(resumeState?.field || '');
    const [resumeText, setResumeText] = useState(resumeState?.resumeContext || '');
    const [difficulty, setDifficulty] = useState('medium');
    const [mode, setMode] = useState('voice + video');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await fetch(`${API_URL.replace('/api', '')}/api/resumes/upload`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                setResumeText(data.fullText);
            } else {
                alert("Failed to upload resume");
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!resumeText) {
            alert("Please upload your resume context first.");
            return;
        }
        const finalField = field === 'Custom' ? customField : field;
        onStart({ position, field: finalField, difficulty, mode, company, jobDescription, resumeText });
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Top Left Navigation */}
            <button
                onClick={() => navigate('/dashboard')}
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-dark-500 hover:text-white transition-colors group px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Command Center</span>
            </button>
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full animate-float-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/10 blur-[120px] rounded-full animate-float-slow" />

            <div className="w-full max-w-2xl relative z-10 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        Neural Simulation Protocol
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 italic uppercase leading-none"
                    >
                        Prepare for <span className="gradient-text">Deployment</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-dark-400 text-lg font-medium max-w-lg mx-auto"
                    >
                        Practice with role-specific AI avatars that adapt to your profile in real-time.
                    </motion.p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card glass p-8 md:p-10 shadow-2xl shadow-black/50 border-white/5"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Resume Upload Section */}
                        <div className="space-y-4 p-6 bg-primary-500/5 rounded-3xl border border-primary-500/10 mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] text-primary-400 font-black uppercase tracking-widest ml-1">
                                    <FileText className="w-3 h-3 inline mr-2" />
                                    Experience Calibration (Resume) *
                                </label>
                                {isUploading && <Loader2 className="w-3 h-3 text-primary-400 animate-spin" />}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full py-8 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-4 group ${
                                    resumeText 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-dark-800/50 border-white/10 text-dark-400 hover:border-primary-500/50 hover:bg-primary-500/5'
                                }`}
                            >
                                <div className={`p-4 rounded-2xl transition-colors ${
                                    resumeText ? 'bg-emerald-500/10' : 'bg-white/5 group-hover:bg-primary-500/10'
                                }`}>
                                    <Rocket className={`w-8 h-8 ${resumeText ? 'text-emerald-400' : 'text-dark-500 group-hover:text-primary-400'}`} />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                                        {resumeText ? 'Neural Profile Synced' : 'Ready for Calibration'}
                                    </p>
                                    <p className="text-[9px] font-bold text-dark-500 uppercase tracking-wider">
                                        {resumeText ? 'Your background is now part of the simulation context' : 'Drop your resume (PDF) here or click to browse'}
                                    </p>
                                </div>
                            </button>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf" 
                                onChange={handleFileChange}
                            />

                            {resumeText && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                        Resume Applied Successfully
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                <Target className="w-3 h-3 inline mr-2 text-primary-400" />
                                Target Position *
                            </label>
                            <input
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="e.g. Senior Frontend Developer"
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                    <Briefcase className="w-3 h-3 inline mr-2 text-primary-400" />
                                    Job Field
                                </label>
                                <select
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                    className="input-field appearance-none cursor-pointer"
                                >
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Product Management">Product Management</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Custom">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                    <Shield className="w-3 h-3 inline mr-2 text-primary-400" />
                                    Difficulty
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="input-field appearance-none cursor-pointer"
                                >
                                    <option value="easy">Easy (Entry Level)</option>
                                    <option value="medium">Medium (Mid Level)</option>
                                    <option value="hard">Hard (Senior Level)</option>
                                </select>
                            </div>
                        </div>

                        {field === 'Custom' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                    <Briefcase className="w-3 h-3 inline mr-2 text-primary-400" />
                                    Please Specify Field *
                                </label>
                                <input
                                    type="text"
                                    value={customField}
                                    onChange={(e) => setCustomField(e.target.value)}
                                    placeholder="e.g. Neuroscience, Architecture, Quantum Physics"
                                    className="input-field"
                                    required={field === 'Custom'}
                                />
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                <Video className="w-3 h-3 inline mr-2 text-primary-400" />
                                Your Camera & Mic
                                <span className="text-dark-600 text-[10px] font-bold ml-2">(AI always uses video)</span>
                            </label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="input-field appearance-none cursor-pointer"
                            >
                                <option value="voice + video">Share Camera & Mic</option>
                                <option value="voice only">Share Mic Only</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                <Building className="w-3 h-3 inline mr-2 text-primary-400" />
                                Target Organization
                            </label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g. OpenAI, SpaceX, Global Tech"
                                className="input-field"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">
                                <Cpu className="w-3 h-3 inline mr-2 text-primary-400" />
                                Job Context / Description
                                <span className="text-dark-600 text-[10px] font-bold ml-2">(Neural Optimization Only)</span>
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job requirements..."
                                rows={4}
                                className="input-field resize-none"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-300 text-sm font-medium leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Synchronizing Avatar...
                                </>
                            ) : (
                                <>
                                    <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Initialize Session
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Pre-flight Check */}
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                        {[
                            'Quiet Environment Required',
                            'Neural Link Enabled (Cam/Mic)',
                            'Clear Communication Path',
                            'Calibrate Persona Input'
                        ].map((tip) => (
                            <div key={tip} className="flex items-center gap-2 text-dark-500 text-[10px] font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                {tip}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="text-center mt-8">
                    <Link to="/dashboard" className="text-dark-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                        ← ABORT TO COMMAND CENTER
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Session Screen ────────────────────────────────────────────────────────────
function SessionScreen({ session, onEnd, isEnding }) {
    const [micOn, setMicOn] = useState(true);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Initialize MediaRecorder when component mounts
    useEffect(() => {
        let stream;
        async function setupAudio() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.start(1000); // Collect data every second
            } catch (err) {
                console.error("Failed to acquire microphone for recording:", err);
            }
        }
        setupAudio();

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleTerminate = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onEnd(audioBlob);
            };
            mediaRecorderRef.current.stop();
        } else {
            // Fallback if no audio recorded
            onEnd(null);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col font-mono">
            {/* HUD Header */}
            <header className="px-6 py-4 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl flex items-center justify-between z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleTerminate}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-dark-400 hover:text-white"
                        title="Back to Command Center"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Live Uplink</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div>
                        <p className="text-white font-black text-xs uppercase italic tracking-wider">{session.meta?.position || 'Mock Interview'}</p>
                        <p className="text-dark-500 text-[10px] font-bold uppercase tracking-widest">{session.meta?.company || 'Neural Agent'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-[10px] text-dark-500 font-black uppercase tracking-widest">Signal Strength</div>
                        <div className="flex gap-0.5 mt-1">
                            {[1, 1, 1, 1, 0.5].map((v, i) => (
                                <div key={i} className="w-1 h-3 rounded-full bg-primary-500" style={{ opacity: v }} />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleTerminate}
                        disabled={isEnding}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                        {isEnding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
                        End & Analyze
                    </button>
                </div>
            </header>

            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Main Interface */}
            <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden relative z-10">
                {/* Visual Feed Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    <iframe
                        src={session.conversationUrl}
                        title="Tavus AI Interviewer"
                        allow="camera; microphone; autoplay; display-capture"
                        className="w-full h-full"
                        style={{ border: 'none' }}
                    />


                </div>

                {/* Tactical Panel */}
                <div className="w-full lg:w-96 bg-dark-900 border-t lg:border-t-0 lg:border-l border-white/5 shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">

                        {/* Audio Controls */}
                        <div>
                            <h3 className="text-[10px] text-dark-500 font-black uppercase tracking-[0.2em] mb-4">Command Channels</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMicOn(v => !v)}
                                    className={`flex flex-col items-center gap-3 py-6 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${micOn
                                        ? 'bg-dark-800 border-white/10 text-white hover:bg-dark-700'
                                        : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                                        }`}
                                >
                                    {micOn ? <Mic className="w-6 h-6 text-primary-400" /> : <MicOff className="w-6 h-6" />}
                                    {micOn ? 'Uplink Open' : 'Uplink Muted'}
                                </button>
                                <div className="bg-dark-800 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 p-4">
                                    <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 w-2/3 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Latency: 142ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Objectives Panel */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] text-dark-500 font-black uppercase tracking-[0.2em]">Deployment Context</h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                            </div>
                            <div className="bg-dark-950/60 rounded-3xl p-6 border border-white/5 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <Target className="w-4 h-4 text-primary-400" />
                                </div>
                                <p className="text-dark-300 text-xs font-medium leading-relaxed italic">
                                    "{session.interviewContext}"
                                </p>
                            </div>
                        </div>

                        {/* Analysis Tips */}
                        <div className="bg-secondary-500/5 border border-secondary-500/10 rounded-3xl p-6">
                            <h3 className="text-[10px] text-secondary-400 font-black uppercase tracking-[0.2em] mb-4">Tactical Advice</h3>
                            <ul className="space-y-3">
                                {[
                                    { icon: Rocket, text: 'Deploy STAR Method Logic' },
                                    { icon: Target, text: 'Calibrate Precision Answers' },
                                    { icon: Shield, text: 'Maintain Neural Composure' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-dark-400 text-[10px] font-bold uppercase tracking-widest">
                                        <item.icon className="w-3.5 h-3.5 text-secondary-500/60" />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer HUD */}
                    <div className="p-6 border-t border-white/5 bg-dark-950/40">
                        <button
                            onClick={handleTerminate}
                            disabled={isEnding}
                            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                        >
                            End Interview
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InterviewSession() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState(null);

    const handleStart = useCallback(async ({ position, field, difficulty, mode, company, jobDescription, resumeText }) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/interviews/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position, field, difficulty, mode, company, jobDescription, resumeText })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to start interview');
            }

            const data = await res.json();
            setSession(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleEnd = useCallback(async (audioBlob) => {
        if (!session?.conversationId) {
            setSession(null);
            return;
        }
        setIsEnding(true);
        try {
            await fetch(`${API_URL}/interviews/${session.conversationId}/end`, {
                method: 'POST'
            });

            if (session.sessionId) {
                const formData = new FormData();
                if (audioBlob && audioBlob.size > 0) {
                    formData.append('audio', audioBlob, 'recording.webm');
                } else {
                    // Append a tiny placeholder so FormData is not entirely empty
                    formData.append('empty_flag', 'true');
                }

                await fetch(`${API_URL}/interviews/${session.sessionId}/evaluate`, {
                    method: 'POST',
                    body: formData
                });
            }

        } catch (err) {
            console.error('Error ending session:', err);
        } finally {
            setIsEnding(false);
            setSession(null);

            if (session?.sessionId) {
                navigate(`/interview/report/${session.sessionId}`);
            }
        }
    }, [session, navigate]);

    return (
        <AnimatePresence mode="wait">
            {session ? (
                <motion.div
                    key="session"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                >
                    <SessionScreen session={session} onEnd={handleEnd} isEnding={isEnding} />
                </motion.div>
            ) : (
                <motion.div
                    key="setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <SetupScreen onStart={handleStart} isLoading={isLoading} error={error} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
