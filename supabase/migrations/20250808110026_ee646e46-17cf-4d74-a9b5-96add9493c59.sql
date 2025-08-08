-- 1) Add property_id to hcs_topics and ensure one topic per property
ALTER TABLE public.hcs_topics
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- Unique topic per property (nullable allowed)
CREATE UNIQUE INDEX IF NOT EXISTS hcs_topics_unique_property_id
ON public.hcs_topics(property_id)
WHERE property_id IS NOT NULL;

-- Helpful index for topic_id lookups
CREATE INDEX IF NOT EXISTS hcs_topics_topic_id_idx
ON public.hcs_topics(topic_id);

-- 2) Harden trigger to remove hard-coded service key and reuse configured service role key
CREATE OR REPLACE FUNCTION public.trigger_hedera_token_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger if status changed to 'approved'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
    PERFORM net.http_post(
      url := 'https://wossuijahchhtjzphsgh.supabase.co/functions/v1/create-hcs-topic-and-token',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'tokenizedPropertyId', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;