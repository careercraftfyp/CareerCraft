import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { updatePassword, user } = useAuth();
    const navigate = useNavigate();

    // If user lands here without a valid recovery session, Supabase will
    // automatically parse the URL hash and establish a session via the
    // onAuthStateChange listener in AuthContext. The `user` object will
    // be populated once that happens.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const { error } = await updatePassword(password);
            if (error) throw error;
            setSuccess(true);
            // Redirect to dashboard after 3 seconds
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-surface-base flex items-center justify-center p-6 relative overflow-hidden"
        >
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-glow blur-[120px] rounded-full animate-float-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/10 blur-[120px] rounded-full animate-float-slow" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="card-bento p-8 md:p-10 shadow-2xl shadow-black/50 border-white/5 mt-12">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-content-base tracking-tight mb-4">Password <span className="text-emerald-500">Updated</span></h2>
                                <p className="text-content-muted font-medium leading-relaxed mb-10">
                                    Your password has been successfully reset. You'll be redirected to your dashboard shortly.
                                </p>
                                <Link to="/dashboard" className="btn-primary w-full py-4 block text-center font-black uppercase tracking-[0.2em] text-sm text-content-base">
                                    Go to Dashboard
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div key="form">
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-black text-content-base tracking-tight mb-3">New <span className="gradient-text">Password</span></h1>
                                    <p className="text-content-muted font-medium">Enter your new password below</p>
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

                                {!user && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-200 font-medium leading-relaxed">
                                            Verifying your reset link... If this takes too long, please request a new reset link from the <Link to="/forgot-password" className="underline font-bold">forgot password</Link> page.
                                        </p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs text-content-muted font-bold uppercase tracking-wider ml-1">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-field input-with-icon pl-12"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-content-muted font-bold uppercase tracking-wider ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-field input-with-icon pl-12"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !user}
                                        className="btn-primary w-full py-4 mt-4 flex justify-center items-center gap-3 text-content-base font-bold text-lg shadow-lg shadow-brand-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>Update Password <ArrowRight className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </form>

                                <p className="text-center text-content-muted mt-10 text-sm font-medium">
                                    Remember your password? <Link to="/login" className="text-brand hover:text-content-base hover:underline transition-all font-bold">Sign in</Link>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
