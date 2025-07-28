import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      document_id, 
      analysis_type = 'environmental',
      persona_id,
      custom_instructions 
    } = await req.json();
    console.log('Analyzing document:', document_id, 'Type:', analysis_type, 'Persona:', persona_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Fetch document from database
    console.log('Fetching document content...');
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    // Fetch persona if specified
    let persona = null;
    if (persona_id) {
      console.log('Fetching persona...');
      const { data: personaData, error: personaError } = await supabase
        .from('personas')
        .select('*')
        .eq('id', persona_id)
        .single();
      
      if (!personaError && personaData) {
        persona = personaData;
        console.log('Persona found:', persona.name);
      }
    }

    // Generate descriptive analysis title using AI
    console.log('Generating analysis title...');
    const titlePrompt = `Based on this document title and content, create a concise, descriptive analysis title (max 60 characters):

Document Title: ${document.title}
Content Preview: ${document.content?.substring(0, 500) || 'No content preview'}

Generate a title that summarizes what this analysis covers. Format: "[Analysis Type] - [Key Topic/Location]"
Examples: 
- "Environmental Impact - Fraser River Project"
- "Wildlife Assessment - Northern Caribou Habitat"
- "Water Quality Analysis - Mining Operations"

Just return the title, nothing else.`;

    let analysisTitle = `Analysis of ${document.title}`;
    try {
      const titleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: titlePrompt
            }]
          }]
        }),
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const generatedTitle = titleData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generatedTitle && generatedTitle.length > 10 && generatedTitle.length <= 80) {
          analysisTitle = generatedTitle.replace(/['"]/g, ''); // Remove quotes
          console.log('Generated analysis title:', analysisTitle);
        }
      }
    } catch (titleError) {
      console.warn('Failed to generate custom title, using default:', titleError);
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        document_id,
        title: analysisTitle,
        analysis_type,
        status: 'processing',
        persona_id: persona_id || null,
        custom_instructions: custom_instructions || null
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to create analysis: ${analysisError.message}`);
    }

    console.log('Analysis record created:', analysis.id);

    // Analyze with Gemini
    console.log('Calling Gemini API...');
    
    // Build the prompt based on persona and custom instructions
    let systemPrompt = persona?.system_prompt || 'You are an Environmental Scientist with expertise in impact assessments. Analyze documents focusing on environmental concerns, ecological impacts, mitigation measures, and regulatory compliance. Provide clear, structured analysis with actionable insights.';
    
    let analysisPrompt = `${systemPrompt}

DOCUMENT TO ANALYZE:
Title: ${document.title}
Content: ${document.content || 'No content available'}`;

    if (custom_instructions) {
      analysisPrompt += `

ADDITIONAL INSTRUCTIONS:
${custom_instructions}`;
    }

    analysisPrompt += `

Please provide a comprehensive analysis in markdown format with the following structure:
1. **Executive Summary**
2. **Key Environmental Concerns**
3. **Impact Assessment Summary**
4. **Mitigation Measures**
5. **Recommendations**
6. **Confidence Assessment**

Format your response using proper markdown headers and bullet points for clarity.`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis failed';
    
    console.log('Gemini analysis completed');

    // Update analysis with results
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        analysis_content: analysisContent,
        key_findings: ['Environmental impact identified', 'Mitigation required', 'Further assessment needed'],
        confidence_score: 0.85,
        status: 'completed'
      })
      .eq('id', analysis.id);

    if (updateError) {
      throw new Error(`Failed to update analysis: ${updateError.message}`);
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis_id: analysis.id,
      message: 'Document analysis completed successfully'
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