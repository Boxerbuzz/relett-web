-- Create governance_proposals table for property governance
CREATE TABLE public.governance_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tokenized_property_id UUID NOT NULL REFERENCES public.tokenized_properties(id) ON DELETE CASCADE,
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('property_management', 'renovation', 'sale_approval', 'revenue_distribution')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'executed')),
  voting_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  required_approval_percentage NUMERIC NOT NULL DEFAULT 66.7,
  current_approval_percentage NUMERIC NOT NULL DEFAULT 0,
  total_votes_cast INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create governance_votes table for tracking votes
CREATE TABLE public.governance_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id),
  vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
  voting_power NUMERIC NOT NULL,
  reasoning TEXT,
  cast_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, voter_id)
);

-- Create key_management_requests table for multi-sig key operations
CREATE TABLE public.key_management_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tokenized_property_id UUID NOT NULL REFERENCES public.tokenized_properties(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('key_rotation', 'escrow_setup', 'multi_sig_update')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  key_data JSONB NOT NULL,
  required_signatures JSONB NOT NULL,
  collected_signatures JSONB DEFAULT '[]',
  execution_deadline TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on governance tables
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_management_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for governance_proposals
CREATE POLICY "Token holders can view proposals for their properties" 
ON public.governance_proposals 
FOR SELECT 
USING (
  tokenized_property_id IN (
    SELECT tokenized_property_id 
    FROM token_holdings 
    WHERE holder_id = auth.uid() AND tokens_owned > 0
  )
);

CREATE POLICY "Token holders can create proposals for their properties" 
ON public.governance_proposals 
FOR INSERT 
WITH CHECK (
  proposed_by = auth.uid() AND
  tokenized_property_id IN (
    SELECT tokenized_property_id 
    FROM token_holdings 
    WHERE holder_id = auth.uid() AND tokens_owned >= 1000
  )
);

-- RLS policies for governance_votes  
CREATE POLICY "Token holders can view votes for their properties" 
ON public.governance_votes 
FOR SELECT 
USING (
  proposal_id IN (
    SELECT id FROM governance_proposals 
    WHERE tokenized_property_id IN (
      SELECT tokenized_property_id 
      FROM token_holdings 
      WHERE holder_id = auth.uid() AND tokens_owned > 0
    )
  )
);

CREATE POLICY "Token holders can vote on their properties" 
ON public.governance_votes 
FOR INSERT 
WITH CHECK (
  voter_id = auth.uid() AND
  proposal_id IN (
    SELECT id FROM governance_proposals 
    WHERE tokenized_property_id IN (
      SELECT tokenized_property_id 
      FROM token_holdings 
      WHERE holder_id = auth.uid() AND tokens_owned > 0
    )
  )
);

-- RLS policies for key_management_requests
CREATE POLICY "Property stakeholders can view key management requests" 
ON public.key_management_requests 
FOR SELECT 
USING (
  tokenized_property_id IN (
    SELECT tokenized_property_id 
    FROM token_holdings 
    WHERE holder_id = auth.uid()
  ) OR
  tokenized_property_id IN (
    SELECT tp.id FROM tokenized_properties tp
    JOIN land_titles lt ON tp.land_title_id = lt.id
    WHERE lt.owner_id = auth.uid()
  )
);

CREATE POLICY "Property owners can create key management requests" 
ON public.key_management_requests 
FOR INSERT 
WITH CHECK (
  requested_by = auth.uid() AND
  tokenized_property_id IN (
    SELECT tp.id FROM tokenized_properties tp
    JOIN land_titles lt ON tp.land_title_id = lt.id
    WHERE lt.owner_id = auth.uid()
  )
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_governance_proposals_updated_at
  BEFORE UPDATE ON public.governance_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_key_management_requests_updated_at
  BEFORE UPDATE ON public.key_management_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_governance_proposals_property_status ON public.governance_proposals(tokenized_property_id, status);
CREATE INDEX idx_governance_votes_proposal ON public.governance_votes(proposal_id);
CREATE INDEX idx_key_management_requests_property ON public.key_management_requests(tokenized_property_id, status);