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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file upload: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 500MB limit');
    }

    // Extract text content based on file type
    let extractedText = '';
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    try {
      if (file.type === 'text/plain' || file.type === 'text/html') {
        extractedText = new TextDecoder().decode(uint8Array);
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll store a placeholder for now
        // In a production environment, you'd use a PDF parsing library
        extractedText = '[PDF content - requires processing]';
      } else if (file.type.includes('word')) {
        // For Word documents, we'll store a placeholder for now
        // In a production environment, you'd use a Word document parsing library
        extractedText = '[Word document content - requires processing]';
      }
    } catch (extractError) {
      console.error('Text extraction failed:', extractError);
      extractedText = '[Content extraction failed]';
    }

    // Generate file metadata
    const fileMetadata = {
      size: file.size,
      type: file.type,
      lastModified: new Date().toISOString()
    };

    // Save document to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        title: title || file.name,
        description: description || '',
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        extracted_text: extractedText,
        metadata: fileMetadata,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Document uploaded successfully with ID: ${document.id}`);

    // Auto-trigger analysis for uploaded document
    try {
      await fetch(`${supabaseUrl}/functions/v1/analyze-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          persona: 'general',
          analysis_type: 'initial'
        }),
      });
      console.log('Auto-analysis triggered');
    } catch (analysisError) {
      console.error('Failed to trigger auto-analysis:', analysisError);
      // Don't fail the upload if analysis fails
    }

    return new Response(JSON.stringify({
      success: true,
      document,
      message: 'Document uploaded and processing initiated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});