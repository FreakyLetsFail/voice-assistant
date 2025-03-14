'use client';

import { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Input,
  Label,
  Alert,
  AlertDescription
} from '@/components/ui';

export function SignInForm({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, resetPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      // Success! Auth context will update and redirect
    } catch (error) {
      setFormError(error.message || 'Anmeldung fehlgeschlagen');
    } finally {
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

export function SignUpForm({ onToggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  const { signUp } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);
    
    try {
      await signUp(email, password, {
        data: {
          email
        }
      });
      setSignUpSuccess(true);
    } catch (error) {
      setFormError(error.message || 'Konto konnte nicht erstellt werden');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (signUpSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto fade-in">
        <CardHeader>
          <CardTitle>Bestätige deine E-Mail</CardTitle>
          <CardDescription>
            Wir haben eine Bestätigungs-E-Mail an {email} gesendet. Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onToggleForm} 
            className="w-full"
          >
            Zurück zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto fade-in">
      <CardHeader>
        <CardTitle>Konto erstellen</CardTitle>
        <CardDescription>
          Erstelle ein Konto, um mit deinem persönlichen KI-Assistenten zu beginnen
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="password">Passwort</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Mindestens 6 Zeichen
            </p>
          </div>
          
          {formError && (
            <div className="text-sm text-destructive mt-2">{formError}</div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Registrieren...' : 'Registrieren'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          Bereits ein Konto?{' '}
          <button onClick={onToggleForm} className="text-primary hover:underline">
            Anmelden
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const { updatePassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (password !== confirmPassword) {
      setFormError('Passwörter stimmen nicht überein');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updatePassword(password);
      setUpdateSuccess(true);
    } catch (error) {
      setFormError(error.message || 'Fehler beim Aktualisieren des Passworts');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (updateSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto fade-in">
        <CardHeader>
          <CardTitle>Passwort aktualisiert</CardTitle>
          <CardDescription>
            Dein Passwort wurde erfolgreich aktualisiert. Du kannst dich jetzt mit deinem neuen Passwort anmelden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/auth/signin'} 
            className="w-full"
          >
            Zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto fade-in">
      <CardHeader>
        <CardTitle>Passwort aktualisieren</CardTitle>
        <CardDescription>
          Bitte gib dein neues Passwort ein
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input 
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
            {isLoading ? 'Aktualisieren...' : 'Passwort aktualisieren'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}