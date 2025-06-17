
import { useAuth } from '@/contexts/AuthContext';

export const useModeratorAccess = () => {
  const { userRole, loading } = useAuth();
  
  const hasModeratorAccess = userRole === 'moderator' || userRole === 'admin';
  
  return {
    hasModeratorAccess,
    loading
  };
};
