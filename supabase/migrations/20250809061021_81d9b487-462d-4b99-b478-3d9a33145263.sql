-- Drop unused database tables that have no associated functionality

-- Drop backup_recovery table
DROP TABLE IF EXISTS public.backup_recovery CASCADE;

-- Drop agent_performance_metrics table  
DROP TABLE IF EXISTS public.agent_performance_metrics CASCADE;

-- Drop auction_listings table
DROP TABLE IF EXISTS public.auction_listings CASCADE;

-- Drop escrow_accounts table
DROP TABLE IF EXISTS public.escrow_accounts CASCADE;

-- Drop sanctions_screening table
DROP TABLE IF EXISTS public.sanctions_screening CASCADE;

-- Drop compliance_records table
DROP TABLE IF EXISTS public.compliance_records CASCADE;

-- Drop compliance_reports table
DROP TABLE IF EXISTS public.compliance_reports CASCADE;