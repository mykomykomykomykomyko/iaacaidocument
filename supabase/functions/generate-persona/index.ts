import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description) {
      throw new Error('Description is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Generating persona for description:', description);

    const prompt = `Based on this description, generate a specialized AI persona for environmental document analysis:

"${description}"

Please provide a JSON response with the following structure:
{
  "name": "Persona Name (2-4 words)",
  "system_prompt": "Detailed system prompt defining the persona's expertise, analysis approach, and how they should review environmental documents (100-200 words)",
  "expertise_areas": ["area1", "area2", "area3", "area4"],
  "avatar_emoji": "🔬"
}

Focus on environmental and impact assessment domains. Make the system prompt specific and actionable for document analysis.`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Generated text:', generatedText);

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from generated response');
    }

    const personaData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      success: true,
      ...personaData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-persona function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});