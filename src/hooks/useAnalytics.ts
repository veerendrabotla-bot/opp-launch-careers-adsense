
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (eventType: string, metadata?: any) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('analytics')
        .insert({
          event_type: eventType,
          user_id: user.id,
          metadata: metadata || {},
          page_url: window.location.pathname,
          user_agent: navigator.userAgent,
          session_id: `session_${Date.now()}`
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  return { trackEvent };
};
