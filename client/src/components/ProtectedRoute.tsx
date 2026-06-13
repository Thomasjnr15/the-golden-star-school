import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'student' | ('admin' | 'student')[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on attempted route
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setLocation('/admin/login');
    } else {
      setLocation('/student-login');
    }
    return null;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(role!)) {
      // Redirect based on user's actual role
      if (role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (role === 'student') {
        setLocation('/student/dashboard');
      } else {
        setLocation('/');
      }
      return null;
    }
  }

  return <>{children}</>;
}
