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