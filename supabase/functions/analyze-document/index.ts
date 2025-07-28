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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, persona = 'general', analysis_type = 'comprehensive' } = await req.json();

    console.log(`Starting analysis for document ${document_id} with persona ${persona}`);

    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'ANTHROPIC_API_KEY not configured',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get document content from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      console.error('Document not found:', docError?.message);
      return new Response(JSON.stringify({ 
        error: `Document not found: ${docError?.message}`,
        success: false 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing document: ${document.title}`);
    console.log(`Text length: ${document.extracted_text?.length || 0} characters`);

    // Create analysis prompt
    const analysisPrompt = `Please analyze this environmental document and provide a comprehensive summary:

Document Title: ${document.title}
Document Type: ${document.file_type}
File Size: ${document.file_size ? Math.round(document.file_size / 1024) : 'unknown'} KB

Content to analyze:
${document.extracted_text || 'No text content available for analysis.'}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Environmental Findings (3-5 main points)
3. Potential Environmental Impacts
4. Recommendations for next steps
5. Compliance and regulatory considerations

Focus on actionable insights and specific environmental concerns.`;

    // Analyze document with Claude
    console.log('Calling Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
      return new Response(JSON.stringify({ 
        error: `Anthropic API error: ${response.status} ${response.statusText}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const claudeData = await response.json();
    const analysis_content = claudeData.content[0].text;

    console.log('Analysis completed, saving to database...');

    // Generate confidence score based on content available
    const textLength = document.extracted_text?.length || 0;
    const confidence_score = Math.min(95, Math.max(60, 
      70 + (textLength > 1000 ? 15 : 0) + (textLength > 5000 ? 10 : 0)
    ));

    // Extract key findings and recommendations
    const key_findings = extractKeyFindings(analysis_content);
    const recommendations = extractRecommendations(analysis_content);

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id,
        user_id: null, // Allow anonymous analyses
        persona_id: crypto.randomUUID(), // Generate a persona ID
        title: `Analysis: ${document.title}`,
        topic: 'Environmental Assessment',
        analysis_type,
        persona,
        status: 'completed',
        analysis_content,
        confidence_score,
        key_findings,
        recommendations,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Failed to save analysis:', analysisError);
      return new Response(JSON.stringify({ 
        error: `Failed to save analysis: ${analysisError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analysis completed and saved with ID: ${analysis.id}`);

    return new Response(JSON.stringify({
      success: true,
      analysis,
      message: 'Analysis completed successfully'
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
  
  let inFindingsSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're in the key findings section
    if (line.toLowerCase().includes('key') && line.toLowerCase().includes('finding')) {
      inFindingsSection = true;
      continue;
    }
    
    // Stop if we hit another section
    if (inFindingsSection && line.toLowerCase().includes('impact') && line.includes(':')) {
      break;
    }
    
    // Extract numbered or bulleted items
    if (inFindingsSection && (line.match(/^\d+\./) || line.match(/^[\-\*•]/))) {
      const finding = line.replace(/^\d+\./, '').replace(/^[\-\*•]/, '').trim();
      if (finding.length > 20) {
        findings.push(finding);
      }
    }
  }
  
  return findings.slice(0, 5); // Return top 5 findings
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');
  
  let inRecommendationsSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're in the recommendations section
    if (line.toLowerCase().includes('recommendation')) {
      inRecommendationsSection = true;
      continue;
    }
    
    // Stop if we hit another section
    if (inRecommendationsSection && line.toLowerCase().includes('compliance') && line.includes(':')) {
      break;
    }
    
    // Extract numbered or bulleted items
    if (inRecommendationsSection && (line.match(/^\d+\./) || line.match(/^[\-\*•]/))) {
      const rec = line.replace(/^\d+\./, '').replace(/^[\-\*•]/, '').trim();
      if (rec.length > 20) {
        recommendations.push(rec);
      }
    }
  }
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}