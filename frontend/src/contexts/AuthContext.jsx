/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const checkSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                setUser(data.session?.user ?? null);
            } catch (error) {
                console.error("Error fetching session. Make sure your Supabase keys are configured:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, fullName) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
    };

    const signIn = (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signInWithGoogle = () => {
        return supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
    };

    const signOut = () => {
        return supabase.auth.signOut();
    };

    const resetPassword = (email) => {
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    };

    const updatePassword = (newPassword) => {
        return supabase.auth.updateUser({ password: newPassword });
    };

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
