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
    const { query, persona = 'general', document_ids = [] } = await req.json();

    console.log(`Performing semantic search for: "${query}" with persona: ${persona}`);

    // Get all documents or filter by document_ids
    let documentsQuery = supabase
      .from('documents')
      .select('id, title, extracted_text, file_type, upload_date');

    if (document_ids.length > 0) {
      documentsQuery = documentsQuery.in('id', document_ids);
    }

    const { data: documents, error: docsError } = await documentsQuery;

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        results: [],
        message: 'No documents found to search'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare search context
    const searchContext = documents.map(doc => `
Document ID: ${doc.id}
Title: ${doc.title}
Type: ${doc.file_type}
Content: ${doc.extracted_text?.substring(0, 3000) || 'No content available'}
---`).join('\n');

    const personaPrompts = {
      'fish-habitat': 'Focus on fish habitat, aquatic ecosystems, spawning areas, and water quality impacts.',
      'water-quality': 'Focus on water parameters, pollution, treatment methods, and monitoring requirements.',
      'caribou-biologist': 'Focus on caribou migration, calving grounds, habitat impacts, and population dynamics.',
      'indigenous-knowledge': 'Focus on traditional knowledge, cultural sites, community impacts, and indigenous rights.',
      'general': 'Provide comprehensive environmental analysis across all relevant domains.'
    };

    const selectedPersonaPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.general;

    // Perform semantic search with Claude
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
            content: `You are an AI assistant performing semantic search on environmental documents. ${selectedPersonaPrompt}

User Query: "${query}"

Documents to search:
${searchContext}

Please analyze these documents and return the most relevant information to answer the user's query. For each relevant finding:

1. Identify which document(s) contain relevant information
2. Extract specific relevant passages or data
3. Explain the relevance to the query
4. Provide a confidence score (0-100)

Return your response in this JSON format:
{
  "results": [
    {
      "document_id": "uuid",
      "document_title": "title",
      "relevant_passages": ["passage1", "passage2"],
      "explanation": "why this is relevant",
      "confidence_score": 85
    }
  ],
  "summary": "Overall summary of findings",
  "total_documents_searched": number
}

Focus on accuracy and relevance. If no relevant information is found, return empty results.`
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const claudeData = await response.json();
    let searchResults;

    try {
      // Extract JSON from Claude's response
      const responseText = claudeData.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        searchResults = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured results from text
        searchResults = {
          results: [],
          summary: responseText,
          total_documents_searched: documents.length
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      searchResults = {
        results: [],
        summary: claudeData.content[0].text,
        total_documents_searched: documents.length
      };
    }

    // Save search results to database
    for (const result of searchResults.results || []) {
      try {
        await supabase
          .from('search_results')
          .insert({
            query,
            document_id: result.document_id,
            relevance_score: result.confidence_score || 50,
            matched_content: result.relevant_passages?.join('\n') || '',
            persona
          });
      } catch (insertError) {
        console.error('Failed to save search result:', insertError);
      }
    }

    console.log(`Search completed. Found ${searchResults.results?.length || 0} relevant results.`);

    return new Response(JSON.stringify({
      success: true,
      ...searchResults,
      query,
      persona
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in semantic-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});