import { motion } from 'framer-motion';
import { Check, Rocket, Zap, Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Standard',
        icon: Rocket,
        price: '$0',
        description: 'Essential AI tools to start your professional journey.',
        features: ['3 AI Resume Scans / Monthly', 'Basic ATS Optimization', 'OpenAI Behavioral Prep', 'Email Support'],
        color: 'dark',
        buttonText: 'Start Free'
    },
    {
        name: 'Professional',
        icon: Zap,
        price: '$19',
        popular: true,
        description: 'Full-spectrum neural features for serious candidates.',
        features: ['Unlimited AI Resume Scans', 'Tavus Conversational Video (10/mo)', 'Real-time Sentiment Feedback', 'Custom Cover Letter Engine', 'Priority Neural Processing'],
        color: 'primary',
        buttonText: 'Elite Upgrade'
    },
    {
        name: 'Enterprise',
        icon: Crown,
        price: '$99',
        description: 'Institutional-grade career intelligence for teams.',
        features: ['Unlimited Tavus Video Mocking', 'Global Benchmarking Data', 'Multi-user Neural Seats', 'Custom API Integration', 'Concierge Career Strategy'],
        color: 'secondary',
        buttonText: 'Contact Ops'
    }
];

export default function Pricing() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 min-h-screen bg-surface-base overflow-hidden relative"
        >
            {/* Visual Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full animate-float-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary-500/5 blur-[120px] rounded-full animate-float-slow" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        Selection Protocol
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-content-base mb-8 tracking-tighter leading-none italic uppercase"
                    >
                        Neural <span className="gradient-text">Subscription</span>
                    </motion.h1>
                    <p className="text-xl text-content-muted font-medium leading-relaxed">
                        Scalable intelligence for every stage of your career cycle.
                        Choose your protocol and deploy your potential.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col relative card p-10 hover-lift ${plan.popular ? 'border-brand/20 bg-surface-card shadow-2xl shadow-brand-glow scale-105 z-20' : 'border-stroke/50'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand rounded-full text-[10px] font-black text-content-base uppercase tracking-[0.2em] shadow-lg shadow-brand-glow">
                                    Recommended Protocol
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-12 h-12 rounded-xl bg-${plan.color === 'dark' ? 'dark-700' : plan.color + '-500'}/20 flex items-center justify-center mb-6`}>
                                    <plan.icon className={`w-6 h-6 text-${plan.color === 'dark' ? 'dark-400' : plan.color + '-400'}`} />
                                </div>
                                <h3 className="text-2xl font-black text-content-base uppercase italic tracking-tight mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-content-base tracking-tighter">{plan.price}</span>
                                    <span className="text-content-muted font-bold uppercase text-[10px] tracking-widest">{plan.price === '$0' ? '' : '/ Month'}</span>
                                </div>
                                <p className="mt-4 text-content-muted text-sm font-medium leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-10">
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
                                            <Check className="w-3 h-3 text-accent-400" />
                                        </div>
                                        <span className="text-content-base font-bold text-xs uppercase tracking-wider leading-none pt-1">
                                            {f}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm text-center transition-all ${plan.popular
                                    ? 'btn-primary shadow-xl shadow-brand-glow text-content-base'
                                    : 'bg-surface-base text-content-base border border-stroke hover:border-dark-500 hover:bg-surface-hover'
                                    }`}
                            >
                                {plan.buttonText}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Neural Guarantee */}
                <div className="mt-24 p-12 card-bento border-white/5 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-8 h-8 text-accent-400" />
                            <h3 className="text-2xl font-black text-content-base italic uppercase tracking-tight">The Neural Guarantee</h3>
                        </div>
                        <p className="text-content-muted font-medium text-lg leading-relaxed">
                            We operate at the intersection of privacy and performance. Your career data is encrypted using
                            AES-256 and never sold. We only succeed when your career accelerates.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center group">
                            <div className="text-4xl font-black text-content-base mb-1 group-hover:scale-110 transition-transform">99.9%</div>
                            <div className="text-[10px] text-content-muted font-black uppercase tracking-widest">Uptime Optimization</div>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="text-center group">
                            <div className="text-4xl font-black text-content-base mb-1 group-hover:scale-110 transition-transform">100%</div>
                            <div className="text-[10px] text-content-muted font-black uppercase tracking-widest">End-to-End Encryption</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
