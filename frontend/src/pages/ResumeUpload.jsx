import { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, Rocket, Sparkles, Cpu, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ResumeUpload({ embedded = false }) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Only PDF files are supported for now');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch(`${API_URL}/resumes/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload resume');
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={embedded ? "w-full" : "min-h-screen bg-dark-900 pt-32 pb-24 px-4 relative overflow-hidden"}
        >
            {!embedded && (
                <>
                    {/* Background Accents */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full animate-float-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/5 blur-[120px] rounded-full animate-float-slow" />

                    <div className="max-w-4xl mx-auto relative z-10 mb-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Cpu className="w-4 h-4" />
                            AI Resume Analysis
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none italic uppercase"
                        >
                            Analyze <span className="gradient-text">Resume</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-dark-400 font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            Upload your resume to receive AI-powered feedback, ATS optimization tips, and actionable improvements.
                        </motion.p>
                    </div>
                </>
            )}

            <div className={embedded ? "" : "max-w-5xl mx-auto relative z-10 px-4"}>
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative overflow-hidden card glass border-2 border-dashed p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                                    ${file ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/10 hover:border-primary-500/30'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf"
                                />

                                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl
                                    ${file ? 'bg-gradient-primary text-white rotate-6 scale-110' : 'bg-dark-800 text-dark-500 group-hover:bg-primary-500/20 group-hover:text-primary-400 group-hover:rotate-3'}`}>
                                    {file ? <FileText className="w-12 h-12" /> : <FileUp className="w-12 h-12" />}
                                </div>

                                {file ? (
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{file.name}</h3>
                                        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-dark-400 font-black uppercase tracking-widest">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB Payload
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight group-hover:gradient-text transition-all">Upload Resume</h3>
                                        <p className="text-dark-500 font-bold uppercase tracking-widest text-xs">Drop PDF or click to browse</p>
                                    </div>
                                )}

                                {/* Decorative corners */}
                                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/10" />
                                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/10" />
                                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/10" />
                                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/10" />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4"
                                >
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                    <p className="text-sm text-red-300 font-medium leading-relaxed">{error}</p>
                                </motion.div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="btn-primary w-full py-5 text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 group overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Interrogating Payload...
                                        </>
                                    ) : (
                                        <>
                                            Execute Analysis
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </motion.div>
                    ) : (
                        <ResumeAnalysisResult result={result} onReset={resetUpload} />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
