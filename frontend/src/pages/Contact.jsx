import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, CheckCircle2, Cpu, Mail, MapPin, MessageSquare, Phone, Rocket, Send, Shield, Target, X } from 'lucide-react';

export default function Contact() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-dark-900 overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/5 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <MessageSquare className="w-4 h-4" />
                            Direct Channel
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none italic uppercase">
                            Get in <span className="gradient-text">Sync</span>
                        </h1>
                        <p className="text-xl text-dark-400 font-medium leading-relaxed mb-12">
                            Have questions about our neural processing or enterprise integration?
                            Our ops team is ready to assist your career deployment.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: 'Communications', value: 'intel@careercraft.ai' },
                                { icon: Phone, label: 'Direct Line', value: '+1 (888) CAREER-AI' },
                                { icon: MapPin, label: 'Node Location', value: 'Silicon Valley, CA' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center group-hover:border-primary-500/30 transition-all">
                                        <item.icon className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-dark-500 font-black uppercase tracking-widest mb-1">{item.label}</div>
                                        <div className="text-white font-bold text-lg">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Neural Status */}
                        <div className="mt-16 p-8 glass border-white/5 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-white font-black uppercase italic tracking-widest text-xs">Neural Systems Online</span>
                            </div>
                            <p className="text-dark-400 text-sm font-medium">Average response latency: 12.4 minutes</p>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.div
                                    key="form"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card p-10 lg:p-12 relative overflow-hidden"
                                >
                                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">Identity</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Agent Name"
                                                    className="input-field"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">Channel</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="intel@domain.com"
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">Protocol</label>
                                            <select className="input-field bg-dark-950">
                                                <option>General Intelligence</option>
                                                <option>Enterprise Integration</option>
                                                <option>Technical Support</option>
                                                <option>Partnership Inquiry</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-dark-500 font-black uppercase tracking-widest ml-1">Message Payload</label>
                                            <textarea
                                                required
                                                placeholder="Detail your inquiry..."
                                                rows={5}
                                                className="input-field resize-none"
                                            />
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] relative overflow-hidden group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    Transmit Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="card p-12 text-center flex flex-col items-center justify-center min-h-[500px]"
                                >
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tight mb-4">Transmission Success</h3>
                                    <p className="text-dark-400 text-lg font-medium leading-relaxed max-w-sm mb-12">
                                        Message received. Our ops team is analyzing your payload and will respond within the next neural cycle.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="btn-secondary py-4 px-10"
                                    >
                                        Send Another Transmission
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
