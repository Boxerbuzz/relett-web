-- Add sale date columns to tokenized_properties table
ALTER TABLE public.tokenized_properties 
ADD COLUMN sale_start_date timestamp with time zone,
ADD COLUMN sale_end_date timestamp with time zone;