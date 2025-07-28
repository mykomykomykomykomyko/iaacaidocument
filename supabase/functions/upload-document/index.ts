import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    console.log('Upload function called');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'Untitled Document';
    const description = formData.get('description') as string || '';

    if (!file) {
      console.error('No file provided');
      return new Response(JSON.stringify({ 
        error: 'No file provided',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error(`Unsupported file type: ${file.type}`);
      return new Response(JSON.stringify({ 
        error: `Unsupported file type: ${file.type}`,
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      console.error('File size exceeds limit');
      return new Response(JSON.stringify({ 
        error: 'File size exceeds 500MB limit',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract text content
    let extractedText = '';
    try {
      if (file.type === 'text/plain' || file.type === 'text/html') {
        const fileBuffer = await file.arrayBuffer();
        extractedText = new TextDecoder().decode(fileBuffer);
      } else {
        // For PDF and Word files, store placeholder
        extractedText = `[${file.type} content - size: ${file.size} bytes]`;
      }
    } catch (extractError) {
      console.error('Text extraction failed:', extractError);
      extractedText = '[Content extraction failed]';
    }

    // Save document to database
    console.log('Saving document to database...');
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        extracted_text: extractedText,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        },
        processing_status: 'completed',
        user_id: null // Allow anonymous uploads
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ 
        error: `Database error: ${dbError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Document uploaded successfully with ID: ${document.id}`);

    // Trigger AI analysis in the background
    try {
      console.log('Starting background analysis...');
      const analysisPromise = fetch(`${supabaseUrl}/functions/v1/analyze-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          persona: 'general',
          analysis_type: 'comprehensive'
        }),
      });
      
      // Don't await - let it run in background
      analysisPromise.then(() => {
        console.log('Analysis completed');
      }).catch(error => {
        console.error('Analysis failed:', error);
      });
      
    } catch (analysisError) {
      console.error('Failed to trigger analysis:', analysisError);
      // Don't fail the upload if analysis trigger fails
    }

    return new Response(JSON.stringify({
      success: true,
      document,
      message: 'Document uploaded and analysis started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: `Unexpected error: ${error.message}`,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});