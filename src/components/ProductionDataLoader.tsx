
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ProductionDataLoader = () => {
  useEffect(() => {
    const loadProductionData = async () => {
      try {
        // Check if we already have data
        const { data: existingData, error: checkError } = await supabase
          .from('opportunities')
          .select('id')
          .limit(1);

        if (checkError) {
          console.error('Error checking existing data:', checkError);
          return;
        }

        // If we already have data, don't load more
        if (existingData && existingData.length > 0) {
          console.log('Production data already exists');
          return;
        }

        // Load sample production data
        const sampleOpportunities = [
          {
            title: "Software Engineering Internship at Google",
            description: "Join Google's engineering team for a 12-week summer internship program. Work on cutting-edge projects with experienced mentors.",
            type: "Internship",
            domain: "Tech",
            location: "Mountain View, CA",
            company: "Google",
            tags: ["Software Engineering", "Python", "Machine Learning"],
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            source_url: "https://careers.google.com/jobs/",
            is_approved: true
          },
          {
            title: "Microsoft Developer Challenge 2024",
            description: "Annual coding competition with prizes worth $50,000. Solve real-world problems using Microsoft Azure services.",
            type: "Contest",
            domain: "Tech",
            location: "Remote",
            company: "Microsoft",
            tags: ["Azure", "Cloud Computing", "API Development"],
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
            source_url: "https://developer.microsoft.com/",
            is_approved: true
          },
          {
            title: "Women in STEM Scholarship Program",
            description: "Merit-based scholarship for undergraduate women pursuing degrees in Science, Technology, Engineering, or Mathematics.",
            type: "Scholarship",
            domain: "Education",
            location: "USA",
            company: "STEM Foundation",
            tags: ["Women in Tech", "STEM", "Undergraduate"],
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
            source_url: "https://example.com/stem-scholarship",
            is_approved: true
          }
        ];

        const { error: insertError } = await supabase
          .from('opportunities')
          .insert(sampleOpportunities);

        if (insertError) {
          console.error('Error inserting sample data:', insertError);
        } else {
          console.log('Sample production data loaded successfully');
        }
      } catch (error) {
        console.error('Error in production data loader:', error);
      }
    };

    loadProductionData();
  }, []);

  return null; // This component doesn't render anything
};

export default ProductionDataLoader;
