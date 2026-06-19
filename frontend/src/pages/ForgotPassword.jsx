import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const { resetPassword, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await resetPassword(email);
            if (error) throw error;
            setSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden"
        >
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full animate-float-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/10 blur-[120px] rounded-full animate-float-slow" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="card glass p-8 md:p-10 shadow-2xl shadow-black/50 border-white/5 mt-12">
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-4">Check <span className="text-emerald-400">Email</span></h2>
                                <p className="text-dark-400 font-medium leading-relaxed mb-4">
                                    We've sent a password reset link to <span className="text-white font-bold">{email}</span>.
                                </p>
                                <p className="text-dark-500 text-sm leading-relaxed mb-10">
                                    Click the link in the email to reset your password. If you don't see it, check your spam folder.
                                </p>
                                <Link to="/login" className="btn-secondary w-full py-4 block text-center font-black uppercase tracking-[0.2em] text-sm">
                                    Return to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div key="form">
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-black text-white tracking-tight mb-3">Reset <span className="gradient-text">Password</span></h1>
                                    <p className="text-dark-400 font-medium">Enter your email and we'll send you a reset link</p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-200 font-medium leading-relaxed">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-dark-500 font-bold uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="agent@domain.ai"
                                                className="input-field input-with-icon pl-12"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-4 mt-4 flex justify-center items-center gap-3 text-white font-bold text-lg shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>Send Reset Link <ArrowRight className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </form>

                                <p className="text-center text-dark-500 mt-10 text-sm font-medium">
                                    Remember your password? <Link to="/login" className="text-primary-400 hover:text-white hover:underline transition-all font-bold">Sign in</Link>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
