import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, prompt, pageNumber } = await req.json();
    
    if (!imageData || !prompt) {
      throw new Error('Missing required fields: imageData and prompt');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log(`Processing page ${pageNumber} with Gemini...`);

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `${prompt}\n\nYou must return a valid JSON object with the following structure:\n{\n  "subjectRelevance": <number between 0-100 indicating how relevant this page is to the main subject>,\n  "summary": "<brief summary of the page content>",\n  "keyPoints": ["<key point 1>", "<key point 2>"],\n  "entities": ["<entity 1>", "<entity 2>"],\n  "pageType": "<type of page: cover, content, index, etc.>"\n}\nReturn ONLY valid JSON, no other text.` },
            {
              inlineData: {
                mimeType: 'image/png',
                data: imageData
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Parse the response - strip markdown code blocks first
    let analysis;
    try {
      // Remove markdown code block syntax
      const cleanedText = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      analysis = JSON.parse(cleanedText);
    } catch {
      analysis = { text: text, raw: true, subjectRelevance: 0 };
    }

    console.log(`Page ${pageNumber} analyzed successfully`);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-page-with-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});