import { supabase } from "@/integrations/supabase/client";

interface AnalysisOptions {
  persona_id?: string;
  custom_instructions?: string;
  analysis_type?: string;
}

export const triggerAnalysisForDocument = async (
  documentId: string, 
  options: AnalysisOptions = {}
) => {
  try {
    console.log(`Triggering analysis for document: ${documentId}`, options);
    
    const { data, error } = await supabase.functions.invoke('analyze-document', {
      body: { 
        document_id: documentId,
        analysis_type: options.analysis_type || 'environmental',
        persona_id: options.persona_id,
        custom_instructions: options.custom_instructions
      },
    });

    if (error) {
      console.error('Analysis trigger error:', error);
      return { success: false, error };
    }

    console.log('Analysis triggered successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to trigger analysis:', error);
    return { success: false, error };
  }
};