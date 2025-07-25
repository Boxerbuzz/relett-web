-- Create marketplace_listings table for token trading
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tokenized_property_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  buyer_id UUID NULL,
  token_amount NUMERIC NOT NULL CHECK (token_amount > 0),
  price_per_token NUMERIC NOT NULL CHECK (price_per_token > 0),
  total_price NUMERIC NOT NULL CHECK (total_price > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  transaction_id TEXT NULL,
  sold_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_listings
CREATE POLICY "Users can create listings for their tokens" 
ON public.marketplace_listings 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can view all active listings" 
ON public.marketplace_listings 
FOR SELECT 
USING (status = 'active' OR auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their own listings" 
ON public.marketplace_listings 
FOR UPDATE 
USING (auth.uid() = seller_id);

-- Create token_associations table for tracking Hedera token associations
CREATE TABLE IF NOT EXISTS public.token_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hedera_account_id TEXT NOT NULL,
  hedera_token_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL,
  associated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on token_associations
ALTER TABLE public.token_associations ENABLE ROW LEVEL SECURITY;

-- Create policies for token_associations
CREATE POLICY "Users can view their own token associations" 
ON public.token_associations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert token associations" 
ON public.token_associations 
FOR INSERT 
WITH CHECK (true);

-- Create poll_votes table for governance voting
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL,
  voter_id UUID NOT NULL,
  vote_option TEXT NOT NULL CHECK (vote_option IN ('yes', 'no', 'abstain')),
  voting_power NUMERIC NOT NULL DEFAULT 0,
  hedera_transaction_id TEXT NULL,
  hedera_consensus_timestamp TEXT NULL,
  ip_address INET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

-- Enable RLS on poll_votes
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for poll_votes
CREATE POLICY "Users can view votes for polls they participate in" 
ON public.poll_votes 
FOR SELECT 
USING (
  poll_id IN (
    SELECT p.id FROM investment_polls p 
    WHERE p.investment_group_id IN (
      SELECT th.tokenized_property_id FROM token_holdings th 
      WHERE th.holder_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create votes for polls they can participate in" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = voter_id AND 
  poll_id IN (
    SELECT p.id FROM investment_polls p 
    WHERE p.investment_group_id IN (
      SELECT th.tokenized_property_id FROM token_holdings th 
      WHERE th.holder_id = auth.uid()
    )
  )
);

-- Create RPC function to update token holdings after marketplace sale
CREATE OR REPLACE FUNCTION public.update_token_holdings_after_sale(
  p_seller_id UUID,
  p_buyer_id UUID,
  p_tokenized_property_id UUID,
  p_token_amount NUMERIC,
  p_total_price NUMERIC
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update seller's token holdings (decrease)
  UPDATE token_holdings 
  SET 
    tokens_owned = tokens_owned - p_token_amount,
    updated_at = now()
  WHERE holder_id = p_seller_id 
    AND tokenized_property_id = p_tokenized_property_id;

  -- Insert or update buyer's token holdings (increase)
  INSERT INTO token_holdings (
    holder_id, 
    tokenized_property_id, 
    tokens_owned, 
    total_investment,
    updated_at
  ) VALUES (
    p_buyer_id,
    p_tokenized_property_id,
    p_token_amount,
    p_total_price,
    now()
  )
  ON CONFLICT (holder_id, tokenized_property_id) 
  DO UPDATE SET
    tokens_owned = token_holdings.tokens_owned + p_token_amount,
    total_investment = token_holdings.total_investment + p_total_price,
    updated_at = now();
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_property ON public.marketplace_listings(tokenized_property_id);
CREATE INDEX IF NOT EXISTS idx_token_associations_user ON public.token_associations(user_id);
CREATE INDEX IF NOT EXISTS idx_token_associations_token ON public.token_associations(hedera_token_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter ON public.poll_votes(voter_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.marketplace_listings 
  ADD CONSTRAINT fk_marketplace_tokenized_property 
  FOREIGN KEY (tokenized_property_id) 
  REFERENCES public.tokenized_properties(id);

ALTER TABLE public.poll_votes 
  ADD CONSTRAINT fk_poll_votes_poll 
  FOREIGN KEY (poll_id) 
  REFERENCES public.investment_polls(id) 
  ON DELETE CASCADE;