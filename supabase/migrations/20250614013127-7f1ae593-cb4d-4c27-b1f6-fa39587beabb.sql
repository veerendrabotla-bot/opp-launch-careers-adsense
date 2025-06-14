
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'moderator');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Create admin_actions table for audit logging
CREATE TABLE public.admin_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    details jsonb,
    performed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add admin-specific columns to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN rejection_reason text,
ADD COLUMN approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN approved_at timestamp with time zone;

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()));

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can log actions" ON public.admin_actions
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Update opportunities policies for admin management
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.opportunities;

CREATE POLICY "Users can update own opportunities or admins can update any" ON public.opportunities
    FOR UPDATE TO authenticated
    USING (auth.uid() = submitted_by OR public.is_admin(auth.uid()));

-- Function to auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user role assignment
CREATE TRIGGER on_auth_user_role_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Insert admin user (you'll need to replace with actual admin user ID after signup)
-- This is a placeholder - you'll need to update this after creating your admin account
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-admin-user-id', 'admin');

-- Enable realtime for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_actions;
