-- Add buyout-specific poll types to investment_polls
ALTER TYPE poll_type_enum ADD VALUE IF NOT EXISTS 'buyout_proposal';
ALTER TYPE poll_type_enum ADD VALUE IF NOT EXISTS 'forced_sale';

-- If the enum doesn't exist, create it first
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poll_type_enum') THEN
        CREATE TYPE poll_type_enum AS ENUM ('simple', 'buyout_proposal', 'forced_sale');
        
        -- Update the poll_type column to use the enum
        ALTER TABLE investment_polls 
        ALTER COLUMN poll_type TYPE poll_type_enum 
        USING poll_type::poll_type_enum;
    END IF;
END $$;

-- Add buyout-specific columns to investment_polls
ALTER TABLE investment_polls 
ADD COLUMN IF NOT EXISTS buyout_price NUMERIC,
ADD COLUMN IF NOT EXISTS min_buyout_percentage NUMERIC DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS buyout_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_buyout_votes NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_execute_on_success BOOLEAN DEFAULT true;