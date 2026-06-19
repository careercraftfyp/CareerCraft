import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, Sparkles, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();
    const { user, signOut } = useAuth();

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
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            padding: scrolled ? '0 1rem' : '0 1.5rem',
            transition: 'all 0.4s ease',
        }}>
            {/* Inner container */}
            <div style={{
                maxWidth: '1280px',
                width: '100%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: scrolled ? '0.75rem 2rem' : '0',
                borderRadius: scrolled ? '1rem' : '0',
                background: scrolled ? 'rgba(15,23,42,0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
                boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.4s ease',
            }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(14,165,233,0.3)',
                    }}>
                        <Rocket style={{ width: '20px', height: '20px', color: 'white', fill: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.03em' }}>
                            CareerCraft
                        </span>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.25em', color: '#38bdf8', marginTop: '2px' }}>
                            AI ENGINE
                        </span>
                    </div>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.name}
                            to={link.path}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                color: location.pathname === link.path ? '#38bdf8' : '#94a3b8',
                                transition: 'color 0.2s, background 0.2s',
                                position: 'relative',
                            }}
                            onMouseEnter={e => { if (location.pathname !== link.path) e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { if (location.pathname !== link.path) e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform"
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
                                        className="absolute right-0 mt-3 w-48 bg-dark-800 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 flex flex-col"
                                    >
                                        <div className="px-4 py-3 border-b border-dark-700/50 mb-1">
                                            <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'User'}</p>
                                            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-colors"
                                        >
                                            <UserIcon className="w-4 h-4 text-primary-400" />
                                            Profile
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-secondary-400" />
                                            Dashboard
                                        </Link>
                                        <div className="h-px bg-dark-700/50 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                signOut();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Link to="/login" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                                Login
                            </Link>
                            <Link to="/signup" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '0.5rem' }}>
                                <Sparkles style={{ width: '16px', height: '16px' }} />
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="lg:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        padding: '0.625rem', borderRadius: '0.75rem', cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8', transition: 'color 0.2s',
                    }}
                >
                    {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        style={{
                            position: 'absolute', top: '80px', left: '1rem', right: '1rem',
                            padding: '1.5rem',
                            background: 'rgba(15,23,42,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '1rem',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                        className="lg:hidden"
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {navLinks.map(link => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    style={{
                                        padding: '0.875rem 1.25rem', borderRadius: '0.75rem',
                                        fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                                        color: location.pathname === link.path ? '#38bdf8' : '#cbd5e1',
                                        background: location.pathname === link.path ? 'rgba(14,165,233,0.05)' : 'transparent',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.75rem 0' }} />
                            {user ? (
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <Link to="/profile" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '0.75rem', color: 'white', fontWeight: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                                        <UserIcon className="w-4 h-4" /> Profile
                                    </Link>
                                    <Link to="/dashboard" className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem' }}>
                                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                    </Link>
                                    <button onClick={signOut} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '0.75rem', color: '#f87171', fontWeight: 700, background: 'transparent', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <Link to="/login" style={{ padding: '0.875rem', textAlign: 'center', borderRadius: '0.75rem', color: 'white', fontWeight: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>Login</Link>
                                    <Link to="/signup" className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem' }}>Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
