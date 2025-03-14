'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client setup mit zusätzlicher Validierung
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Stelle sicher, dass Umgebungsvariablen gesetzt sind
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Zusätzliche Konfigurationsoptionen
  auth: {
    persistSession: true, // Sitzung im localStorage speichern
  }
});

// Create context
const AuthContext = createContext();

export function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Umfassendere Sitzungsprüfung
    const checkSession = async () => {
      try {
        // Hole aktuelle Sitzung
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session Error:', sessionError);
          setError(sessionError.message);
          return;
        }
        
        // Wenn Sitzung existiert, hole Benutzerinformationen
        if (session) {
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User Fetch Error:', userError);
            setError(userError.message);
            return;
          }
          
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Unexpected Error checking auth session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Abonniere Änderungen des Authentifizierungsstatus
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change Event:', event);
        
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Aufräumen bei Komponentenentfernung
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Signups mit erweiterten Optionen
  const signUp = async (email, password, options = {}) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Standardmäßige Konfiguration
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          ...options
        }
      });
      
      if (error) {
        console.error('Signup Error:', error);
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Signins mit zusätzlicher Fehlerbehandlung
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin Error:', error);
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected Signin Error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Signout mit besserer Fehlerbehandlung
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout Error:', error);
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Unexpected Signout Error:', error);
      setError(error.message);
    }
  };

  // Passwort zurücksetzen mit zusätzlichen Optionen
  const resetPassword = async (email) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        console.error('Password Reset Error:', error);
        setError(error.message);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected Password Reset Error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Passwort aktualisieren mit zusätzlicher Validierung
  const updatePassword = async (password) => {
    if (password.length < 6) {
      const error = new Error('Passwort muss mindestens 6 Zeichen lang sein');
      setError(error.message);
      throw error;
    }

    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        console.error('Password Update Error:', error);
        setError(error.message);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected Password Update Error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    supabase // Expose Supabase client
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};