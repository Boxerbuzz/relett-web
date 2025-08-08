-- Add new status values to the tokenization_status enum
ALTER TYPE tokenization_status ADD VALUE IF NOT EXISTS 'token_created';
ALTER TYPE tokenization_status ADD VALUE IF NOT EXISTS 'sale_active';
ALTER TYPE tokenization_status ADD VALUE IF NOT EXISTS 'sale_ended';