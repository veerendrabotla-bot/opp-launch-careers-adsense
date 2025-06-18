
-- First, ensure RLS is enabled on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;

-- Create comprehensive RLS policies for user_roles table

-- 1. Allow users to view only their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 2. Only admins can assign roles (prevents privilege escalation)
CREATE POLICY "Only admins can assign roles" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- 3. Only admins can update roles
CREATE POLICY "Only admins can update roles" ON public.user_roles
    FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()));

-- 4. Only admins can delete roles
CREATE POLICY "Only admins can delete roles" ON public.user_roles
    FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

-- Create enhanced admin action logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
    _action_type text,
    _target_type text,
    _target_id uuid,
    _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow authenticated users to log actions
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Log the admin action
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        _action_type,
        _target_type,
        _target_id,
        _details
    );
END;
$$;

-- Create function to safely assign user roles with logging
CREATE OR REPLACE FUNCTION public.assign_user_role(
    _user_id uuid,
    _role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the current user is an admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;
    
    -- Delete existing role for this user (enforce single role per user)
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (_user_id, _role, auth.uid());
    
    -- Log the action
    PERFORM public.log_admin_action(
        'assign_role',
        'user',
        _user_id,
        jsonb_build_object('role', _role::text)
    );
    
    RETURN true;
END;
$$;

-- Add RLS policies for admin_actions table
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Only admins can view admin actions" ON public.admin_actions
    FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

-- Only admins can insert admin actions (via function)
CREATE POLICY "Only admins can log actions" ON public.admin_actions
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Create index for better performance on user_roles queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
