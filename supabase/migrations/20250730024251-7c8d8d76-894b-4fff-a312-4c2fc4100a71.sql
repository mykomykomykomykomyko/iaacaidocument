-- Add page_references column to analyses table to store page citations
ALTER TABLE public.analyses 
ADD COLUMN page_references JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.analyses.page_references IS 'Array of page reference objects: [{"page": 1, "text": "Environmental impact on page 1", "context": "brief context"}]';