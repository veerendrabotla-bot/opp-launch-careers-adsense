
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductionMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalUsers: 0,
    totalApplications: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // Get opportunity counts
        const { data: allOpportunities } = await supabase
          .from('opportunities')
          .select('id, applications, deadline')
          .eq('is_approved', true);

        const activeOpportunities = allOpportunities?.filter(
          opp => new Date(opp.deadline) > new Date()
        ) || [];

        // Get user count
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id');

        // Calculate total applications
        const totalApplications = allOpportunities?.reduce(
          (sum, opp) => sum + (opp.applications || 0), 0
        ) || 0;

        // Get recent activity from analytics
        const { data: recentActivity } = await supabase
          .from('analytics')
          .select('event_type, created_at, metadata')
          .order('created_at', { ascending: false })
          .limit(10);

        setMetrics({
          totalOpportunities: allOpportunities?.length || 0,
          activeOpportunities: activeOpportunities.length,
          totalUsers: profiles?.length || 0,
          totalApplications,
          recentActivity: recentActivity || []
        });

      } catch (error) {
        console.error('Error fetching production metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Set up real-time updates
    const channel = supabase
      .channel('production-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, loading };
};
