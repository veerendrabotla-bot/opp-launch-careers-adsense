
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useModeratorAccess = () => {
  const [isModerator, setIsModerator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkModeratorStatus = async () => {
    if (!user) {
      setIsModerator(false);
      setIsAdmin(false);
      return;
    }
    
    setLoading(true);
    try {
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase.rpc('is_admin', {
        _user_id: user.id
      });
      
      if (adminError) throw adminError;
      setIsAdmin(adminData);

      // Check if user is moderator
      const { data: moderatorData, error: moderatorError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'moderator'
      });
      
      if (moderatorError) throw moderatorError;
      setIsModerator(moderatorData);
    } catch (error: any) {
      console.error('Error checking moderator status:', error);
      setIsModerator(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkModeratorStatus();
    } else {
      setIsModerator(false);
      setIsAdmin(false);
    }
  }, [user]);

  return {
    isModerator,
    isAdmin,
    hasModeratorAccess: isModerator || isAdmin, // Admins have moderator access too
    loading,
    refetch: checkModeratorStatus
  };
};
