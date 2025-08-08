-- Create investment_group_members table
CREATE TABLE public.investment_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_group_id uuid REFERENCES public.investment_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT now(),
  tokens_committed numeric DEFAULT 0,
  investment_amount numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(investment_group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.investment_group_members ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for investment_group_members table
CREATE POLICY "Users can view group members for their investments" 
ON public.investment_group_members 
FOR SELECT 
USING (
  investment_group_id IN (
    SELECT ig.id 
    FROM investment_groups ig 
    JOIN token_holdings th ON ig.tokenized_property_id = th.tokenized_property_id 
    WHERE th.holder_id = auth.uid()
  )
);

CREATE POLICY "Users can see their own group memberships" 
ON public.investment_group_members 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert group members" 
ON public.investment_group_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update group members" 
ON public.investment_group_members 
FOR UPDATE 
USING (true);

-- Add timestamp trigger
CREATE TRIGGER update_investment_group_members_updated_at
  BEFORE UPDATE ON public.investment_group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();