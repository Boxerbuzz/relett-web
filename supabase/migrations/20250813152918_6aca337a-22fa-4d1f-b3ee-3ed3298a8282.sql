-- CRITICAL SECURITY FIX: Replace overly permissive RLS policies with secure user-specific policies

-- Fix users table - users should only see their own data
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Fix accounts table - users should only access their own accounts
DROP POLICY IF EXISTS "Allow user access to own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix contacts_us table - should be admin-only for viewing
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contacts_us;
DROP POLICY IF EXISTS "Any body can insert" ON public.contacts_us;

CREATE POLICY "Anyone can submit contact form" ON public.contacts_us
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" ON public.contacts_us
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix payments table - users should only see their own payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment status" ON public.payments
  FOR UPDATE USING (true);

-- Fix notifications table - users should only see their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);