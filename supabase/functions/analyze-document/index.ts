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
    // Check OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API Key exists:', !!openaiApiKey);
    console.log('OpenAI API Key length:', openaiApiKey?.length || 0);

    if (!openaiApiKey) {
      console.error('OpenAI API key is missing from Supabase secrets!');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key is not configured in Supabase secrets. Please add OPENAI_API_KEY in Supabase Edge Function secrets.',
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

    // Test basic OpenAI connectivity
    console.log('Testing OpenAI API connectivity...');
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    });

    console.log('OpenAI API test status:', testResponse.status);

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('OpenAI API test failed:', errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API key is invalid or API is unreachable. Status: ${testResponse.status}`,
        success: false,
        debug: {
          hasKey: true,
          keyLength: openaiApiKey.length,
          apiStatus: testResponse.status,
          apiError: errorText
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const models = await testResponse.json();
    console.log('OpenAI API working! Available models:', models.data?.length || 0);

    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI API key is configured and working!',
      debug: {
        hasKey: true,
        keyLength: openaiApiKey.length,
        apiWorking: true,
        modelsAvailable: models.data?.length || 0
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