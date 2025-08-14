-- Remove the overly permissive policy that makes users data publicly available
DROP POLICY IF EXISTS "Users data re publicly available" ON public.users;

-- Create secure RLS policies that only allow users to access their own data
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow admins to view all user data for administrative purposes
CREATE POLICY "Admins can view all user profiles" 
ON public.users 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update user profiles for administrative purposes
CREATE POLICY "Admins can update user profiles" 
ON public.users 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));