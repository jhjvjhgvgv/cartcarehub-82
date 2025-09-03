-- Fix authenticate_admin function to use extension-qualified functions
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
  
  -- Verify password using pgcrypto (extensions schema)
  IF admin_record.password_hash != extensions.crypt(p_password, admin_record.password_hash) THEN
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
  session_token := encode(extensions.gen_random_bytes(32), 'base64');
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