-- Add blockchain_transaction_id column to properties table
ALTER TABLE public.properties 
ADD COLUMN blockchain_transaction_id TEXT;