// Defines which routes require authentication
export const authConfig = {
    // Public routes - accessible without authentication
    publicRoutes: [
      '/auth/signin',
      '/auth/signup',
      '/auth/update-password'
    ],
    
    // Auth routes - related to authentication
    authRoutes: [
      '/auth/signin',
      '/auth/signup',
      '/auth/update-password'
    ],
    
    // Default login page
    loginPage: '/auth/signin',
    
    // Default post-login page
    defaultProtectedPage: '/'
  };