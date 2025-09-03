-- Create separate admin authentication system
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text,
  permissions jsonb NOT NULL DEFAULT '["super_admin"]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamp with time zone,
  login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.admin_accounts(id)
);

-- Create admin sessions table for session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_accounts (only accessible by other admins)
CREATE POLICY "Admins can view admin accounts" ON public.admin_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions s 
      WHERE s.session_token = current_setting('request.headers', true)::json->>'authorization'
      AND s.is_active = true 
      AND s.expires_at > now()
    )
  );

CREATE POLICY "Super admins can manage admin accounts" ON public.admin_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_sessions s 
      JOIN public.admin_accounts a ON s.admin_id = a.id
      WHERE s.session_token = current_setting('request.headers', true)::json->>'authorization'
      AND s.is_active = true 
      AND s.expires_at > now()
      AND a.permissions ? 'super_admin'
    )
  );

-- Create policies for admin_sessions
CREATE POLICY "Admins can view their own sessions" ON public.admin_sessions
  FOR SELECT USING (
    admin_id = (
      SELECT a.id FROM public.admin_accounts a 
      JOIN public.admin_sessions s ON a.id = s.admin_id
      WHERE s.session_token = current_setting('request.headers', true)::json->>'authorization'
      AND s.is_active = true 
      AND s.expires_at > now()
    )
  );

CREATE POLICY "System can insert admin sessions" ON public.admin_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update admin sessions" ON public.admin_sessions
  FOR UPDATE USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_accounts_username ON public.admin_accounts(username);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_active ON public.admin_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_accounts_updated_at
  BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  p_username text,
  p_password text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_record record;
  session_token text;
  session_expires timestamp with time zone;
  result jsonb;
BEGIN
  -- Get admin account
  SELECT * INTO admin_record 
  FROM public.admin_accounts 
  WHERE username = p_username AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Check if account is locked
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Account is temporarily locked. Please try again later.'
    );
  END IF;
  
  -- Verify password (in production, this would use proper password hashing)
  -- For now, we'll use a simple comparison - in real implementation use bcrypt
  IF admin_record.password_hash != crypt(p_password, admin_record.password_hash) THEN
    -- Increment login attempts
    UPDATE public.admin_accounts 
    SET 
      login_attempts = login_attempts + 1,
      locked_until = CASE 
        WHEN login_attempts + 1 >= 5 THEN now() + interval '30 minutes'
        ELSE NULL
      END
    WHERE id = admin_record.id;
    
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Generate session token
  session_token := encode(gen_random_bytes(32), 'base64');
  session_expires := now() + interval '24 hours';
  
  -- Create session
  INSERT INTO public.admin_sessions (
    admin_id,
    session_token,
    expires_at,
    ip_address,
    user_agent
  ) VALUES (
    admin_record.id,
    session_token,
    session_expires,
    p_ip_address,
    p_user_agent
  );
  
  -- Update admin account
  UPDATE public.admin_accounts 
  SET 
    last_login = now(),
    login_attempts = 0,
    locked_until = NULL
  WHERE id = admin_record.id;
  
  -- Log the login
  PERFORM public.log_admin_activity(
    'master_admin_login',
    'system',
    'authentication',
    jsonb_build_object(
      'username', admin_record.username,
      'ip_address', p_ip_address,
      'user_agent', p_user_agent
    )
  );
  
  result := jsonb_build_object(
    'success', true,
    'session_token', session_token,
    'expires_at', session_expires,
    'admin', jsonb_build_object(
      'id', admin_record.id,
      'username', admin_record.username,
      'email', admin_record.email,
      'display_name', admin_record.display_name,
      'permissions', admin_record.permissions
    )
  );
  
  RETURN result;
END;
$$;

-- Function to verify admin session
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_session_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  session_record record;
  admin_record record;
  result jsonb;
BEGIN
  -- Get session with admin info
  SELECT 
    s.*,
    a.username,
    a.email,
    a.display_name,
    a.permissions,
    a.is_active as admin_active
  INTO session_record
  FROM public.admin_sessions s
  JOIN public.admin_accounts a ON s.admin_id = a.id
  WHERE s.session_token = p_session_token
    AND s.is_active = true
    AND s.expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid or expired session'
    );
  END IF;
  
  IF NOT session_record.admin_active THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin account is deactivated'
    );
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'admin', jsonb_build_object(
      'id', session_record.admin_id,
      'username', session_record.username,
      'email', session_record.email,
      'display_name', session_record.display_name,
      'permissions', session_record.permissions
    ),
    'session', jsonb_build_object(
      'expires_at', session_record.expires_at
    )
  );
  
  RETURN result;
END;
$$;

-- Function to logout admin
CREATE OR REPLACE FUNCTION public.logout_admin(p_session_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.admin_sessions 
  SET is_active = false
  WHERE session_token = p_session_token;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Logged out successfully'
  );
END;
$$;

-- Insert default master admin account (password: 'admin123' - CHANGE THIS!)
INSERT INTO public.admin_accounts (
  username,
  email,
  password_hash,
  display_name,
  permissions
) VALUES (
  'masteradmin',
  'admin@cartmaintenance.com',
  crypt('admin123', gen_salt('bf')),
  'Master Administrator',
  '["super_admin", "user_management", "system_config", "analytics"]'::jsonb
) ON CONFLICT (username) DO NOTHING;