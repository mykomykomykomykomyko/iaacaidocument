-- Create documents table for storing uploaded files
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  extracted_text TEXT,
  metadata JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analyses table for storing AI analysis results
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL DEFAULT 'comprehensive',
  persona TEXT NOT NULL DEFAULT 'general',
  analysis_content TEXT NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  key_findings TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_results table for storing search history
CREATE TABLE public.search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  matched_content TEXT,
  persona TEXT NOT NULL DEFAULT 'general',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personas table for AI specialist definitions (optional - we use hardcoded ones in functions)
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for analyses
CREATE POLICY "Users can view their own analyses" 
ON public.analyses 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own analyses" 
ON public.analyses 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for search_results
CREATE POLICY "Users can view their own search results" 
ON public.search_results 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create search results" 
ON public.search_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for personas (public read)
CREATE POLICY "Personas are viewable by everyone" 
ON public.personas 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_processing_status ON public.documents(processing_status);

CREATE INDEX idx_analyses_document_id ON public.analyses(document_id);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_analyses_persona ON public.analyses(persona);

CREATE INDEX idx_search_results_document_id ON public.search_results(document_id);
CREATE INDEX idx_search_results_user_id ON public.search_results(user_id);
CREATE INDEX idx_search_results_created_at ON public.search_results(created_at DESC);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at
BEFORE UPDATE ON public.analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default personas
INSERT INTO public.personas (name, specialization, prompt_template) VALUES
('Fish Habitat Specialist', 'Aquatic Ecosystems', 'You are a fish habitat specialist analyzing environmental impact documents. Focus on aquatic ecosystems, fish populations, spawning areas, migration routes, water quality impacts on fish, and habitat restoration measures.'),
('Water Quality Expert', 'Water Systems', 'You are a water quality expert analyzing environmental documents. Focus on chemical parameters, pollution sources, treatment methods, monitoring requirements, and regulatory compliance for water systems.'),
('Caribou Biologist', 'Wildlife Biology', 'You are a caribou biologist analyzing environmental impact documents. Focus on caribou migration patterns, calving grounds, predator-prey relationships, habitat disruption, and population dynamics.'),
('Indigenous Knowledge Keeper', 'Traditional Knowledge', 'You are an Indigenous knowledge keeper analyzing environmental documents. Focus on traditional ecological knowledge, cultural sites, traditional land use, community impacts, and indigenous rights and consultation.'),
('Environmental Analyst', 'General Analysis', 'You are a general environmental analyst. Provide comprehensive analysis covering all environmental aspects including ecological, social, and regulatory considerations.');