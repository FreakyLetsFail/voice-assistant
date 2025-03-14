import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { authConfig } from './app/auth/auth.config';

export async function middleware(request) {
  // Initialize Supabase auth middleware client
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;
  
  // Check if the user has an active session
  const { data: { session } } = await supabase.auth.getSession();
  const hasSession = !!session;
  
  // Check if the path is a protected route (not public)
  const isPublicRoute = authConfig.publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the path is an auth route
  const isAuthRoute = authConfig.authRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Redirect to login if accessing protected route without session
  if (!isPublicRoute && !hasSession) {
    const redirectUrl = new URL(authConfig.loginPage, request.url);
    // Save the original URL the user was trying to access
    redirectUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect to home if accessing auth route with session
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL(authConfig.defaultProtectedPage, request.url));
  }
  
  return response;
}

export const config = {
  // Match all routes except api routes, static files, and other internal routes
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel system files)
     * 5. /favicon.ico, /manifest.json, /robots.txt (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|manifest.json|robots.txt).*)',
  ],
};