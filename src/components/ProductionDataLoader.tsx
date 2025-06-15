
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProductionDataLoader = () => {
  const { toast } = useToast();

  useEffect(() => {
    const initializeProductionData = async () => {
      try {
        // Check if we have any real opportunities
        const { data: existingOpportunities, error } = await supabase
          .from('opportunities')
          .select('id')
          .limit(1);

        if (error) {
          console.error('Error checking opportunities:', error);
          return;
        }

        // If no opportunities exist, we could add some initial data or show a welcome message
        if (!existingOpportunities || existingOpportunities.length === 0) {
          console.log('No opportunities found - platform ready for production data');
          
          // You could uncomment this to show a welcome toast
          // toast({
          //   title: "Welcome to Production!",
          //   description: "Your platform is ready. Start by submitting opportunities.",
          // });
        }

        // Initialize platform settings if they don't exist
        const { data: settings } = await supabase
          .from('platform_settings')
          .select('key')
          .limit(1);

        if (!settings || settings.length === 0) {
          await supabase
            .from('platform_settings')
            .insert([
              {
                key: 'platform_name',
                value: 'OpportunityHub',
                description: 'The name of the platform'
              },
              {
                key: 'max_opportunities_per_user',
                value: 10,
                description: 'Maximum opportunities a user can submit per month'
              },
              {
                key: 'auto_approve_opportunities',
                value: false,
                description: 'Whether to automatically approve submitted opportunities'
              }
            ]);
        }

      } catch (error) {
        console.error('Error initializing production data:', error);
      }
    };

    initializeProductionData();
  }, []);

  return null; // This component doesn't render anything
};

export default ProductionDataLoader;
