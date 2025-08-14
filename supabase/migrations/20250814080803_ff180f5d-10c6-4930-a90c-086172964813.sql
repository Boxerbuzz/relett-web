-- Remove any overly permissive policies on contacts_us table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contacts_us;
DROP POLICY IF EXISTS "Public can view contact submissions" ON public.contacts_us;
DROP POLICY IF EXISTS "Users can view all contacts" ON public.contacts_us;

-- Create secure policy to restrict viewing to admins only
CREATE POLICY "Only admins can view contact submissions" 
ON public.contacts_us 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage contact submissions (update/delete)
CREATE POLICY "Admins can manage contact submissions" 
ON public.contacts_us 
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact submissions" 
ON public.contacts_us 
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure public can still submit contact forms (recreate if needed)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contacts_us;
CREATE POLICY "Anyone can submit contact form" 
ON public.contacts_us 
FOR INSERT 
WITH CHECK (true);