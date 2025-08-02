
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationSubscriptionProps {
  onNewNotification: (notification: any) => void;
  onRefresh: () => void;
}

export const useNotificationSubscription = ({ 
  onNewNotification, 
  onRefresh 
}: NotificationSubscriptionProps) => {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const subscribedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up notification subscription');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      channelRef.current = null;
      subscribedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user || subscribedRef.current) return;

    // Clean up any existing subscription first
    cleanup();

    const channelName = `notifications-${user.id}-${Date.now()}`;
    
    try {
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!mountedRef.current) return;
            
            console.log('New notification received:', payload);
            const newNotification = payload.new;
            
            onNewNotification(newNotification);
            onRefresh();
            
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.action_url ? {
                label: 'View',
                onClick: () => window.open(newNotification.action_url, '_blank')
              } : undefined,
            });
          }
        )
        .subscribe((status) => {
          console.log(`Notification subscription status: ${status}`);
          if (status === 'SUBSCRIBED') {
            subscribedRef.current = true;
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [user?.id, onNewNotification, onRefresh, cleanup]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);
};
