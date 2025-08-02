-- Create tokenization legal agreements table
CREATE TABLE public.tokenization_legal_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('tokenization', 'investment')),
  version TEXT NOT NULL,
  property_id UUID REFERENCES properties(id),
  tokenized_property_id UUID REFERENCES tokenized_properties(id),
  agreed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reading_time_seconds INTEGER NOT NULL DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  sections_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.tokenization_legal_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tokenization legal agreements"
ON public.tokenization_legal_agreements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokenization legal agreements"
ON public.tokenization_legal_agreements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_tokenization_legal_agreements_user_type ON public.tokenization_legal_agreements(user_id, agreement_type);