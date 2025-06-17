
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];

export const useAdmin = () => {
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [pendingOpportunities, setPendingOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useAuth();

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      // Fetch all opportunities
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (opportunitiesError) throw opportunitiesError;

      setAllOpportunities(opportunities || []);
      setPendingOpportunities(opportunities?.filter(opp => !opp.is_approved) || []);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('id', id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (err: any) {
      console.error('Error approving opportunity:', err);
      throw err;
    }
  };

  const rejectOpportunity = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          is_approved: false,
          rejection_reason: reason 
        })
        .eq('id', id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (err: any) {
      console.error('Error rejecting opportunity:', err);
      throw err;
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchOpportunities();
    } catch (err: any) {
      console.error('Error deleting opportunity:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isModerator) {
      fetchOpportunities();
    }
  }, [isModerator]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isModerator) return;

    const channel = supabase
      .channel('admin-opportunities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunities',
        },
        () => {
          fetchOpportunities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isModerator]);

  return {
    allOpportunities,
    pendingOpportunities,
    loading,
    error,
    isAdmin,
    isModerator,
    approveOpportunity,
    rejectOpportunity,
    deleteOpportunity,
    refetch: fetchOpportunities
  };
};
