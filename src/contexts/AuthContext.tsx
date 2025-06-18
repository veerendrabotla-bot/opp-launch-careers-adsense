
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signUp: (email: string, password: string, name?: string, requestedRole?: string) => Promise<{ error: any }>;
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
    // Remove any insecure role storage
    localStorage.removeItem('pendingUserRole');
    localStorage.removeItem('userRole');
  };

  const directAssignUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    try {
      console.log('Directly assigning role:', role, 'to user:', userId);
      
      // Direct database insertion for initial role assignment
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: userId // Self-assignment for initial setup
        });
      
      if (error) {
        console.error('Error in direct role assignment:', error);
        // Try updating existing role if insert failed due to conflict
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: role })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating role:', updateError);
          throw updateError;
        }
      }
      
      console.log(`Successfully assigned ${role} role to user ${userId}`);
      
      // Immediately fetch the updated role
      await fetchUserRole(userId);
      return true;
    } catch (error: any) {
      console.error('Error in directAssignUserRole:', error);
      throw error;
    }
  };

  const secureAssignUserRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    try {
      console.log('Securely assigning role:', role, 'to user:', userId);
      
      // Use the secure database function for role assignment
      const { data, error } = await supabase.rpc('assign_user_role', {
        _user_id: userId,
        _role: role
      });
      
      if (error) {
        console.error('Error assigning role:', error);
        throw error;
      }
      
      console.log(`Successfully assigned ${role} role to user ${userId}`);
      
      // Immediately fetch the updated role
      await fetchUserRole(userId);
      return true;
    } catch (error: any) {
      console.error('Error in secureAssignUserRole:', error);
      throw error;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Use the secure RLS-protected query
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
        setUserRole('user');
        return 'user';
      }

      const role = roleData?.role || 'user';
      console.log('User role fetched:', role);
      setUserRole(role);
      return role;
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
          try {
            // Check for pending role assignment
            const pendingRole = localStorage.getItem('pendingUserRole');
            
            if (pendingRole && pendingRole !== 'user') {
              console.log('Processing pending role assignment:', pendingRole);
              
              // For initial admin/moderator setup, use direct assignment
              // This bypasses the RLS restriction for the first admin
              await directAssignUserRole(session.user.id, pendingRole as 'user' | 'admin' | 'moderator');
              localStorage.removeItem('pendingUserRole');
            } else {
              // Fetch existing role
              await fetchUserRole(session.user.id);
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            setUserRole('user');
          }
        } else {
          setUserRole(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        console.log('Initial session:', session?.user?.email);
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

  const signUp = async (email: string, password: string, name?: string, requestedRole?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Store the requested role for post-verification assignment
      if (requestedRole && requestedRole !== 'user') {
        localStorage.setItem('pendingUserRole', requestedRole);
      }
      
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
      
      console.log('Sign in successful for user:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
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
