
-- Add analytics table for tracking user interactions
CREATE TABLE public.analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    page_url text,
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
    user_agent text,
    ip_address inet,
    session_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone
);

-- Add email campaigns table
CREATE TABLE public.email_campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    title text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    recipient_type text NOT NULL DEFAULT 'all', -- 'all', 'active', 'specific'
    recipient_emails text[],
    status text NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'scheduled'
    sent_at timestamp with time zone,
    scheduled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add platform settings table
CREATE TABLE public.platform_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL,
    description text,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics
CREATE POLICY "Admins can view all analytics" ON public.analytics
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own analytics" ON public.analytics
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for email campaigns
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for platform settings
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('enable_resume_ai', 'true', 'Enable AI resume tailoring feature'),
('enable_submissions', 'true', 'Allow user submissions'),
('require_login_for_apply', 'true', 'Require login before accessing external links'),
('auto_delete_expired', 'true', 'Automatically delete expired opportunities'),
('weekly_digest', 'true', 'Send weekly digest emails'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('admin_email', '"admin@opportune.com"', 'Admin email address'),
('support_email', '"support@opportune.com"', 'Support email address'),
('platform_announcement', '""', 'Platform-wide announcement'),
('contact_info', '"Contact us for support and inquiries"', 'Contact information for users');

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
