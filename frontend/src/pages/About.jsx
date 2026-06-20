import { motion } from 'framer-motion';
import { Target, Users, Shield, Cpu, Sparkles, Zap, BrainCircuit, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

const layers = [
    {
        icon: BrainCircuit,
        title: 'Cognitive Layer',
        description: 'Advanced LLM synthesis that translates your experience into corporate logic.'
    },
    {
        icon: Target,
        title: 'Trajectory Layer',
        description: 'Algorithmic alignment with current market demand and recruiter filters.'
    },
    {
        icon: Shield,
        title: 'Security Layer',
        description: 'Identity-first privacy protocols ensuring your career data remains yours.'
    }
];

export default function About() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 min-h-screen bg-surface-base overflow-hidden relative"
        >
            <SEO 
                title="About Platform Architecture & AI Mission"
                description="Explore the cognitive and trajectory layers of CareerCraft AI. Learn how we build synthetic mock interview simulations and ATS filters to score candidates."
                keywords="CareerCraft architecture, career simulator, artificial intelligence agent, ATS filters analyzer, speak coaching"
            />
            {/* AMBIENT BACKGROUND - EXTREMELY SUBTLE */}
            <div className="absolute top-[10%] right-[-5%] w-[1000px] h-[1000px] opacity-[0.03] pointer-events-none">
                <Logo className="w-full h-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Hero Section - Balanced Split */}
                <div className="flex flex-col lg:flex-row gap-16 items-start mb-40">
                    <div className="flex-1 space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 text-brand font-black text-[10px] uppercase tracking-[0.4em]">
                                <span className="w-12 h-px bg-brand" />
                                Deep Architecture
                            </div>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-content-base tracking-tighter leading-[0.85] italic uppercase text-balance">
                                Neural<br/>
                                <span className="text-brand">Evolution</span>
                            </h1>
                        </div>
                        <div className="max-w-xl space-y-8 border-l-2 border-brand/20 pl-8">
                            <p className="text-2xl text-content-base font-bold leading-tight tracking-tight italic opacity-90">
                                CareerCraft delivers the data-layer for high-stakes professional growth.
                            </p>
                            <p className="text-lg text-content-muted font-medium leading-relaxed">
                                Our platform brings enterprise-grade AI to the individual. 
                                We've engineered a synthetic interview environment that calculates your 
                                professional value against the world's most aggressive hiring filters. 
                            </p>
                        </div>
                    </div>

                    {/* Integrated Metric Component */}
                    <div className="shrink-0 w-full lg:w-[450px] lg:mt-10">
                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="p-10 rounded-[40px] bg-surface-card border border-stroke shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-center">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand shadow-lg shadow-brand/10">
                                        <Logo className="w-full h-full" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs font-black text-brand uppercase tracking-widest">Protocol v2.0</div>
                                        <div className="text-2xl font-black text-content-base italic mt-1">OPERATIONAL</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">Neural Sync</span>
                                            <span className="text-xl font-black text-brand italic">88%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-surface-base rounded-full overflow-hidden border border-stroke p-[1px]">
                                            <div className="h-full bg-brand rounded-full w-[88%]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-stroke">
                                        <div className="space-y-1">
                                            <Activity className="w-4 h-4 text-brand" />
                                            <div className="text-2xl font-black text-content-base italic tracking-tight">1.4K+</div>
                                            <div className="text-[9px] font-black text-content-muted uppercase tracking-widest">Simulations</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Cpu className="w-4 h-4 text-brand" />
                                            <div className="text-2xl font-black text-content-base italic tracking-tight">92%</div>
                                            <div className="text-[9px] font-black text-content-muted uppercase tracking-widest">ATS Match</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ARCHITECTURAL DENSITY - New Operational Specs section */}
                <div className="mb-40 grid grid-cols-1 lg:grid-cols-4 gap-px bg-stroke border border-stroke rounded-[40px] overflow-hidden">
                    <div className="p-12 bg-surface-card space-y-6">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-widest">01 / Engine</h3>
                        <p className="text-sm text-content-muted font-medium leading-relaxed">Synthetic intelligence mapped to real-world recruiter behavioral patterns.</p>
                    </div>
                    <div className="p-12 bg-surface-card space-y-6">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                            <Target className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-widest">02 / Trajectory</h3>
                        <p className="text-sm text-content-muted font-medium leading-relaxed">Algorithmic alignment with current market sentiment and salary brackets.</p>
                    </div>
                    <div className="p-12 bg-surface-card space-y-6">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-widest">03 / Protocol</h3>
                        <p className="text-sm text-content-muted font-medium leading-relaxed">End-to-end encryption for your career intellectual property.</p>
                    </div>
                    <div className="p-12 bg-surface-card space-y-6">
                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-widest">04 / Deployment</h3>
                        <p className="text-sm text-content-muted font-medium leading-relaxed">Rapid iteration cycles to compress months of discovery into hours.</p>
                    </div>
                </div>

                {/* Tactical Footer CTA */}
                <div className="card-bento p-16 md:p-24 bg-surface-card border-none relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-50" />
                    <div className="relative z-10 text-center max-w-3xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <Sparkles className="w-10 h-10 text-brand mx-auto animate-pulse" />
                            <h2 className="text-5xl md:text-7xl font-black text-content-base tracking-tighter leading-none italic uppercase leading-none">
                                Deploy Your <br/><span className="text-brand">Potential</span>
                            </h2>
                        </div>
                        <p className="text-xl text-content-muted font-medium leading-relaxed max-w-xl mx-auto">
                            The system is operational. Your professional path is being calculated. 
                            Initialize your career protocol today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup" className="btn-primary py-5 px-12 text-sm font-black tracking-widest shadow-xl shadow-brand-glow hover:-translate-y-1">
                                INITIALIZE PROFILE
                            </Link>
                            <Link to="/services" className="px-12 py-5 border-2 border-stroke text-content-base font-black text-sm tracking-widest rounded-2xl hover:border-brand hover:bg-surface-hover transition-all">
                                VIEW MODULES
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
