
-- Create polls table for investment group voting
CREATE TABLE public.investment_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_group_id UUID NOT NULL REFERENCES investment_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT NOT NULL DEFAULT 'simple' CHECK (poll_type IN ('simple', 'multiple_choice', 'ranked', 'weighted')),
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  min_participation_percentage NUMERIC DEFAULT 50.0 CHECK (min_participation_percentage >= 0 AND min_participation_percentage <= 100),
  requires_consensus BOOLEAN DEFAULT false,
  consensus_threshold NUMERIC DEFAULT 66.7 CHECK (consensus_threshold >= 50 AND consensus_threshold <= 100),
  allow_vote_changes BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  voting_power_basis TEXT DEFAULT 'tokens' CHECK (voting_power_basis IN ('tokens', 'equal', 'investment_amount')),
  hedera_topic_id TEXT,
  hedera_consensus_timestamp TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES investment_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES investment_polls(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  voting_power NUMERIC NOT NULL DEFAULT 1.0,
  vote_weight NUMERIC DEFAULT 1.0,
  ranked_choices JSONB, -- For ranked voting: [option_id_1, option_id_2, ...]
  vote_data JSONB DEFAULT '{}', -- Additional vote metadata
  hedera_transaction_id TEXT,
  hedera_consensus_timestamp TEXT,
  ip_address INET,
  user_agent TEXT,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id) -- One vote per user per poll
);

-- Create poll results view for easy querying
CREATE VIEW public.poll_results AS
SELECT 
  p.id as poll_id,
  p.title,
  p.status,
  p.ends_at,
  po.id as option_id,
  po.option_text,
  po.option_order,
  COUNT(pv.id) as vote_count,
  COALESCE(SUM(pv.voting_power), 0) as total_voting_power,
  COALESCE(SUM(pv.vote_weight), 0) as total_vote_weight,
  ROUND((COALESCE(SUM(pv.voting_power), 0) / NULLIF(
    (SELECT SUM(pv2.voting_power) FROM poll_votes pv2 WHERE pv2.poll_id = p.id), 0
  )) * 100, 2) as vote_percentage
FROM investment_polls p
LEFT JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN poll_votes pv ON po.id = pv.poll_option_id
GROUP BY p.id, p.title, p.status, p.ends_at, po.id, po.option_text, po.option_order
ORDER BY p.created_at DESC, po.option_order ASC;

-- Add indexes for performance
CREATE INDEX idx_investment_polls_group_id ON investment_polls(investment_group_id);
CREATE INDEX idx_investment_polls_status ON investment_polls(status);
CREATE INDEX idx_investment_polls_ends_at ON investment_polls(ends_at);
CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_voter_id ON poll_votes(voter_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);

-- Enable RLS
ALTER TABLE investment_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment_polls
CREATE POLICY "Users can view polls in their investment groups" ON investment_polls
  FOR SELECT USING (
    investment_group_id IN (
      SELECT th.tokenized_property_id 
      FROM token_holdings th 
      WHERE th.holder_id = auth.uid()
    )
  );

CREATE POLICY "Group participants can create polls" ON investment_polls
  FOR INSERT WITH CHECK (
    investment_group_id IN (
      SELECT th.tokenized_property_id 
      FROM token_holdings th 
      WHERE th.holder_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Poll creators can update their polls" ON investment_polls
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for poll_options
CREATE POLICY "Users can view poll options" ON poll_options
  FOR SELECT USING (
    poll_id IN (
      SELECT ip.id FROM investment_polls ip
      WHERE ip.investment_group_id IN (
        SELECT th.tokenized_property_id 
        FROM token_holdings th 
        WHERE th.holder_id = auth.uid()
      )
    )
  );

CREATE POLICY "Poll creators can manage options" ON poll_options
  FOR ALL USING (
    poll_id IN (
      SELECT ip.id FROM investment_polls ip 
      WHERE ip.created_by = auth.uid()
    )
  );

-- RLS Policies for poll_votes
CREATE POLICY "Users can view votes in their groups" ON poll_votes
  FOR SELECT USING (
    poll_id IN (
      SELECT ip.id FROM investment_polls ip
      WHERE ip.investment_group_id IN (
        SELECT th.tokenized_property_id 
        FROM token_holdings th 
        WHERE th.holder_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can vote in their groups" ON poll_votes
  FOR INSERT WITH CHECK (
    voter_id = auth.uid() 
    AND poll_id IN (
      SELECT ip.id FROM investment_polls ip
      WHERE ip.investment_group_id IN (
        SELECT th.tokenized_property_id 
        FROM token_holdings th 
        WHERE th.holder_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own votes" ON poll_votes
  FOR UPDATE USING (voter_id = auth.uid());

-- Function to automatically close expired polls
CREATE OR REPLACE FUNCTION close_expired_polls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE investment_polls 
  SET status = 'closed', updated_at = now()
  WHERE status = 'active' 
    AND ends_at < now();
END;
$$;

-- Function to calculate voting power based on token holdings
CREATE OR REPLACE FUNCTION calculate_voting_power(
  p_poll_id UUID, 
  p_voter_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_record investment_polls%ROWTYPE;
  voting_power NUMERIC := 1.0;
  token_amount NUMERIC;
  total_tokens NUMERIC;
  investment_amount NUMERIC;
  total_investment NUMERIC;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM investment_polls WHERE id = p_poll_id;
  
  IF NOT FOUND THEN
    RETURN 1.0;
  END IF;
  
  CASE poll_record.voting_power_basis
    WHEN 'tokens' THEN
      -- Voting power based on token holdings
      SELECT 
        COALESCE(th.tokens_owned::NUMERIC, 0),
        tp.total_supply::NUMERIC
      INTO token_amount, total_tokens
      FROM token_holdings th
      JOIN tokenized_properties tp ON th.tokenized_property_id = tp.id
      WHERE th.holder_id = p_voter_id 
        AND th.tokenized_property_id = poll_record.investment_group_id;
      
      IF total_tokens > 0 THEN
        voting_power := (token_amount / total_tokens) * 100;
      END IF;
      
    WHEN 'investment_amount' THEN
      -- Voting power based on investment amount
      SELECT 
        COALESCE(th.total_investment, 0),
        COALESCE(SUM(th2.total_investment), 1)
      INTO investment_amount, total_investment
      FROM token_holdings th
      LEFT JOIN token_holdings th2 ON th2.tokenized_property_id = th.tokenized_property_id
      WHERE th.holder_id = p_voter_id 
        AND th.tokenized_property_id = poll_record.investment_group_id
      GROUP BY th.total_investment;
      
      IF total_investment > 0 THEN
        voting_power := (investment_amount / total_investment) * 100;
      END IF;
      
    WHEN 'equal' THEN
      -- Equal voting power for all participants
      voting_power := 1.0;
      
  END CASE;
  
  RETURN COALESCE(voting_power, 1.0);
END;
$$;

-- Trigger to update poll updated_at timestamp
CREATE TRIGGER update_investment_polls_updated_at
  BEFORE UPDATE ON investment_polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_poll_votes_updated_at
  BEFORE UPDATE ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();
