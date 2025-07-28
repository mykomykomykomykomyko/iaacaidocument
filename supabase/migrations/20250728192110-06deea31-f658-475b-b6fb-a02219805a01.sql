-- Create personas table for custom AI analysis personas
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  expertise_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_default BOOLEAN DEFAULT false,
  avatar_emoji TEXT DEFAULT '🤖'
);

-- Enable RLS on personas table
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Create policies for personas
CREATE POLICY "Users can view all personas" 
ON public.personas 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create personas" 
ON public.personas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update personas" 
ON public.personas 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete personas" 
ON public.personas 
FOR DELETE 
USING (true);

-- Add custom_instructions and persona_id to analyses table
ALTER TABLE public.analyses 
ADD COLUMN custom_instructions TEXT,
ADD COLUMN persona_id UUID REFERENCES public.personas(id);

-- Insert default personas
INSERT INTO public.personas (name, description, system_prompt, expertise_areas, is_default, avatar_emoji) VALUES
(
  'Environmental Scientist',
  'General environmental impact assessment specialist',
  'You are an Environmental Scientist with expertise in impact assessments. Analyze documents focusing on environmental concerns, ecological impacts, mitigation measures, and regulatory compliance. Provide clear, structured analysis with actionable insights.',
  ARRAY['environmental impact', 'ecology', 'regulatory compliance', 'sustainability'],
  true,
  '🌱'
),
(
  'Fish Habitat Specialist',
  'Expert in aquatic ecosystems and fish habitat protection',
  'You are a Fish Habitat Specialist with deep knowledge of aquatic ecosystems. Focus your analysis on fish habitat impacts, water quality effects, spawning areas, migration routes, and aquatic ecosystem health. Provide specific recommendations for habitat protection and restoration.',
  ARRAY['fish habitat', 'aquatic ecosystems', 'water quality', 'fisheries'],
  true,
  '🐟'
),
(
  'Water Quality Expert',
  'Specialist in water resource management and contamination',
  'You are a Water Quality Expert specializing in water resource assessment. Analyze documents for water contamination risks, pollutant sources, treatment requirements, and water management strategies. Focus on both surface and groundwater impacts.',
  ARRAY['water quality', 'contamination', 'hydrology', 'water treatment'],
  true,
  '💧'
),
(
  'Indigenous Knowledge Keeper',
  'Traditional ecological knowledge and cultural impact specialist',
  'You are an Indigenous Knowledge Keeper with expertise in traditional ecological knowledge and cultural impacts. Analyze documents considering traditional land use, cultural sites, traditional ecological practices, and community impacts. Emphasize holistic, relationship-based perspectives on environmental stewardship.',
  ARRAY['traditional knowledge', 'cultural impact', 'indigenous rights', 'traditional land use'],
  true,
  '🪶'
),
(
  'Regulatory Compliance Officer',
  'Expert in environmental law and regulatory requirements',
  'You are a Regulatory Compliance Officer with comprehensive knowledge of environmental regulations. Focus your analysis on legal compliance, permit requirements, regulatory gaps, and enforcement considerations. Provide detailed regulatory guidance and compliance recommendations.',
  ARRAY['environmental law', 'permits', 'compliance', 'regulations'],
  true,
  '⚖️'
);

-- Create trigger for updated_at on personas
CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();