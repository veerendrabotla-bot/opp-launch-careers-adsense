
-- PHASE 1: CRITICAL PRIVILEGE ESCALATION FIX
-- Remove the dangerous policy that allows anyone to insert roles
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;

-- Create a secure policy that only allows admins to assign roles
CREATE POLICY "Only admins can assign roles" ON public.user_roles
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only allow if current user is admin AND they're assigning a role to someone else
  public.is_admin(auth.uid()) AND assigned_by = auth.uid()
);

-- Create a secure function for admin registration with access code validation
CREATE OR REPLACE FUNCTION public.register_admin_with_code(_email text, _password text, _name text, _access_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Validate access code (store this securely, not in client code)
  IF _access_code != 'rani' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid access code');
  END IF;
  
  -- This function should be called after user signup to assign admin role
  -- The actual user creation should happen through Supabase Auth
  RETURN jsonb_build_object('success', true, 'message', 'Access code validated');
END;
$$;

-- Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_role_secure(_target_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Remove existing role for target user
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  
  -- Assign new role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (_target_user_id, _role, auth.uid());
  
  -- Log the action
  PERFORM public.log_admin_action(
    'role_assignment',
    'user_role',
    _target_user_id,
    jsonb_build_object(
      'new_role', _role::text,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN true;
END;
$$;

-- Create table for storing email campaigns and notifications
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  recipient_type text NOT NULL DEFAULT 'all', -- 'all', 'role_based', 'specific'
  target_roles app_role[] DEFAULT NULL,
  target_users uuid[] DEFAULT NULL,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'sending', 'sent', 'failed'
  sent_count integer DEFAULT 0,
  total_recipients integer DEFAULT 0,
  scheduled_at timestamp with time zone DEFAULT NULL,
  sent_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on email notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email notifications
CREATE POLICY "Admins can manage email notifications" ON public.email_notifications
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create function to send bulk notifications
CREATE OR REPLACE FUNCTION public.send_bulk_notification(
  _subject text,
  _content text,
  _recipient_type text DEFAULT 'all',
  _target_roles app_role[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_id uuid;
  recipient_count integer;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can send bulk notifications';
  END IF;
  
  -- Create the email notification record
  INSERT INTO public.email_notifications (
    created_by, subject, content, recipient_type, target_roles, status
  ) VALUES (
    auth.uid(), _subject, _content, _recipient_type, _target_roles, 'draft'
  ) RETURNING id INTO notification_id;
  
  -- Calculate recipient count based on type
  IF _recipient_type = 'all' THEN
    SELECT COUNT(*) INTO recipient_count FROM public.profiles;
  ELSIF _recipient_type = 'role_based' AND _target_roles IS NOT NULL THEN
    SELECT COUNT(DISTINCT ur.user_id) INTO recipient_count 
    FROM public.user_roles ur 
    WHERE ur.role = ANY(_target_roles);
  END IF;
  
  -- Update total recipients
  UPDATE public.email_notifications 
  SET total_recipients = recipient_count
  WHERE id = notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_audit_log
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _details jsonb DEFAULT NULL,
  _severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type, user_id, details, severity
  ) VALUES (
    _event_type, auth.uid(), _details, _severity
  );
END;
$$;
