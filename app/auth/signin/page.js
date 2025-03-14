'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/auth/SupabaseAuthProvider'
import { SignInForm, SignUpForm } from '../AuthForms';

export default function SignIn() {
  const [showSignUp, setShowSignUp] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const toggleForm = () => {
    setShowSignUp(!showSignUp);
  };

  useEffect(() => {
    // Redirect to home or intended page if user is authenticated
    if (user && !loading) {
      const redirectUrl = searchParams.get('redirectUrl') || '/';
      router.push(redirectUrl);
    }
  }, [user, loading, router, searchParams]);
  
  // Prevent rendering form if user is loading to avoid flash of content
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-1">KI Sprachassistent</h1>
        <p className="text-muted-foreground">Dein persönlicher KI-Assistent mit Spracherkennung</p>
      </div>
      
      {showSignUp ? (
        <SignUpForm onToggleForm={toggleForm} />
      ) : (
        <SignInForm onToggleForm={toggleForm} />
      )}
    </div>
  );
}