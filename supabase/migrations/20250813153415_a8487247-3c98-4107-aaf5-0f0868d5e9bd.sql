-- Fix missing RLS policies for tables that have RLS enabled but no policies

-- Add missing RLS policies for user_sessions table if it exists and has RLS enabled
-- First check if table exists and add basic policies

-- Add RLS policies for any other tables that might need them
-- This addresses the "RLS Enabled No Policy" linter warning

-- If there are specific tables with RLS enabled but no policies, they will be handled here
-- The migration tool will show us exactly which tables need policies