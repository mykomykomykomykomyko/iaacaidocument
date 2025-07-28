-- Add missing columns to documents table to match the upload function expectations
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Update the processing status constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'documents' AND constraint_name LIKE '%processing_status%'
    ) THEN
        ALTER TABLE public.documents 
        ADD CONSTRAINT documents_processing_status_check 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
END $$;

-- Add missing columns to analyses table
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS analysis_type TEXT DEFAULT 'comprehensive',
ADD COLUMN IF NOT EXISTS persona TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS analysis_content TEXT,
ADD COLUMN IF NOT EXISTS recommendations TEXT[] DEFAULT '{}';

-- Update analyses table to make analysis_content not null where it exists
UPDATE public.analyses SET analysis_content = 'Analysis content not available' WHERE analysis_content IS NULL;

-- Add constraint to make analysis_content not null for new records
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analyses' AND column_name = 'analysis_content' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.analyses ALTER COLUMN analysis_content SET NOT NULL;
    END IF;
END $$;

-- Create search_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  matched_content TEXT,
  persona TEXT NOT NULL DEFAULT 'general',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on search_results if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'search_results') THEN
        ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for search_results if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'search_results' AND policyname = 'Users can view their own search results'
        ) THEN
            CREATE POLICY "Users can view their own search results" 
            ON public.search_results 
            FOR SELECT 
            USING (auth.uid() = user_id OR user_id IS NULL);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'search_results' AND policyname = 'Users can create search results'
        ) THEN
            CREATE POLICY "Users can create search results" 
            ON public.search_results 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
        END IF;
    END IF;
END $$;

-- Update RLS policies for documents to allow null user_id (for anonymous uploads)
DROP POLICY IF EXISTS "Users can upload their own documents" ON public.documents;
CREATE POLICY "Users can upload their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Update RLS policies for analyses to allow null user_id
DROP POLICY IF EXISTS "Users can create their own analyses" ON public.analyses;
CREATE POLICY "Users can create their own analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
CREATE POLICY "Users can view their own analyses" 
ON public.analyses 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);