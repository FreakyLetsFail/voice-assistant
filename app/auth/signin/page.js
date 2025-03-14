'use client';

import { useState } from 'react';
import { SignInForm, SignUpForm } from '../AuthForms';

export default function SignIn() {
  const [showSignUp, setShowSignUp] = useState(false);
  
  const toggleForm = () => {
    setShowSignUp(!showSignUp);
  };
  
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