import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { navigate } from 'wouter/use-browser-location';
import { useAuth } from '@/context/AuthContext';

interface UseAuthRedirectOptions {
  /** If true, redirects authenticated users away from the current page */
  redirectAuthenticated?: boolean;
  /** If true, redirects unauthenticated users away from the current page */
  requireAuth?: boolean;
  /** Where to redirect authenticated users if redirectAuthenticated is true */
  authenticatedRedirectPath?: string;
  /** Where to redirect unauthenticated users if requireAuth is true */
  loginPath?: string;
}

/**
 * Hook for handling authentication-based redirects
 */
export function useAuthRedirect({
  redirectAuthenticated = false,
  requireAuth = false,
  authenticatedRedirectPath = '/',
  loginPath = '/auth'
}: UseAuthRedirectOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // Redirect authenticated users away from pages like login/register
    if (redirectAuthenticated && isAuthenticated) {
      navigate(authenticatedRedirectPath);
      return;
    }

    // Redirect unauthenticated users away from protected pages
    if (requireAuth && !isAuthenticated) {
      // Store the current location so we can redirect back after login
      sessionStorage.setItem('authRedirectPath', location);
      navigate(loginPath);
      return;
    }
  }, [
    isAuthenticated, 
    isLoading, 
    redirectAuthenticated, 
    requireAuth, 
    authenticatedRedirectPath, 
    loginPath,
    location
  ]);

  return { isAuthenticated, isLoading };
}