import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { authConfig } from './app/auth/auth.config';

export async function middleware(request) {
  // Erstelle eine Response für die Weiterleitung
  const response = NextResponse.next();

  // Initialisiere Supabase Middleware-Client mit expliziten Umgebungsvariablen
  const supabase = createMiddlewareClient({ 
    req: request, 
    res: response,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  
  // Extrahiere den Pfad aus der Anfrage
  const pathname = request.nextUrl.pathname;
  
  // Hole die aktuelle Sitzung
  const { data: { session } } = await supabase.auth.getSession();
  const hasSession = !!session;
  
  // Überprüfe, ob es sich um eine öffentliche Route handelt
  const isPublicRoute = authConfig.publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Überprüfe, ob es sich um eine Authentifizierungsroute handelt
  const isAuthRoute = authConfig.authRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Weiterleitung zur Anmeldung bei geschützten Routen ohne Sitzung
  if (!isPublicRoute && !hasSession) {
    const redirectUrl = new URL(authConfig.loginPage, request.url);
    redirectUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Weiterleitung zur Startseite bei Authentifizierungsrouten mit aktiver Sitzung
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL(authConfig.defaultProtectedPage, request.url));
  }
  
  // Standardmäßig die ursprüngliche Antwort zurückgeben
  return response;
}

export const config = {
  // Definiere, welche Routen von der Middleware betroffen sind
  matcher: [
    // Matche alle Routen außer:
    // 1. API-Routen
    // 2. Next.js interne Routen
    // 3. Statische Dateien und Systemdateien
    '/((?!api|_next|_static|_vercel|favicon.ico|manifest.json|robots.txt).*)',
  ],
};