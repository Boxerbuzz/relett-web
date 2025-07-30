-- Create marketplace_listings table for token trading
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tokenized_property_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  seller_account_id TEXT NOT NULL,
  buyer_id UUID,
  buyer_account_id TEXT,
  token_amount INTEGER NOT NULL,
  price_per_token NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.marketplace_listings 
ADD CONSTRAINT marketplace_listings_tokenized_property_id_fkey 
FOREIGN KEY (tokenized_property_id) REFERENCES public.tokenized_properties(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_listings
CREATE POLICY "Users can view active marketplace listings" 
ON public.marketplace_listings 
FOR SELECT 
USING (status = 'active' OR seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create their own listings" 
ON public.marketplace_listings 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" 
ON public.marketplace_listings 
FOR UPDATE 
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_tokenized_property ON public.marketplace_listings(tokenized_property_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();