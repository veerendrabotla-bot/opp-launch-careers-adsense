
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('pendingUserRole');
  };

  const assignUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });
      
      if (error) {
        console.error('Error assigning role:', error);
        throw error;
      }
      
      console.log(`Successfully assigned ${role} role to user ${userId}`);
    } catch (error: any) {
      console.error('Error in assignUserRole:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin', {
        _user_id: userId
      });
      
      if (adminError) throw adminError;
      
      if (isAdminData) {
        setUserRole('admin');
        return 'admin';
      }

      const { data: isModeratorData, error: moderatorError } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'moderator'
      });
      
      if (moderatorError) throw moderatorError;
      
      if (isModeratorData) {
        setUserRole('moderator');
        return 'moderator';
      }

      setUserRole('user');
      return 'user';
    } catch (error: any) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
      return 'user';
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          
          const pendingRole = localStorage.getItem('pendingUserRole');
          if (pendingRole && pendingRole !== 'user') {
            console.log('Assigning pending role:', pendingRole);
            await assignUserRole(session.user.id, pendingRole as 'user' | 'admin' | 'moderator');
            localStorage.removeItem('pendingUserRole');
            await fetchUserRole(session.user.id);
          }
        } else {
          setUserRole(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || ''
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Force a page refresh after successful login to ensure clean state
      if (data.user) {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      setUserRole(null);
      
      // Force page refresh to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
