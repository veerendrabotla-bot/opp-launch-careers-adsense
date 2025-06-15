
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Analytics = Database['public']['Tables']['analytics']['Row'];

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const trackEvent = async (eventType: string, metadata?: any, opportunityId?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('analytics')
        .insert({
          user_id: user.id,
          event_type: eventType,
          page_url: window.location.pathname,
          opportunity_id: opportunityId,
          user_agent: navigator.userAgent,
          session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
          metadata: metadata
        });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    trackEvent,
    fetchAnalytics
  };
};
