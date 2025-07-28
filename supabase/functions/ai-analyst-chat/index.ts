import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, persona_id, conversationHistory = [] } = await req.json();
    console.log('AI Analyst Chat request:', { message, persona_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API keys
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Fetch persona from database if specified
    let selectedPersona = null;
    let systemPrompt = 'You are an Environmental Analyst with expertise in impact assessments, environmental regulations, and sustainability practices.';
    
    if (persona_id) {
      console.log('Fetching persona from database...');
      const { data: personaData, error: personaError } = await supabase
        .from('personas')
        .select('id, name, system_prompt, description')
        .eq('id', persona_id)
        .maybeSingle();
      
      if (personaError) {
        console.error('Error fetching persona:', personaError);
      } else if (personaData) {
        selectedPersona = personaData;
        systemPrompt = personaData.system_prompt || systemPrompt;
        console.log('Using persona:', personaData.name);
      }
    }

    // Step 1: Search through uploaded documents
    console.log('Searching uploaded documents...');
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, title, content, filename')
      .not('content', 'is', null)
      .limit(10);

    if (docError) {
      console.error('Error fetching documents:', docError);
    }

    let documentContext = '';
    let relevantSources: string[] = [];
    
    if (documents && documents.length > 0) {
      // Simple text search for now - could be enhanced with vector search later
      const relevantDocs = documents.filter(doc => 
        doc.content && doc.content.toLowerCase().includes(message.toLowerCase().split(' ').find(word => word.length > 3) || '')
      );

      if (relevantDocs.length > 0) {
        documentContext = relevantDocs.map(doc => 
          `Document: ${doc.title}\nContent: ${doc.content?.substring(0, 2000)}...`
        ).join('\n\n');
        
        relevantSources = relevantDocs.map(doc => doc.title);
        console.log(`Found ${relevantDocs.length} relevant documents`);
      }
    }

    // Step 2: If no relevant documents found, search online with Perplexity
    let onlineContext = '';
    let isOnlineSearch = false;
    
    if (!documentContext && perplexityApiKey) {
      console.log('No relevant documents found, searching online...');
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are an environmental research assistant. Provide factual, current information about environmental topics, regulations, and best practices. Focus on authoritative sources.'
              },
              {
                role: 'user',
                content: `Research this environmental question: ${message}`
              }
            ],
            temperature: 0.2,
            max_tokens: 1000,
            return_related_questions: false
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          onlineContext = perplexityData.choices?.[0]?.message?.content || '';
          isOnlineSearch = true;
          console.log('Online search completed');
        }
      } catch (error) {
        console.error('Perplexity search error:', error);
      }
    }

    // Step 3: Generate response using Gemini with context
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nCONVERSATION HISTORY:\n${conversationHistory.map((msg: Message) => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    let contextPrompt = '';
    if (documentContext) {
      contextPrompt = `\n\nRELEVANT UPLOADED DOCUMENTS:\n${documentContext}`;
    } else if (onlineContext) {
      contextPrompt = `\n\nONLINE RESEARCH CONTEXT:\n${onlineContext}`;
    }

    const fullPrompt = `${systemPrompt}

${contextPrompt}${conversationContext}

USER QUESTION: ${message}

Please provide a helpful, accurate response based on the available context. If using information from uploaded documents, mention that the information comes from the user's documents. If using online research, you can reference that as well. Be professional and informative.`;

    console.log('Generating AI response...');
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response at this time.';

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      sources: relevantSources,
      isOnlineSearch: isOnlineSearch,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-analyst-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});