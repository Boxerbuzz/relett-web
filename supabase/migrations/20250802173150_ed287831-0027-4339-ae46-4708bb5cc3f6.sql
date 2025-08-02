-- Create legal agreements tracking table
CREATE TABLE public.legal_agreements (
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
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own legal agreements"
ON public.legal_agreements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legal agreements"
ON public.legal_agreements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create legal framework versions table
CREATE TABLE public.legal_framework_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  framework_type TEXT NOT NULL CHECK (framework_type IN ('tokenization', 'investment')),
  content JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.legal_framework_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active legal framework versions"
ON public.legal_framework_versions
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage legal framework versions"
ON public.legal_framework_versions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role 
  AND is_active = true
));

-- Add indexes for performance
CREATE INDEX idx_legal_agreements_user_type ON public.legal_agreements(user_id, agreement_type);
CREATE INDEX idx_legal_agreements_property ON public.legal_agreements(property_id);
CREATE INDEX idx_legal_agreements_tokenized_property ON public.legal_agreements(tokenized_property_id);
CREATE INDEX idx_legal_framework_versions_type_active ON public.legal_framework_versions(framework_type, is_active);