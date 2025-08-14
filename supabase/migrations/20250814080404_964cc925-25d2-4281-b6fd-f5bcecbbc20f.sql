-- First drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users data re publicly available" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- Create secure RLS policies that only allow users to access their own data
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow admins to view all user data for administrative purposes
CREATE POLICY "Admins can manage all profiles" 
ON public.users 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));