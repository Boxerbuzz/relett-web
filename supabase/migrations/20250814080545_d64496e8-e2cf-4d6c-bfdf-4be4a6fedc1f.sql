-- Remove any overly permissive policies on payments table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.payments;
DROP POLICY IF EXISTS "Users can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Public access to payments" ON public.payments;

-- Create secure RLS policies for payments table
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow admins to manage all payments for administrative purposes
CREATE POLICY "Admins can manage all payments" 
ON public.payments 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system processes (edge functions) to manage payments
CREATE POLICY "System can manage payments" 
ON public.payments 
FOR ALL
USING (auth.role() = 'service_role');