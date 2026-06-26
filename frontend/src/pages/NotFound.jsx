import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Terminal, Home, LayoutDashboard, Compass } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
    const location = useLocation();
    
    // Generate a pseudo-random diagnostic ID
    const diagnosticId = 'ERR-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 min-h-screen bg-surface-base flex items-center justify-center relative overflow-hidden"
        >
            <SEO 
                title="404 - Page Not Found"
                description="The requested career route path does not exist in CareerCraft's systems. Re-align your path here."
            />

            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-brand/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="max-w-xl w-full px-6 relative z-10 flex flex-col items-center text-center space-y-10">
                {/* Visual Icon Header */}
                <motion.div 
                    initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    className="relative flex items-center justify-center w-24 h-24 bg-brand/10 border border-brand/20 rounded-[30px]"
                >
                    <Compass className="w-12 h-12 text-brand animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-brand"></span>
                    </span>
                </motion.div>

                {/* Main Heading Section */}
                <div className="space-y-4">
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl md:text-8xl font-black text-brand italic tracking-tighter leading-none uppercase"
                    >
                        404
                    </motion.h1>
                    <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl md:text-3xl font-black text-content-base tracking-tight uppercase"
                    >
                        TRAJECTORY LOST
                    </motion.h2>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-content-muted font-medium max-w-md mx-auto text-sm md:text-base"
                    >
                        The neural node you are attempting to access has decayed or does not exist in our system trajectory.
                    </motion.p>
                </div>

                {/* Simulated Diagnostic Terminal Card */}
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="card-bento w-full max-w-md p-6 font-mono text-left text-xs bg-surface-card border border-stroke shadow-xl relative group overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-stroke pb-3 mb-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#E57373]/60" />
                            <span className="w-3 h-3 rounded-full bg-[#F0B27A]/60" />
                            <span className="w-3 h-3 rounded-full bg-[#81C784]/60" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-brand font-black uppercase tracking-wider">
                            <Terminal className="w-3 h-3" /> ROUTE_DIAGNOSTICS
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-content-muted">
                        <p><span className="text-brand font-bold">&gt; REQUEST_URI:</span> <span className="text-content-base break-all">{location.pathname}</span></p>
                        <p><span className="text-brand font-bold">&gt; RESOLVE_STATUS:</span> <span className="text-red-400 font-bold">ERR_NOT_FOUND</span></p>
                        <p><span className="text-brand font-bold">&gt; DIAGNOSTIC_ID:</span> <span className="text-content-base">{diagnosticId}</span></p>
                        <p><span className="text-brand font-bold">&gt; TIMESTAMP:</span> <span className="text-content-base">{new Date().toISOString()}</span></p>
                        <div className="h-px bg-stroke my-3" />
                        <p className="animate-pulse text-brand font-semibold">&gt; Scanning for valid system protocols...</p>
                    </div>
                </motion.div>

                {/* Action CTA Buttons */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                >
                    <Link 
                        to="/" 
                        className="btn-primary py-4 px-8 text-xs font-black tracking-widest uppercase hover:-translate-y-0.5"
                        id="btn-404-home"
                    >
                        <Home className="w-4 h-4" /> INITIALIZE CORE ROUTE
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className="btn-secondary py-4 px-8 text-xs font-black tracking-widest uppercase border border-stroke rounded-2xl hover:border-brand hover:bg-surface-hover transition-all"
                        id="btn-404-dashboard"
                    >
                        <LayoutDashboard className="w-4 h-4 text-brand" /> DASHBOARD ACCESS
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
