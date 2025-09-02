-- Create a store user account for testing
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Generate a random UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Insert user into auth.users table
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'store@demo.com',
        crypt('store123', gen_salt('bf')), -- Password: store123
        now(),
        now(),
        '',
        now(),
        '',
        null,
        '',
        '',
        null,
        null,
        '{"provider":"email","providers":["email"]}',
        '{"role":"store"}',
        false,
        now(),
        now(),
        null,
        null,
        '',
        '',
        null,
        '',
        0,
        null,
        '',
        null
    );
    
    -- Insert corresponding profile
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'store@demo.com',
        'Store Demo User',
        'store',
        true,
        now(),
        now()
    );
    
    RAISE NOTICE 'Created store user with email: store@demo.com and password: store123';
END $$;