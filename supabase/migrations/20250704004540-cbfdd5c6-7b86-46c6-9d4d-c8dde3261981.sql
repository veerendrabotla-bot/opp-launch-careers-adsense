
-- Add columns for enhanced opportunity management
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS remote_work_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS experience_required TEXT DEFAULT 'entry',
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full-time',
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS application_instructions TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source_platform TEXT;

-- Create opportunity categories table
CREATE TABLE IF NOT EXISTS public.opportunity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.opportunity_categories (name, description, color, icon) VALUES
('Technology', 'Software development, IT, and tech roles', '#3b82f6', 'laptop'),
('Healthcare', 'Medical, nursing, and healthcare positions', '#ef4444', 'heart'),
('Finance', 'Banking, accounting, and financial services', '#10b981', 'dollar-sign'),
('Education', 'Teaching, research, and academic positions', '#f59e0b', 'graduation-cap'),
('Marketing', 'Digital marketing, advertising, and PR', '#8b5cf6', 'megaphone'),
('Engineering', 'Civil, mechanical, and other engineering roles', '#06b6d4', 'settings'),
('Design', 'UI/UX, graphic design, and creative roles', '#ec4899', 'palette'),
('Sales', 'Business development and sales positions', '#84cc16', 'trending-up')
ON CONFLICT (name) DO NOTHING;

-- Create opportunity tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.opportunity_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, tag)
);

-- Create user saved searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT true
);

-- Create recently viewed opportunities table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Enable RLS on new tables
ALTER TABLE public.opportunity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- RLS policies for opportunity_categories (public read)
CREATE POLICY "Anyone can view categories" ON public.opportunity_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.opportunity_categories
FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for opportunity_tags (public read for approved opportunities)
CREATE POLICY "Anyone can view tags for approved opportunities" ON public.opportunity_tags
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.opportunities 
    WHERE opportunities.id = opportunity_tags.opportunity_id 
    AND opportunities.is_approved = true
  )
);

CREATE POLICY "Moderators can manage tags" ON public.opportunity_tags
FOR ALL USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for recently_viewed
CREATE POLICY "Users can manage their own recently viewed" ON public.recently_viewed
FOR ALL USING (auth.uid() = user_id);

-- Create function to mark opportunity as expired
CREATE OR REPLACE FUNCTION mark_expired_opportunities()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.opportunities 
    SET is_expired = true, updated_at = NOW()
    WHERE deadline < CURRENT_DATE 
    AND is_expired = false;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- Create function to clean up old recently viewed records (keep only last 50 per user)
CREATE OR REPLACE FUNCTION cleanup_recently_viewed()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    WITH ranked_views AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY viewed_at DESC) as rn
        FROM public.recently_viewed
    )
    DELETE FROM public.recently_viewed 
    WHERE id IN (
        SELECT id FROM ranked_views WHERE rn > 50
    );
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RETURN cleanup_count;
END;
$$;

-- Update opportunities table trigger to handle expiration
CREATE OR REPLACE FUNCTION update_opportunity_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Auto-expire if deadline has passed
    IF NEW.deadline < CURRENT_DATE THEN
        NEW.is_expired := true;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS opportunity_update_trigger ON public.opportunities;
CREATE TRIGGER opportunity_update_trigger
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_trigger();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON public.opportunities 
USING GIN (to_tsvector('english', title || ' ' || description || ' ' || COALESCE(company, '')));

CREATE INDEX IF NOT EXISTS idx_opportunities_filters ON public.opportunities 
(type, domain, location, is_approved, is_expired, deadline);

CREATE INDEX IF NOT EXISTS idx_opportunity_tags_search ON public.opportunity_tags (tag);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed (user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches (user_id);
