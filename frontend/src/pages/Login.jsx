import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Sparkles, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signInWithGoogle, user } = useAuth();
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
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
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
            className="min-h-screen bg-surface-base flex flex-col items-center justify-center pt-32 pb-12 px-6 relative overflow-hidden"
        >
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                 style={{ backgroundImage: 'radial-gradient(var(--stroke) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="card-bento p-8 md:p-10 shadow-2xl shadow-black/5 flex flex-col pt-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-content-base tracking-tight mb-3">Welcome <span className="gradient-text">Back</span></h1>
                        <p className="text-content-muted font-medium">Sign in to your account</p>
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
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs text-content-muted font-bold uppercase tracking-wider">Password</label>
                                <Link to="/forgot-password" className="text-xs text-brand hover:text-content-base font-bold transition-colors">Forgot Password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field input-with-icon pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 mt-4 flex justify-center items-center gap-3 text-content-base font-bold text-lg shadow-lg shadow-brand-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="h-px bg-stroke w-full"></div>
                        <span className="text-content-muted text-xs font-bold uppercase tracking-wider" > OR </span>

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
                        Don't have an account? <Link to="/signup" className="text-brand hover:text-content-base hover:underline transition-all font-bold">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
