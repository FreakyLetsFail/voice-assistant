'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './SupabaseAuthProvider';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SignInForm({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      
      // Get redirect URL from search params or default to home
      const redirectUrl = searchParams.get('redirectUrl') || '/';
      
      // Redirect programmatically
      router.push(redirectUrl);
    } catch (error) {
      setFormError(error.message || 'Anmeldung fehlgeschlagen');
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setFormError('Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setFormError('');
    } catch (error) {
      setFormError('Fehler beim Zurücksetzen des Passworts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto fade-in">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>
          Melde dich an, um deinen persönlichen KI-Sprachassistenten zu nutzen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetSent ? (
          <Alert>
            <AlertDescription>
              Wenn ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet. Bitte überprüfe deine E-Mails.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <button 
                  type="button" 
                  className="text-sm text-primary hover:underline"
                  onClick={handlePasswordReset}
                >
                  Passwort vergessen?
                </button>
              </div>
              <Input 
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {formError && (
              <div className="text-sm text-destructive mt-2">{formError}</div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-sm text-center text-muted-foreground">
          Noch kein Konto?{' '}
          <button onClick={onToggleForm} className="text-primary hover:underline">
            Registrieren
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}