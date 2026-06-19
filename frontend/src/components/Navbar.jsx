import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, LayoutDashboard, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();
    const { user, signOut } = useAuth();

    // Theme Toggle State
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setIsOpen(false); }, [location]);

    const navLinks = [
        { name: 'Services', path: '/services' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    if (location.pathname.includes('/dashboard') || location.pathname.includes('/interview')) return null;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out pointer-events-none ${scrolled ? 'pt-6 px-6' : 'h-[80px] px-8'}`}>
            <div className={`max-w-7xl mx-auto w-full flex items-center justify-between transition-all duration-500 ease-in-out pointer-events-auto ${scrolled ? 'py-3.5 px-10 rounded-full bg-surface-card/90 backdrop-blur-xl border border-stroke shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : 'py-2 px-4'}`}>

                <Link to="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-brand p-1.5 shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full rounded-xl overflow-hidden">
                            <Logo className="w-full h-full" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-content-base italic tracking-tighter uppercase leading-none">CareerCraft</span>
                        <span className="text-[9px] font-bold text-brand uppercase tracking-[0.3em] mt-1">Intelligence</span>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-2">
                    {navLinks.map(link => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${location.pathname === link.path ? 'text-brand' : 'text-content-muted hover:text-content-base hover:bg-surface-hover'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="w-px h-6 bg-stroke mx-2" />

                    <button onClick={toggleTheme} className="p-2 rounded-xl text-content-muted hover:bg-surface-hover transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {user ? (
                        <div className="relative ml-2" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-black text-lg shadow-lg hover:scale-105 transition-transform"
                            >
                                {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-48 bg-surface-card border border-stroke rounded-2xl shadow-2xl overflow-hidden py-1 z-50 flex flex-col"
                                    >
                                        <div className="px-4 py-3 border-b border-stroke mb-1">
                                            <p className="text-sm font-bold text-content-base truncate">{user?.user_metadata?.full_name || 'User'}</p>
                                            <p className="text-xs text-content-muted truncate">{user?.email}</p>
                                        </div>
                                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-content-muted hover:text-content-base hover:bg-surface-hover transition-colors">
                                            <UserIcon className="w-4 h-4 text-brand" /> Profile
                                        </Link>
                                        <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-content-muted hover:text-content-base hover:bg-surface-hover transition-colors">
                                            <LayoutDashboard className="w-4 h-4 text-brand" /> Dashboard
                                        </Link>
                                        <div className="h-px bg-stroke my-1"></div>
                                        <button onClick={() => { setIsProfileOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 ml-2">
                            <Link to="/login" className="px-5 py-2 text-sm font-bold text-content-muted hover:text-content-base transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary py-2.5 px-6">
                                <Sparkles className="w-4 h-4" /> Get Started
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex lg:hidden items-center gap-3">
                    <button onClick={toggleTheme} className="p-2 rounded-xl text-content-muted bg-surface-card border border-stroke hover:bg-surface-hover transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2.5 rounded-xl bg-surface-card border border-stroke text-content-muted hover:text-content-base transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        className="absolute top-[80px] left-4 right-4 p-6 bg-surface-card backdrop-blur-xl border border-stroke rounded-2xl shadow-2xl lg:hidden z-50"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`px-5 py-3 rounded-xl font-bold text-base transition-colors ${location.pathname === link.path ? 'text-brand bg-brand-glow' : 'text-content-base hover:bg-surface-hover'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-stroke my-3" />
                            {user ? (
                                <div className="grid gap-3">
                                    <Link to="/profile" className="flex justify-center items-center gap-2 p-3 rounded-xl text-content-base font-bold bg-surface-hover border border-stroke">
                                        <UserIcon className="w-4 h-4" /> Profile
                                    </Link>
                                    <Link to="/dashboard" className="btn-primary justify-center p-3">
                                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                    </Link>
                                    <button onClick={signOut} className="flex justify-center items-center gap-2 p-3 rounded-xl text-red-500 font-bold border border-red-500/20 hover:bg-red-500/10 transition-colors">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" className="p-3 text-center rounded-xl text-content-base font-bold bg-surface-hover border border-stroke">Login</Link>
                                    <Link to="/signup" className="btn-primary justify-center p-3">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
