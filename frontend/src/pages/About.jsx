import { motion } from 'framer-motion';
import { Target, Users, Shield, Cpu, Sparkles, Rocket } from 'lucide-react';

const values = [
    {
        icon: Target,
        title: 'Career Precision',
        description: 'We believe in data over guesswork. Our AI provides surgical accuracy in career mapping and resume optimization.'
    },
    {
        icon: Users,
        title: 'Human-Centric AI',
        description: 'Technology should empower, not replace. We build tools that amplify human potential through intelligent automation.'
    },
    {
        icon: Shield,
        title: 'Privacy Protocol',
        description: 'Your professional data is your most valuable asset. We treat it with institutional-grade security and zero-compromise privacy.'
    }
];

export default function About() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 min-h-screen bg-dark-900 overflow-hidden relative"
        >
            {/* Background Accents */}
            <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-secondary-500/10 blur-[100px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <Cpu className="w-4 h-4" />
                            The Mission
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none italic uppercase">
                            Neural <span className="gradient-text">Evolution</span>
                        </h1>
                        <p className="text-xl text-dark-400 font-medium leading-relaxed mb-8">
                            CareerCraft was founded on a simple realization: the modern job market is an algorithmic battlefield.
                            To win, candidates need more than just effort—they need intelligence.
                        </p>
                        <p className="text-dark-400 text-lg leading-relaxed font-medium">
                            We've engineered a platform that brings enterprise-grade AI to the individual.
                            By combining Large Language Models with high-fidelity video synthesis, we're
                            redefining how professionals prepare, present, and prevail.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-[40px] bg-dark-800 border border-dark-700/50 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-mesh opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <Rocket className="w-48 h-48 text-primary-500/40 animate-float" />
                            </div>

                            {/* Floating badges */}
                            <div className="absolute top-10 right-10 glass p-4 border-white/5 animate-float-slow">
                                <div className="text-2xl font-black text-white italic">2026</div>
                                <div className="text-[10px] text-dark-500 font-bold uppercase tracking-widest leading-none">Established</div>
                            </div>

                            <div className="absolute bottom-10 left-10 glass p-4 border-white/5 animate-float" style={{ animationDelay: '1s' }}>
                                <div className="text-2xl font-black text-white italic">1M+</div>
                                <div className="text-[10px] text-dark-500 font-bold uppercase tracking-widest leading-none">Analyses Ran</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {values.map((v, index) => (
                        <motion.div
                            key={v.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-10 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary-500/30 transition-all">
                                <v.icon className="w-7 h-7 text-primary-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">{v.title}</h3>
                            <p className="text-dark-400 font-medium leading-relaxed">{v.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Team CTA */}
                <div className="relative overflow-hidden bg-dark-800 border border-dark-700 rounded-[40px] p-20 glass text-center">
                    <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
                    <div className="relative">
                        <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-8" />
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic tracking-tighter">
                            Join the <span className="gradient-text">Protocol</span>
                        </h2>
                        <p className="text-dark-400 text-xl font-medium max-w-2xl mx-auto mb-12">
                            We're constantly optimizing our algorithms and expanding our reach.
                            Be part of the next generation of career intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button className="btn-primary text-white border-0 py-4 px-10">Deploy Your Potential</button>
                            <button className="btn-secondary py-4 px-10">Learn the Tech</button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
