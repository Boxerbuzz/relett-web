-- Add status field to token_holdings to track commitment vs distribution
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'token_holdings' AND column_name = 'status') THEN
        ALTER TABLE public.token_holdings ADD COLUMN status text DEFAULT 'active';
        
        -- Add constraint to ensure valid status values
        ALTER TABLE public.token_holdings ADD CONSTRAINT token_holdings_status_check 
        CHECK (status IN ('committed', 'distributed', 'active'));
    END IF;
END $$;

-- Update existing records to have 'distributed' status (they were already distributed)
UPDATE public.token_holdings SET status = 'distributed' WHERE status = 'active';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_token_holdings_status ON public.token_holdings(status);
CREATE INDEX IF NOT EXISTS idx_investment_groups_closes_at ON public.investment_groups(closes_at);

-- Update investment_groups to ensure it has proper fields for sales windows
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investment_groups' AND column_name = 'tokenized_property_id') THEN
        ALTER TABLE public.investment_groups ADD COLUMN tokenized_property_id uuid REFERENCES public.tokenized_properties(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investment_groups' AND column_name = 'closes_at') THEN
        ALTER TABLE public.investment_groups ADD COLUMN closes_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investment_groups' AND column_name = 'status') THEN
        ALTER TABLE public.investment_groups ADD COLUMN status text DEFAULT 'active';
        
        ALTER TABLE public.investment_groups ADD CONSTRAINT investment_groups_status_check 
        CHECK (status IN ('active', 'closed', 'draft'));
    END IF;
END $$;