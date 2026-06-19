import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Rocket,
    Brain,
    Target,
    TrendingUp,
    Users,
    Zap,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';

const features = [
    {
        icon: <Brain className="w-8 h-8" />,
        title: 'AI-Powered Analysis',
        description:
            'Advanced algorithms analyze your resume and provide personalized insights for optimization.',
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: 'ATS Optimization',
        description:
            'Ensure your resume passes through Applicant Tracking Systems with keyword optimization.',
    },
    {
        icon: <TrendingUp className="w-8 h-8" />,
        title: 'Career Growth',
        description:
            'Track your progress and get recommendations for skill development and career advancement.',
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: 'Expert Guidance',
        description:
            'Access industry insights and best practices from career development professionals.',
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
    { stat: '10K+', label: 'Professionals' },
    { stat: '95%', label: 'Success Rate' },
    { stat: '3x', label: 'Faster Hiring' },
];

const Home = () => (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0b0f19' }}>

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
                    style={{ background: 'rgba(14,165,233,0.1)', animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
                    style={{ background: 'rgba(217,70,239,0.1)', animation: 'float 6s ease-in-out infinite', animationDelay: '3s' }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

                    <div className="inline-flex items-center px-4 py-2 rounded-full border mb-8 text-sm font-medium"
                        style={{ background: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.3)', color: '#38bdf8' }}>
                        <Zap className="w-4 h-4 mr-2" />
                        AI-Powered Career Platform
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                        <span className="gradient-text">Supercharge</span>
                        <br />
                        <span className="text-white">Your Career</span>
                    </h1>

                    <p className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: '#94a3b8' }}>
                        AI-powered interview preparation and resume optimization platform that helps professionals
                        land their dream jobs with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="btn-primary px-8 py-4 rounded-xl text-lg">
                            <Rocket className="w-5 h-5" />
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/services"
                            className="px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
                            style={{ border: '1px solid #475569', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}>
                            Learn More <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-bold gradient-text">{s.stat}</div>
                            <div className="text-sm mt-1" style={{ color: '#94a3b8' }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>

        {/* ── Features ── */}
        <section className="py-24" style={{ background: 'rgba(15,23,42,0.5)' }}>
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }} viewport={{ once: true }}
                    className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Why Choose <span className="gradient-text">CareerCraft AI</span>?
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
                        Our cutting-edge platform combines artificial intelligence with proven career development strategies.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                            className="card hover-lift text-center">
                            <div className="flex justify-center mb-4" style={{ color: '#38bdf8' }}>{f.icon}</div>
                            <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{f.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }} viewport={{ once: true }}>
                        <h2 className="text-4xl font-bold mb-6">
                            Transform Your <span className="gradient-text">Professional Journey</span>
                        </h2>
                        <p className="text-lg mb-8 leading-relaxed" style={{ color: '#94a3b8' }}>
                            Join thousands of professionals who have accelerated their careers with our AI-powered platform.
                        </p>
                        <div className="space-y-4">
                            {benefits.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}
                                    className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#2dd4bf' }} />
                                    <span style={{ color: '#cbd5e1' }}>{b}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/signup" className="btn-primary px-8 py-4 rounded-xl text-base">
                                Start Your Journey <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }} viewport={{ once: true }}
                        className="card p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(14,165,233,0.1)' }}>
                                <Rocket className="w-10 h-10" style={{ color: '#38bdf8' }} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Ready to Launch?</h3>
                            <p className="mt-2" style={{ color: '#94a3b8' }}>Choose a plan that works for you</p>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: '#334155' }}>
                                <span className="font-medium text-white">Free Plan</span>
                                <span style={{ color: '#94a3b8' }}>$0/mo</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl border"
                                style={{ background: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.3)' }}>
                                <span className="font-medium" style={{ color: '#38bdf8' }}>Premium Plan</span>
                                <span className="font-bold text-white">$19/mo</span>
                            </div>
                        </div>
                        <Link to="/pricing" className="btn-primary w-full py-3 rounded-xl justify-center text-sm font-semibold">
                            View All Plans
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #c026d3 100%)' }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }} viewport={{ once: true }}>
                    <Zap className="w-16 h-16 text-white mx-auto mb-6" style={{ fill: 'white' }} />
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Transform Your Career?
                    </h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Join thousands of professionals already using CareerCraft AI to land their dream jobs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup"
                            className="font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                            style={{ background: 'white', color: '#0284c7' }}>
                            Get Started Free
                        </Link>
                        <Link to="/services"
                            className="font-bold px-10 py-4 rounded-xl border-2 border-white text-white transition-all"
                            style={{ background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>

    </div>
);

export default Home;
