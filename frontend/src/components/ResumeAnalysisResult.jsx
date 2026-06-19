import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResumeAnalysisResult({ result, onReset }) {
    const navigate = useNavigate();

    if (!result) return null;

    // Support both the upload response format and the history format
    const analysis = result.analysis;
    const fullText = result.full_text || result.fullText || result.parsedTextPreview;
    const fileName = result.file_name || result.fileName;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-20"
        >
            {/* Summary Core Card */}
            <div className="card-bento p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-brand-glow blur-[120px] rounded-full group-hover:bg-brand-glow transition-colors" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="74"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-content-base/5"
                                />
                                <motion.circle
                                    initial={{ strokeDashoffset: 465 }}
                                    animate={{ strokeDashoffset: 465 - (465 * analysis.overall_score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="80"
                                    cy="80"
                                    r="74"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    fill="transparent"
                                    strokeDasharray={465}
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0ea5e9" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-content-base italic tracking-tighter">{analysis.overall_score}</span>
                                <span className="text-[10px] text-content-muted font-black uppercase tracking-[0.2em]">Rating</span>
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                <CheckCircle2 className="w-3 h-3" />
                                {fileName || 'Analysis Complete'}
                            </div>
                            <h2 className="text-4xl font-black text-content-base italic uppercase tracking-tight mb-2">Neural <span className="gradient-text">Profile</span></h2>
                            <p className="text-content-muted font-bold uppercase tracking-[0.2em] text-sm">Sector: <span className="text-brand">{analysis.field_of_expertise}</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        {onReset && (
                            <button
                                onClick={onReset}
                                className="btn-secondary py-4 px-10 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                                Re-Initialize
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/interview', {
                                state: {
                                    resumeContext: fullText,
                                    field: analysis.field_of_expertise
                                }
                            })}
                            className="btn-primary py-4 px-10 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 border-0 bg-brand"
                        >
                            Enter Simulation
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'ATS Compatibility', score: analysis.ats_compatibility_score, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    { label: 'Impact / Metrics', score: analysis.impact_score, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Action Verbs', score: analysis.action_verbs_score, color: 'text-indigo-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                ].map((metric, i) => (
                    <div key={i} className={`card p-6 border ${metric.border} ${metric.bg} backdrop-blur-sm flex flex-col items-center justify-center text-center`}>
                        <div className={`text-4xl font-black italic tracking-tighter mb-2 ${metric.color}`}>{metric.score}</div>
                        <div className="text-[10px] text-content-base font-black uppercase tracking-[0.2em]">{metric.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Errors & Warnings */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    {/* Critical Errors */}
                    {analysis.critical_errors?.length > 0 && (
                        <div className="card-bento p-8 border-red-500/30 bg-red-500/5">
                            <h3 className="text-xl font-black text-content-base italic uppercase tracking-tight mb-6 flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                Critical ATS Errors
                            </h3>
                            <ul className="space-y-4">
                                {analysis.critical_errors.map((error, i) => (
                                    <li key={i} className="bg-surface-hover p-4 rounded-2xl border border-red-500/20">
                                        <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> ISSUE:
                                        </div>
                                        <p className="text-content-base text-sm font-medium mb-3">{error.issue}</p>

                                        <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> FIX:
                                        </div>
                                        <p className="text-content-base text-sm">{error.fix}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Formatting Warnings */}
                    {analysis.formatting_warnings?.length > 0 && (
                        <div className="card-bento p-8 border-yellow-500/20 bg-yellow-500/5">
                            <h3 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] mb-6">Structural Verification</h3>
                            <ul className="space-y-3">
                                {analysis.formatting_warnings.map((issue, i) => (
                                    <li key={i} className="text-content-base text-sm font-medium flex gap-3 items-start">
                                        <span className="text-yellow-500 font-black mt-0.5">!</span> {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>

                {/* Right Column: Skills & Advice */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-8"
                >
                    {/* Keyword Optimization */}
                    <div className="card-bento p-8 border-stroke bg-surface-hover">
                        <h3 className="text-xl font-black text-content-base italic uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Target className="w-6 h-6 text-accent-400" />
                            Missing Core Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missing_critical_keywords?.length > 0 ? (
                                analysis.missing_critical_keywords.map((word, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-accent-500/10 text-accent-300 border border-accent-500/20 text-xs font-bold uppercase tracking-wider">
                                        {word}
                                    </span>
                                ))
                            ) : (
                                <span className="text-content-muted text-sm italic">No critical keywords missing for this sector.</span>
                            )}
                        </div>
                    </div>

                    {/* Tactical Improvements */}
                    <div className="card-bento p-8 border-brand/20 bg-brand/5">
                        <h3 className="text-xl font-black text-content-base italic uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-brand" />
                            Strategic Refinements
                        </h3>
                        <ul className="space-y-5">
                            {analysis.actionable_feedback?.map((item, i) => (
                                <li key={i} className="flex gap-4 group">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(14,165,233,0.5)] shrink-0 group-hover:scale-150 transition-transform" />
                                    <p className="text-content-base font-medium leading-relaxed">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
