import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_PERSONAS = {
  'fish-habitat': {
    name: 'Fish Habitat Specialist',
    prompt: 'You are a fish habitat specialist analyzing environmental impact documents. Focus on aquatic ecosystems, fish populations, spawning areas, migration routes, water quality impacts on fish, and habitat restoration measures.'
  },
  'water-quality': {
    name: 'Water Quality Expert', 
    prompt: 'You are a water quality expert analyzing environmental documents. Focus on chemical parameters, pollution sources, treatment methods, monitoring requirements, and regulatory compliance for water systems.'
  },
  'caribou-biologist': {
    name: 'Caribou Biologist',
    prompt: 'You are a caribou biologist analyzing environmental impact documents. Focus on caribou migration patterns, calving grounds, predator-prey relationships, habitat disruption, and population dynamics.'
  },
  'indigenous-knowledge': {
    name: 'Indigenous Knowledge Keeper',
    prompt: 'You are an Indigenous knowledge keeper analyzing environmental documents. Focus on traditional ecological knowledge, cultural sites, traditional land use, community impacts, and indigenous rights and consultation.'
  },
  'general': {
    name: 'Environmental Analyst',
    prompt: 'You are a general environmental analyst. Provide comprehensive analysis covering all environmental aspects including ecological, social, and regulatory considerations.'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, persona = 'general', analysis_type = 'comprehensive' } = await req.json();

    console.log(`Starting analysis for document ${document_id} with persona ${persona}`);

    // Get document content from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    const selectedPersona = AI_PERSONAS[persona as keyof typeof AI_PERSONAS] || AI_PERSONAS.general;

    // Analyze document with Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `${selectedPersona.prompt}

Please analyze this environmental document and provide a detailed analysis focusing on your area of expertise:

Document Title: ${document.title}
Document Type: ${document.file_type}
Content: ${document.extracted_text || 'No extracted text available'}

Please provide:
1. Key findings relevant to your specialty
2. Potential impacts and concerns
3. Recommendations for mitigation
4. Compliance considerations
5. Areas requiring further investigation

Focus on actionable insights and specific recommendations.`
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const claudeData = await response.json();
    const analysis_content = claudeData.content[0].text;

    // Generate confidence score based on content length and quality indicators
    const confidence_score = Math.min(95, Math.max(65, 
      75 + (analysis_content.length > 2000 ? 15 : 0) + 
      (document.extracted_text?.length > 10000 ? 10 : 0)
    ));

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id,
        user_id: null, // Allow anonymous analyses
        persona_id: crypto.randomUUID(), // Generate a persona ID
        title: document.title || 'Environmental Analysis',
        topic: 'Environmental Assessment',
        analysis_type,
        persona,
        status: 'completed',
        analysis_content,
        confidence_score,
        key_findings: extractKeyFindings(analysis_content),
        recommendations: extractRecommendations(analysis_content),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to save analysis: ${analysisError.message}`);
    }

    console.log(`Analysis completed for document ${document_id}`);

    return new Response(JSON.stringify({
      success: true,
      analysis,
      persona: selectedPersona.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractKeyFindings(content: string): string[] {
  const findings: string[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^\d+\.|^[\-\*]/)) {
      const finding = line.replace(/^\d+\./, '').replace(/^[\-\*]/, '').trim();
      if (finding.length > 20) {
        findings.push(finding);
      }
    }
  }
  
  return findings.slice(0, 5); // Return top 5 findings
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const sections = content.toLowerCase().split(/recommendations?|suggested actions?|mitigation measures?/);
  
  if (sections.length > 1) {
    const recSection = sections[1];
    const lines = recSection.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\.|^[\-\*]/) && trimmed.length > 30) {
        const rec = trimmed.replace(/^\d+\./, '').replace(/^[\-\*]/, '').trim();
        recommendations.push(rec);
      }
    }
  }
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}