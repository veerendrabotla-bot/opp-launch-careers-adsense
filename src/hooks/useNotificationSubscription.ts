
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface UseNotificationSubscriptionProps {
  onNewNotification: (notification: Notification) => void;
  onRefresh: () => void;
}

export const useNotificationSubscription = ({
  onNewNotification,
  onRefresh
}: UseNotificationSubscriptionProps) => {
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('Setting up notification subscription for user:', user.id);
    
    const channelName = `notifications-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload);
          if (mountedRef.current) {
            onNewNotification(payload.new as Notification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification updated:', payload);
          // Only refresh if it's not a read status update to prevent loops
          if (mountedRef.current && payload.old?.is_read !== payload.new?.is_read) {
            setTimeout(() => {
              onRefresh();
            }, 500);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up notification subscription');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, onNewNotification, onRefresh]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        console.log('Cleaning up notification subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);
};
