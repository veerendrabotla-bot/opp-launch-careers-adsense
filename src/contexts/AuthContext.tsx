
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole('user');
        return;
      }

      const role = data?.role || 'user';
      console.log('User role fetched:', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user');
    }
  };

  const assignUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    try {
      console.log('Assigning role:', role, 'to user:', userId);
      
      // Use the secure function to assign the role
      const { error } = await supabase.rpc('assign_role_secure', {
        _target_user_id: userId,
        _role: role
      });

      if (error) {
        console.error('Error assigning role:', error);
        throw error;
      }

      console.log('Role assigned successfully:', role);
      return true;
    } catch (error) {
      console.error('Failed to assign role:', error);
      return false;
    }
  };

  // Secure auth state cleanup
  const cleanupAuthState = () => {
    console.log('Cleaning up auth state');
    
    // Remove standard auth tokens
    try {
      localStorage.removeItem('supabase.auth.token');
      
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Remove from sessionStorage if in use
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error during auth cleanup:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user && mounted) {
          setUser(session.user);
          // Defer role fetching to prevent deadlocks
          setTimeout(() => {
            if (mounted) fetchUserRole(session.user.id);
          }, 100);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        // Defer role fetching to prevent deadlocks
        setTimeout(() => {
          if (mounted) fetchUserRole(session.user.id);
        }, 100);
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: string = 'user') => {
    try {
      setLoading(true);
      console.log('Starting signup process for role:', role);

      // Clean up any existing auth state
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      // If user is created successfully
      if (data.user) {
        console.log('User created:', data.user.id, 'with requested role:', role);
        
        // For admin role, we need to use the secure assignment
        if (role === 'admin') {
          // The role assignment will be handled by the admin registration process
          console.log('Admin role assignment will be handled separately');
        } else {
          // For other roles, assign immediately
          setTimeout(async () => {
            const roleAssigned = await assignUserRole(data.user!.id, role as 'user' | 'admin' | 'moderator');
            if (roleAssigned) {
              console.log('Role assignment completed successfully');
              // Refresh the user role
              await fetchUserRole(data.user!.id);
            }
          }, 2000);
        }

        toast({
          title: "Account created!",
          description: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully. Please check your email to verify your account.`,
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout failed, continuing with signin');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log security event
      if (data.user) {
        await supabase.rpc('log_security_event', {
          _event_type: 'user_login',
          _details: { email, login_time: new Date().toISOString() },
          _severity: 'info'
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Log security event before logout
      await supabase.rpc('log_security_event', {
        _event_type: 'user_logout',
        _details: { logout_time: new Date().toISOString() },
        _severity: 'info'
      });
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

      // Force page reload for clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
      
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
