-- Add file_path column to property_documents table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'property_documents' 
                   AND column_name = 'file_path') THEN
        ALTER TABLE property_documents ADD COLUMN file_path TEXT;
    END IF;
END $$;