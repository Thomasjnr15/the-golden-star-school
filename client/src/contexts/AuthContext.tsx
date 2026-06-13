import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'student';
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'admin' | 'student' | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ user: AuthUser; session: Session }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
          // Fetch user profile to get role and full_name
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', currentSession.user.id)
            .single();

          if (!profileError && profile) {
            setRole(profile.role);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: profile.role,
              full_name: profile.full_name,
            });
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', newSession.user.id)
            .single();

          if (profile) {
            setRole(profile.role);
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              role: profile.role,
              full_name: profile.full_name,
            });
          }
        } else {
          setRole(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.session) {
        throw new Error('No session returned from login');
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.session.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to fetch user profile');
      }

      const authUser: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        role: profile.role,
        full_name: profile.full_name,
      };

      setSession(data.session);
      setUser(authUser);
      setRole(profile.role);

      return { user: authUser, session: data.session };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    role,
    logout,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
