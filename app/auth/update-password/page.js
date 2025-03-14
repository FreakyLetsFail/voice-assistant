'use client';

import { UpdatePasswordForm } from '../AuthForms';

export default function UpdatePassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-1">KI Sprachassistent</h1>
        <p className="text-muted-foreground">Passwort aktualisieren</p>
      </div>
      
      <UpdatePasswordForm />
    </div>
  );
}