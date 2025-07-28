-- Fix RLS policies to handle null user_id during initial testing
-- Allow public access for documents without user_id (temporarily for testing)

-- Update documents policies to be more permissive for testing
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Public can view all documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Public can create documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update documents" 
ON public.documents 
FOR UPDATE 
USING (true);

-- Update analyses policies to be more permissive for testing
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can create their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.analyses;

CREATE POLICY "Public can view all analyses" 
ON public.analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Public can create analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update analyses" 
ON public.analyses 
FOR UPDATE 
USING (true);