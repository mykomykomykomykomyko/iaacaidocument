import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Analyze Document Function Called ===');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));
    
    const { document_id, analysis_type = 'environmental' } = requestBody;

    console.log(`Starting analysis for document ${document_id} with type ${analysis_type}`);

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!document_id) {
      console.error('No document_id provided');
      return new Response(JSON.stringify({ 
        error: 'document_id is required',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get document content from database
    console.log('Fetching document from database...');
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError) {
      console.error('Database error fetching document:', docError);
      return new Response(JSON.stringify({ 
        error: `Database error: ${docError.message}`,
        success: false 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!document) {
      console.error('Document not found with ID:', document_id);
      return new Response(JSON.stringify({ 
        error: `Document not found with ID: ${document_id}`,
        success: false 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Document found:', document.title);

    const documentTitle = document.title || document.original_filename;
    console.log(`Analyzing document: ${documentTitle}`);
    console.log(`Text length: ${document.content?.length || 0} characters`);

    // Create analysis prompt
    const analysisPrompt = `Please analyze this environmental document and provide a comprehensive assessment:

Document Title: ${documentTitle}
Document Type: ${document.mime_type}
File Size: ${document.file_size ? Math.round(document.file_size / 1024) : 'unknown'} KB

Content to analyze:
${document.content || 'No text content available for analysis.'}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Environmental Findings (3-5 main points as bullet points)
3. Potential Environmental Impacts (specific impacts with severity)
4. Recommendations (actionable next steps)
5. Compliance and regulatory considerations

Format your response clearly with headers and bullet points for easy parsing.`;

    // Analyze document with OpenAI
    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert environmental analyst working for the Impact Assessment Agency of Canada. Provide detailed, actionable environmental assessments.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} ${response.statusText}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await response.json();
    const analysisContent = openaiData.choices[0].message.content;

    console.log('Analysis completed, saving to database...');

    // Generate confidence score based on content available
    const textLength = document.content?.length || 0;
    const confidence_score = Math.min(0.95, Math.max(0.60, 
      0.70 + (textLength > 1000 ? 0.15 : 0) + (textLength > 5000 ? 0.10 : 0)
    ));

    // Extract structured information
    const keyFindings = extractKeyFindings(analysisContent);
    const recommendations = extractRecommendations(analysisContent);

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id,
        user_id: document.user_id, // Use the document's user_id (can be null for testing)
        title: `Environmental Analysis: ${documentTitle}`,
        analysis_content: analysisContent,
        key_findings: keyFindings,
        recommendations: recommendations,
        confidence_score,
        analysis_type,
        persona: 'environmental_scientist',
        status: 'completed'
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
    console.error('=== ANALYZE DOCUMENT ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return new Response(JSON.stringify({ 
      error: `Analysis failed: ${error.message}`,
      success: false,
      details: error.stack
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
    
    if (line.toLowerCase().includes('key') && line.toLowerCase().includes('finding')) {
      inFindingsSection = true;
      continue;
    }
    
    if (inFindingsSection && line.toLowerCase().includes('impact') && line.includes(':')) {
      break;
    }
    
    if (inFindingsSection && (line.match(/^\d+\./) || line.match(/^[\-\*•]/))) {
      const finding = line.replace(/^\d+\./, '').replace(/^[\-\*•]/, '').trim();
      if (finding.length > 20) {
        findings.push(finding);
      }
    }
  }
  
  return findings.slice(0, 5);
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');
  
  let inRecommendationsSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.toLowerCase().includes('recommendation')) {
      inRecommendationsSection = true;
      continue;
    }
    
    if (inRecommendationsSection && line.toLowerCase().includes('compliance') && line.includes(':')) {
      break;
    }
    
    if (inRecommendationsSection && (line.match(/^\d+\./) || line.match(/^[\-\*•]/))) {
      const rec = line.replace(/^\d+\./, '').replace(/^[\-\*•]/, '').trim();
      if (rec.length > 20) {
        recommendations.push(rec);
      }
    }
  }
  
  return recommendations.slice(0, 5);
}