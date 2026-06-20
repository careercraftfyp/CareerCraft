import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, CheckCircle2, Cpu, Mail, MapPin, MessageSquare, Phone, Rocket, Send, Shield, Target, X } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Contact() {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan');

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        protocol: 'General Inquiry',
        message: ''
    });

    useEffect(() => {
        if (plan) {
            setFormData(prev => ({
                ...prev,
                protocol: plan === 'Enterprise' ? 'Business Collaboration' : 'General Inquiry',
                message: `Hi! I would like to subscribe to the ${plan} Plan. Please contact me with details on how to get started.`
            }));
        }
    }, [plan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process transmission');
            }

            setIsSubmitted(true);
            setFormData({
                name: '',
                email: '',
                protocol: 'General Inquiry',
                message: ''
            });
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to transmit message. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-surface-base overflow-hidden relative">
            <SEO 
                title="Contact Support & Inquiries"
                description="Get in touch with CareerCraft AI team. Submit technical help protocols, ask about organizational plans, or give feedback."
                keywords="CareerCraft contact, support, customer inquiries, corporate collaboration"
            />
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/5 blur-[120px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Info Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-glow border border-brand/20 text-brand text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <MessageSquare className="w-4 h-4" />
                            Get in Touch
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-content-base mb-8 tracking-tighter leading-none italic uppercase">
                            Get in <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-xl text-content-muted font-medium leading-relaxed mb-12">
                            Have questions or just want to say hi?
                            We're here to help you build your perfect career.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: 'Communications', value: 'hi@careercraft.cloud' },
                                { icon: Phone, label: 'Direct Line', value: '+92 3000 CAREER' },
                                { icon: MapPin, label: 'Node Location', value: 'Lahore, Pakistan' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-card border border-stroke flex items-center justify-center group-hover:border-brand/20 transition-all">
                                        <item.icon className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-content-muted font-black uppercase tracking-widest mb-1">{item.label}</div>
                                        <div className="text-content-base font-bold text-lg">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Neural Status */}
                        <div className="mt-16 p-8 card-bento border-white/5 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-content-base font-black uppercase italic tracking-widest text-xs">Always Active</span>
                            </div>
                            <p className="text-content-muted text-sm font-medium">Average response time: Under 24 hours</p>
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
                                    className="card-bento p-10 lg:p-12 relative overflow-hidden"
                                >
                                    {plan && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 mb-6 rounded-xl bg-brand/10 border border-brand/20 flex flex-col gap-1 text-content-base text-sm font-medium"
                                        >
                                            <span className="text-brand font-black uppercase text-xs tracking-wider">Plan Request Active</span>
                                            <span>The <strong>{plan} Plan</strong> is currently available via manual onboarding. Fill out the details below, and our team will activate your profile.</span>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-content-muted font-black uppercase tracking-widest ml-1">Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Name"
                                                    className="input-field"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-content-muted font-black uppercase tracking-widest ml-1">Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="abc@gmail.com"
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-content-muted font-black uppercase tracking-widest ml-1">Subject</label>
                                            <select
                                                name="protocol"
                                                value={formData.protocol}
                                                onChange={handleChange}
                                                className="input-field bg-dark-950"
                                            >
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Business Collaboration">Business Collaboration</option>
                                                <option value="Technical Help">Technical Help</option>
                                                <option value="Feedback">Feedback</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-content-muted font-black uppercase tracking-widest ml-1">Message:</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Detail your inquiry..."
                                                rows={5}
                                                className="input-field resize-none"
                                            />
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-medium"
                                            >
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                {error}
                                            </motion.div>
                                        )}

                                        <button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-content-base font-black uppercase tracking-[0.2em] relative overflow-hidden group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    Send Message
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
                                    className="card-bento p-12 text-center flex flex-col items-center justify-center min-h-[500px]"
                                >
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-content-base italic uppercase tracking-tight mb-4">Message Sent!</h3>
                                    <p className="text-content-muted text-lg font-medium leading-relaxed max-w-sm mb-12">
                                        Thanks for reaching out! We've received your message and we'll get back to you as soon as possible.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="btn-secondary py-4 px-10"
                                    >
                                        Send Another Message
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
