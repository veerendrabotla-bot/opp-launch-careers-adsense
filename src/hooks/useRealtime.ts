
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealtimeOptions {
  table: 'opportunities' | 'applications' | 'notifications' | 'bookmarks' | 'analytics';
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

interface RealtimeData {
  id: string;
  [key: string]: any;
}

export const useRealtime = (options: UseRealtimeOptions) => {
  const [data, setData] = useState<RealtimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);

  const { table, event = '*', filter } = options;

  useEffect(() => {
    if (!user || !mountedRef.current) return;

    const fetchInitialData = async () => {
      try {
        const query = supabase.from(table as any).select('*');
        if (filter) {
          const [field, value] = filter.split('=');
          query.eq(field, value);
        }
        const { data: initialData, error } = await query;
        
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          if (mountedRef.current) setData([]);
        } else {
          if (mountedRef.current) setData((initialData as unknown as RealtimeData[]) || []);
        }
      } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        if (mountedRef.current) setData([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchInitialData();

    // Clean up existing subscription first
    if (channelRef.current) {
      console.log(`Cleaning up existing ${table} subscription`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // Only create new subscription if not already subscribed
    if (!isSubscribedRef.current && mountedRef.current) {
      const channelName = `realtime-${table}-${user.id}-${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: event as any,
            schema: 'public',
            table,
            filter: filter || undefined,
          },
          (payload: any) => {
            if (!mountedRef.current) return;
            
            console.log(`Realtime update for ${table}:`, payload);
            
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map((item: RealtimeData) => 
                item.id === payload.new.id ? payload.new : item
              ));
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter((item: RealtimeData) => item.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log(`${table} subscription status:`, status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          }
        });

      channelRef.current = channel;
    }

    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        console.log(`Cleaning up ${table} subscription on unmount`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [table, event, filter, user?.id]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, setData };
};
