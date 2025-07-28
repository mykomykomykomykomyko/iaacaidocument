import { supabase } from "@/integrations/supabase/client";

export const triggerAnalysisForDocument = async (documentId: string) => {
  try {
    console.log(`Triggering analysis for document: ${documentId}`);
    
    const { data, error } = await supabase.functions.invoke('analyze-document', {
      body: { 
        document_id: documentId,
        analysis_type: 'environmental'
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