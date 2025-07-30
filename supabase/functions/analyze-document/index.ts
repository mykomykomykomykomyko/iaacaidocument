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
      document_ids, // New: for bulk analysis
      analysis_type = 'environmental',
      persona_id,
      custom_instructions 
    } = await req.json();
    
    // Handle both single and bulk analysis
    const isBulkAnalysis = document_ids && Array.isArray(document_ids) && document_ids.length > 1;
    console.log(isBulkAnalysis ? 
      `Bulk analyzing ${document_ids.length} documents: ${document_ids.join(', ')}` : 
      `Analyzing document: ${document_id}`, 
      'Type:', analysis_type, 'Persona:', persona_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Fetch document(s) from database
    let documents = [];
    let combinedContent = '';
    let combinedTitle = '';
    
    if (isBulkAnalysis) {
      console.log('Fetching multiple documents for bulk analysis...');
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .in('id', document_ids);
      
      if (docsError || !docs || docs.length === 0) {
        throw new Error(`Documents not found: ${docsError?.message}`);
      }
      
      documents = docs;
      combinedTitle = `Bulk Analysis of ${docs.length} Documents`;
      combinedContent = docs.map(doc => 
        `=== DOCUMENT: ${doc.title} ===\n${doc.content || 'No content available'}\n\n`
      ).join('');
    } else {
      console.log('Fetching single document...');
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', document_id)
        .single();

      if (docError || !document) {
        throw new Error(`Document not found: ${docError?.message}`);
      }
      
      documents = [document];
      combinedTitle = document.title;
      combinedContent = document.content || 'No content available';
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
    const titlePrompt = `Based on ${isBulkAnalysis ? 'these documents' : 'this document'}, create a concise, descriptive analysis title (max 60 characters):

${isBulkAnalysis ? 
  `Bulk Analysis of ${documents.length} Documents:\n${documents.map(d => `- ${d.title}`).join('\n')}\n\nCombined Content Preview: ${combinedContent.substring(0, 500)}` :
  `Document Title: ${combinedTitle}\nContent Preview: ${combinedContent.substring(0, 500)}`
}

Generate a title that summarizes what this analysis covers. Format: "[Analysis Type] - [Key Topic/Focus]"
Examples: 
- "Environmental Impact - Fraser River Project"
- "Bulk Assessment - Mining Operations Review"
- "Combined Analysis - Wildlife & Water Quality"

Just return the title, nothing else.`;

    let analysisTitle = isBulkAnalysis ? combinedTitle : `Analysis of ${combinedTitle}`;
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
        document_id: isBulkAnalysis ? document_ids[0] : document_id, // Use first document as primary reference
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

${isBulkAnalysis ? 
  `DOCUMENTS TO ANALYZE (BULK ANALYSIS):
${combinedContent}

Please analyze ALL the documents above as a comprehensive set. Look for patterns, commonalities, conflicts, and overall themes across all documents.` :
  `DOCUMENT TO ANALYZE:
Title: ${combinedTitle}
Content: ${combinedContent}`
}`;

    if (custom_instructions) {
      analysisPrompt += `

ADDITIONAL INSTRUCTIONS:
${custom_instructions}`;
    }

    analysisPrompt += `
 
Please provide a comprehensive analysis in markdown format with the following structure:
1. **Executive Summary**
${isBulkAnalysis ? 
  `2. **Document Overview** - Brief summary of each document analyzed
3. **Cross-Document Patterns** - Common themes and conflicts
4. **Combined Environmental Concerns**
5. **Integrated Impact Assessment**
6. **Consolidated Recommendations**` :
  `2. **Key Environmental Concerns**
3. **Impact Assessment Summary**
4. **Mitigation Measures**
5. **Recommendations**`
}
7. **Confidence Assessment** - Rate your confidence in this analysis from 0-100%

IMPORTANT: Throughout your analysis, when referencing specific information, include page citations in this format: [Page X] where X is the page number. For example: "The environmental impact assessment indicates significant concerns [Page 5]" or "Mitigation measures are outlined [Page 12]".

At the end of your analysis, provide:

CONFIDENCE_SCORE: [0-100]
KEY_FINDINGS: [Finding 1], [Finding 2], [Finding 3]
PAGE_REFERENCES: [{"page": 1, "text": "Brief description of what's on this page"}, {"page": 5, "text": "Environmental concerns identified"}, {"page": 12, "text": "Mitigation measures outlined"}]

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

    // Extract confidence score, key findings, and page references from the analysis
    let confidenceScore = 0.75; // Default fallback
    let keyFindings = ['Analysis completed', 'Review required'];
    let pageReferences: Array<{page: number, text: string}> = [];
    
    try {
      // Extract confidence score
      const confidenceMatch = analysisContent.match(/CONFIDENCE_SCORE:\s*(\d+)/i);
      if (confidenceMatch) {
        confidenceScore = Math.min(100, Math.max(0, parseInt(confidenceMatch[1]))) / 100;
      }
      
      // Extract key findings
      const findingsMatch = analysisContent.match(/KEY_FINDINGS:\s*(.+)/i);
      if (findingsMatch) {
        keyFindings = findingsMatch[1]
          .split(',')
          .map(finding => finding.trim())
          .filter(finding => finding.length > 0)
          .slice(0, 5); // Limit to 5 findings
      }

      // Extract page references
      const pageReferencesMatch = analysisContent.match(/PAGE_REFERENCES:\s*(\[.+?\])/i);
      if (pageReferencesMatch) {
        try {
          pageReferences = JSON.parse(pageReferencesMatch[1]);
          // Validate the structure
          pageReferences = pageReferences.filter(ref => 
            ref && typeof ref.page === 'number' && typeof ref.text === 'string'
          );
        } catch (parseError) {
          console.warn('Failed to parse page references JSON:', parseError);
        }
      }
    } catch (extractionError) {
      console.warn('Failed to extract metadata from analysis:', extractionError);
    }

    // Clean up the analysis content by removing the metadata lines
    const cleanAnalysisContent = analysisContent
      .replace(/CONFIDENCE_SCORE:\s*\d+/gi, '')
      .replace(/KEY_FINDINGS:\s*.+/gi, '')
      .replace(/PAGE_REFERENCES:\s*\[.+?\]/gi, '')
      .trim();

    // Update analysis with results
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        analysis_content: cleanAnalysisContent,
        key_findings: keyFindings,
        confidence_score: confidenceScore,
        page_references: pageReferences,
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