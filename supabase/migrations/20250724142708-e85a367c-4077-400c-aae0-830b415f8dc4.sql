-- Add buyout-specific columns to investment_polls
ALTER TABLE investment_polls 
ADD COLUMN IF NOT EXISTS buyout_price NUMERIC,
ADD COLUMN IF NOT EXISTS min_buyout_percentage NUMERIC DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS buyout_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_buyout_votes NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_execute_on_success BOOLEAN DEFAULT true;