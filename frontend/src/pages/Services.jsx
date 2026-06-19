import { motion } from 'framer-motion';
import {
    FileText, Video, Target, Sparkles,
    Cpu, Zap, Shield, Globe, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
    {
        icon: FileText,
        title: 'Precision Resume Analysis',
        description: 'Our proprietary AI engine deconstructs your resume using neural semantic analysis to identify hidden strengths and optimal keyword density for sector-specific ATS filters.',
        color: 'primary',
        features: ['Semantic keyword extraction', 'Format validation', 'Density optimization']
    },
    {
        icon: Video,
        title: 'Adaptive AI Interviews',
        description: 'Powered by Tavus Conversational Video, practice with role-specific AI avatars that respond dynamically to your answers, providing real-time sentiment and technical feedback.',
        color: 'secondary',
        features: ['Tavus high-fidelity video', 'Contextual follow-ups', 'Real-time sentiment data']
    },
    {
        icon: Target,
        title: 'Strategic Career Mapping',
        description: 'Transform your professional trajectory with data-driven career maps that pinpoint required certifications, skill gaps, and high-growth industry targets.',
        color: 'accent',
        features: ['Skill-gap analytics', 'Certification paths', 'Market trend alignment']
    },
    {
        icon: Sparkles,
        title: 'Smart Cover Letters',
        description: 'Generate high-conversion cover letters that maintain your unique professional voice while perfectly aligning with the specific job description nuances.',
        color: 'primary',
        features: ['Tone-of-voice matching', 'Job-specific alignment', 'Dynamic templates']
    }
];

const stats = [
    { label: 'Neural Queries', value: '2.4M+', icon: Cpu },
    { label: 'Latency', value: '< 150ms', icon: Zap },
    { label: 'Data Security', value: '256-bit', icon: Shield },
    { label: 'Global Access', value: '24/7', icon: Globe }
];

export default function Services() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 min-h-screen bg-surface-base overflow-hidden relative"
        >
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-brand-glow blur-[120px] rounded-full animate-float-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/10 blur-[120px] rounded-full animate-float-slow" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-glow border border-brand/20 text-brand text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        Core Capabilities
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-content-base mb-8 tracking-tighter leading-none italic uppercase"
                    >
                        Neural <span className="gradient-text">Powerhouse</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-content-muted font-medium leading-relaxed"
                    >
                        Deploying state-of-the-art AI architecture to automate your career ascent.
                        From vision to execution, CareerCraft is your professional edge.
                    </motion.p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="card-bento group hover:border-brand/20 transition-all p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand/5 blur-[60px] rounded-full group-hover:bg-brand-glow transition-colors" />

                            <div className={`w-16 h-16 rounded-2xl bg-${service.color}-500/20 border border-${service.color}-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                <service.icon className={`w-8 h-8 text-${service.color}-400`} />
                            </div>

                            <h3 className="text-3xl font-black text-content-base mb-4 uppercase italic tracking-tight leading-none">
                                {service.title}
                            </h3>
                            <p className="text-content-muted text-lg leading-relaxed mb-8 font-medium">
                                {service.description}
                            </p>

                            <ul className="space-y-3 mb-10">
                                {service.features.map(f => (
                                    <li key={f} className="flex items-center gap-3 text-content-base text-sm font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-widest text-sm hover:gap-4 transition-all"
                            >
                                Deploy Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="card-bento p-8 border-white/5 flex flex-col items-center text-center"
                        >
                            <stat.icon className="w-6 h-6 text-content-muted mb-4" />
                            <div className="text-3xl font-black text-content-base mb-2 italic uppercase">{stat.value}</div>
                            <div className="text-[10px] text-content-muted font-black uppercase tracking-[0.3em]">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
