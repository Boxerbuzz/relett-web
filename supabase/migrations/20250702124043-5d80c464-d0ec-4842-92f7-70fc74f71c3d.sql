-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to expire unpaid bookings every hour
SELECT cron.schedule(
  'expire-unpaid-bookings',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://wossuijahchhtjzphsgh.supabase.co/functions/v1/expire-unpaid-bookings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3N1aWphaGNoaHRqenBoc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjA5NjIsImV4cCI6MjA2MTQ5Njk2Mn0.eLKZrNi8hMUCAqyoHaw5TMaX8muaA7q_Q7HCHzBDSyM"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);