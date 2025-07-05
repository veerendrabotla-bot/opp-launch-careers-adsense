
-- Create ads table for advertising system
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies for ads
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Advertisers can view and manage their own ads
CREATE POLICY "Advertisers can view own ads" 
  ON public.ads 
  FOR SELECT 
  USING (auth.uid() = advertiser_id);

CREATE POLICY "Advertisers can insert own ads" 
  ON public.ads 
  FOR INSERT 
  WITH CHECK (auth.uid() = advertiser_id);

CREATE POLICY "Advertisers can update own ads" 
  ON public.ads 
  FOR UPDATE 
  USING (auth.uid() = advertiser_id);

-- Admins can view all ads
CREATE POLICY "Admins can view all ads" 
  ON public.ads 
  FOR SELECT 
  USING (is_admin(auth.uid()));

-- Create applications tracking table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own applications
CREATE POLICY "Users can view own applications" 
  ON public.applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" 
  ON public.applications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Moderators and admins can view all applications
CREATE POLICY "Moderators can view all applications" 
  ON public.applications 
  FOR SELECT 
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users NOT NULL,
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  views INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT
);

-- Add RLS policies for blog posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (status = 'published');

-- Authors can manage their own posts
CREATE POLICY "Authors can manage own posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (auth.uid() = author_id);

-- Admins can manage all posts
CREATE POLICY "Admins can manage all blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Add advertiser role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'advertiser';

-- Create function to update ads updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for ads updated_at
CREATE TRIGGER update_ads_updated_at_trigger
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ads_updated_at();

-- Create function to update applications updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for applications updated_at
CREATE TRIGGER update_applications_updated_at_trigger
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_applications_updated_at();

-- Create function to update blog_posts updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at_trigger
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_posts_updated_at();
