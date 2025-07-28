import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Analyze Document Function - Debugging ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('Gemini API Key exists:', !!geminiApiKey);
    console.log('Gemini API Key length:', geminiApiKey?.length || 0);

    if (!geminiApiKey) {
      console.error('Gemini API key is missing from Supabase secrets!');
      return new Response(JSON.stringify({ 
        error: 'Gemini API key is not configured in Supabase secrets. Please add GEMINI_API_KEY in Supabase Edge Function secrets.',
        success: false,
        debug: {
          hasKey: false,
          keyLength: 0
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test basic Gemini connectivity
    console.log('Testing Gemini API connectivity...');
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`, {
      method: 'GET',
    });

    console.log('Gemini API test status:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('Gemini API test failed:', errorText);
      return new Response(JSON.stringify({ 
        error: `Gemini API key is invalid or API is unreachable. Status: ${testResponse.status}`,
        success: false,
        debug: {
          hasKey: true,
          keyLength: geminiApiKey.length,
          apiStatus: testResponse.status,
          apiError: errorText
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const models = await testResponse.json();
    console.log('Gemini API working! Available models:', models.models?.length || 0);

    return new Response(JSON.stringify({
      success: true,
      message: 'Gemini API key is configured and working!',
      debug: {
        hasKey: true,
        keyLength: geminiApiKey.length,
        apiWorking: true,
        modelsAvailable: models.models?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      debug: {
        errorType: error.name,
        errorStack: error.stack
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});