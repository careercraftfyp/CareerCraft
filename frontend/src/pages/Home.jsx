import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Brain,
    Target,
    TrendingUp,
    Users,
    Zap,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
    {
        icon: <Brain className="w-8 h-8" />,
        title: "See exactly what's wrong.",
        description:
            'Upload your resume to find the gaps. We show you what recruiter systems see and what they reject.',
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: 'Practice out loud.',
        description:
            'Talk through real interview scenarios. We listen to your tone, pacing, and answers, then tell you how to do better.',
    },
    {
        icon: <TrendingUp className="w-8 h-8" />,
        title: 'Know your stats.',
        description:
            'See a clear breakdown of your strengths and weak points. Track your performance automatically as you practice.',
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: 'Act on real feedback.',
        description:
            'Stop guessing. Get clear notes on your confidence, pacing, and technical answers immediately.',
    },
];

const benefits = [
    'Increase interview success rate by 3x',
    'Optimize resume for ATS systems',
    'Get personalized career insights',
    'Track professional development progress',
    'Access industry best practices',
    'Secure cloud storage for documents',
];

const stats = [
    { stat: '10K+', label: 'Analysis' },
    { stat: '95%', label: 'Success Rate' },
    { stat: '3x', label: 'Faster Hiring' },
];

const Home = () => (
    <div className="min-h-screen bg-surface-base text-content-base">

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Base grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'radial-gradient(var(--stroke) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-stroke bg-surface-card mb-8 text-sm font-bold text-brand shadow-sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Know exactly where you stand.
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
                        <span className="text-brand">Get the job</span>
                        <br />
                        <span className="text-content-base">you actually want.</span>
                    </h1>

                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium text-content-muted">
                        See exactly how your resume scores against hiring filters. Practice the hard questions until you know the answers cold.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="btn-primary px-8 py-4 rounded-xl text-lg shadow-lg shadow-brand-glow">
                            <Logo className="w-6 h-6 mr-2" />
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/services"
                            className="px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 bg-surface-card border border-stroke text-content-base hover:bg-surface-hover hover:border-brand">
                            Learn More <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-20 inline-flex items-center justify-center p-2 rounded-3xl bg-surface-card/50 backdrop-blur-xl border border-stroke shadow-2xl">
                    <div className="flex items-center divide-x divide-stroke">
                        {stats.map((s, i) => (
                            <div key={i} className="px-8 py-2 text-center">
                                <div className="text-3xl font-black text-brand italic tracking-tight">{s.stat}</div>
                                <div className="text-[10px] mt-1 font-bold tracking-widest uppercase text-content-muted">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>

        {/* ── Features ── */}
        <section className="py-32 bg-surface-base relative border-y border-stroke overflow-hidden">
            <div className="absolute top-0 right-1/4 w-full max-w-[600px] aspect-square bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }} viewport={{ once: true }}
                    className="mb-20 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-content-base leading-tight">
                        Stop guessing. <br/><span className="text-brand">Start practicing.</span>
                    </h2>
                    <p className="text-xl font-medium text-content-muted leading-relaxed">
                        We test your resume against ATS filters and run realistic mock interviews to show you exactly what to fix before it counts.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                                borderColor: 'var(--brand)',
                                backgroundColor: 'var(--surface-hover)',
                            }}
                            transition={{ duration: 0.15 }} 
                            viewport={{ once: true }}
                            className="relative group p-10 rounded-[32px] bg-gradient-to-br from-surface-card to-surface-base border border-stroke transition-all overflow-hidden shadow-xl cursor-pointer">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[60px] group-hover:bg-brand/15 transition-colors duration-500 rounded-full" />
                            <div className="mb-8 text-brand/80 group-hover:text-brand transition-colors duration-300">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-content-base">{f.title}</h3>
                            <p className="text-lg font-medium leading-relaxed text-content-muted">{f.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-24 bg-surface-base">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-content-base">
                            Know exactly <span className="text-brand">where you stand.</span>
                        </h2>
                        <p className="text-lg mb-8 leading-relaxed font-medium text-content-muted">
                            Stop sending resumes into the void. Get real data on your interview performance and resume score.
                        </p>
                        <div className="space-y-4">
                            {benefits.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                                    whileHover={{ x: 3, color: 'var(--brand)' }}
                                    transition={{ 
                                        type: 'spring', 
                                        stiffness: 400, 
                                        damping: 25,
                                        x: { duration: 0.2 } 
                                    }} 
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 cursor-default group">
                                    <CheckCircle className="w-5 h-5 shrink-0 text-brand group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-content-base transition-colors">{b}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/signup" className="btn-primary px-8 py-4 rounded-xl text-base shadow-lg shadow-brand-glow">
                                Start Your Journey <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                        whileHover={{ 
                            borderColor: 'var(--brand)',
                            backgroundColor: 'var(--surface-hover)',
                        }}
                        transition={{ duration: 0.15 }}
                        viewport={{ once: true }}
                        className="card-bento p-10 bg-surface-card border-2 cursor-pointer">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-6 shadow-xl">
                                <Logo className="w-full h-full" />
                            </div>
                            <h3 className="text-2xl font-black text-content-base">Ready to Launch?</h3>
                            <p className="mt-2 font-medium text-content-muted">Choose a plan that works for you</p>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 rounded-xl border border-stroke bg-surface-hover">
                                <span className="font-bold text-content-base">Free Plan</span>
                                <span className="font-bold text-content-muted">$0/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl border-2 border-brand bg-brand-glow">
                                <span className="font-bold text-brand">Premium Plan</span>
                                <span className="font-black text-content-base">$19/mo</span>
                            </div>
                        </div>
                        <Link to="/pricing" className="btn-primary w-full py-4 rounded-xl justify-center text-sm font-bold">
                            View All Plans
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>

        <section className="py-32 relative overflow-hidden bg-surface-base border-t border-stroke">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(var(--content-base) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                        borderColor: 'rgba(200, 141, 142, 0.4)',
                    }}
                    transition={{ duration: 0.3 }}
                    viewport={{ once: true }}
                    className="p-8 sm:p-16 md:p-24 rounded-[32px] md:rounded-[48px] bg-gradient-to-b from-surface-card to-surface-base border border-stroke text-center relative overflow-hidden shadow-2xl cursor-default">
                    
                    {/* Inner glowing orb */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] md:w-[800px] h-[300px] md:h-[400px] bg-brand/10 blur-[120px] pointer-events-none rounded-[100%]" />

                    <Zap className="w-16 h-16 text-brand mx-auto mb-8 relative z-10 drop-shadow-[0_0_15px_rgba(224,180,178,0.5)]" />
                    <h2 className="text-4xl md:text-6xl font-black text-content-base mb-8 tracking-tight relative z-10">
                        Ready to prove your skills?
                    </h2>
                    <p className="text-lg sm:text-2xl mb-12 max-w-2xl mx-auto font-medium text-content-muted relative z-10">
                        Stop guessing what recruiters want. Start practicing with instant, actionable feedback.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link to="/signup"
                            className="font-black text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105 bg-brand text-white shadow-xl shadow-brand-glow">
                            Get Started Free
                        </Link>
                        <Link to="/services"
                            className="font-bold text-lg px-10 py-5 rounded-2xl border border-stroke text-content-base bg-surface-card hover:bg-surface-hover hover:border-brand transition-all">
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>

    </div>
);

export default Home;
