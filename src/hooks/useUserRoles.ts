import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Tables']['user_roles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserWithRole extends Profile {
  user_roles: UserRole[];
}

export const useUserRoles = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkUserStatus = async () => {
    if (!user) return;
    
    try {
      // Check admin status using secure function
      const { data: adminData, error: adminError } = await supabase.rpc('is_admin', {
        _user_id: user.id
      });
      
      if (adminError) throw adminError;
      setIsAdmin(adminData);

      // Check moderator status using secure function
      const { data: moderatorData, error: moderatorError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator'
      });
      
      if (moderatorError) throw moderatorError;
      setIsModerator(moderatorData);
    } catch (error: any) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
      setIsModerator(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin && !isModerator) return;

    setLoading(true);
    try {
      // Fetch profiles (public data)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles (with RLS protection)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    if (!user || (!isAdmin && !isModerator)) return;

    // Only admins can assign admin roles
    if (role === 'admin' && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can assign admin roles.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the secure database function for role assignment
      const { error } = await supabase.rpc('assign_user_role', {
        _user_id: userId,
        _role: role
      });

      if (error) throw error;

      toast({
        title: "Role Assigned",
        description: `User role has been updated to ${role}.`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: 'user' | 'admin' | 'moderator') => {
    if (!user || (!isAdmin && !isModerator)) return;

    // Only admins can remove admin roles
    if (role === 'admin' && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can remove admin roles.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Assign 'user' role instead of removing (ensures every user has a role)
      const { error } = await supabase.rpc('assign_user_role', {
        _user_id: userId,
        _role: 'user'
      });

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "User role has been set to regular user.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin || isModerator) {
      fetchUsers();
    }
  }, [isAdmin, isModerator]);

  // Set up real-time subscription for user roles
  useEffect(() => {
    if (!isAdmin && !isModerator) return;

    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isModerator]);

  return {
    users,
    loading,
    isAdmin,
    isModerator,
    hasManagementAccess: isAdmin || isModerator,
    assignRole,
    removeRole,
    refetch: fetchUsers
  };
};
