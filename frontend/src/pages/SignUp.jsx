import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignUp() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { signUp, signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) return setError('Password must be at least 8 characters');
        if (!/[A-Z]/.test(password)) return setError('Password must contain at least one uppercase letter');
        if (!/[0-9]/.test(password)) return setError('Password must contain at least one number');
        if (!/[^A-Za-z0-9]/.test(password)) return setError('Password must contain at least one special character/symbol');

        setLoading(true);

        try {
            const { data, error } = await signUp(email, password, fullName);
            if (error) throw error;

            // Supabase returns an empty identities array if the user already exists 
            // when email enumeration protection is enabled
            if (data?.user?.identities != null && data.user.identities.length === 0) {
                setError('Email is already in use');
                return;
            }

            // If Supabase returns a session immediately, email confirmation is OFF.
            // We don't need to show the "Check Email" screen, they will be auto-redirected.
            if (!data?.session) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message || 'Google sign in failed');
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center bg-surface-base pt-32 pb-12 px-4 relative overflow-hidden"
        >
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                 style={{ backgroundImage: 'radial-gradient(var(--stroke) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="card-bento p-8 md:p-10 shadow-2xl shadow-black/5 mt-12 flex flex-col">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-content-base tracking-tight mb-4">Check <span className="text-emerald-500">Email</span></h2>
                                <p className="text-content-muted font-medium leading-relaxed mb-10">
                                    We've sent a verification link to <span className="text-content-base font-bold">{email}</span>.<br />
                                    Please verify your account to continue.
                                </p>
                                <Link to="/login" className="btn-secondary w-full py-4 block text-center font-black uppercase tracking-[0.2em] text-sm">
                                    Return to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div key="form">
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-black text-content-base tracking-tight mb-3">Create <span className="gradient-text">Account</span></h1>
                                    <p className="text-content-muted font-medium">Sign up to get started</p>
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

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs text-content-muted font-bold uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="John Doe"
                                                className="input-field input-with-icon pl-12"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-content-muted font-bold uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
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

                                    <div className="space-y-2">
                                        <label className="text-xs text-content-muted font-bold uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="input-field input-with-icon pl-12 pr-12"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand transition-colors cursor-pointer"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-4 mt-6 flex justify-center items-center gap-3 text-content-base font-bold text-lg shadow-lg shadow-brand-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>Sign Up <ArrowRight className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 flex items-center justify-center gap-4">
                                    <div className="h-px bg-stroke w-full"></div>
                                    <span className="text-content-muted text-xs font-bold uppercase tracking-wider">OR</span>
                                    <div className="h-px bg-stroke w-full"></div>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full mt-6 py-4 rounded-xl border border-stroke bg-surface-card text-content-base font-bold text-sm hover:bg-surface-hover hover:border-brand/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <p className="text-center text-content-muted mt-10 text-sm font-medium">
                                    Already have an account? <Link to="/login" className="text-brand hover:text-content-base hover:underline transition-all font-bold">Log in</Link>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
