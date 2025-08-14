-- Remove any overly permissive policies on contacts_us table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contacts_us;
DROP POLICY IF EXISTS "Public can view contact submissions" ON public.contacts_us;
DROP POLICY IF EXISTS "Users can view all contacts" ON public.contacts_us;

-- Keep the existing policy for public form submission (secure)
-- This should already exist: "Anyone can submit contact form"

-- Create secure policy to restrict viewing to admins only
CREATE POLICY "Only admins can view contact submissions" 
ON public.contacts_us 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage contact submissions
CREATE POLICY "Admins can manage contact submissions" 
ON public.contacts_us 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure public can still submit contact forms (this should already exist)
-- If it doesn't exist, create it
CREATE POLICY IF NOT EXISTS "Anyone can submit contact form" 
ON public.contacts_us 
FOR INSERT 
WITH CHECK (true);