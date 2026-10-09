import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Route guard for guest-only pages (/login, /register, /forgot-password).
 * If already signed in, redirects to the saved internal destination or /dashboard.
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Checking session status...</p>
      </div>
    );
  }

  if (user) {
    const rawDestination = location.state?.from?.pathname;
    // Security check: Must be an internal path starting with a single '/' and not '//'
    const isSafeInternalPath =
      typeof rawDestination === 'string' &&
      rawDestination.startsWith('/') &&
      !rawDestination.startsWith('//') &&
      rawDestination !== '/login' &&
      rawDestination !== '/register';

    const targetDestination = isSafeInternalPath ? rawDestination : '/dashboard';

    return <Navigate to={targetDestination} replace />;
  }

  return children;
}
