-- Add INSERT policy for user_profiles so users can create their own profile
CREATE POLICY "user_profiles_insert_self" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());