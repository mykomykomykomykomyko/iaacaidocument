import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Plus, Sparkles, User } from "lucide-react";
import { triggerAnalysisForDocument } from "@/utils/triggerAnalysis";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  filename: string;
  content?: string;
}

interface Persona {
  id: string;
  name: string;
  description?: string;
  system_prompt: string;
  expertise_areas?: string[];
  avatar_emoji: string;
  is_default?: boolean;
}

interface AnalysisConfigDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisStarted?: () => void;
}

export const AnalysisConfigDialog = ({ 
  document, 
  open, 
  onOpenChange, 
  onAnalysisStarted 
}: AnalysisConfigDialogProps) => {
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: personas, isLoading: loadingPersonas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Persona[];
    }
  });

  const handleAnalyze = async () => {
    if (!document || !selectedPersona) {
      toast({
        title: "Missing requirements",
        description: "Please select a persona to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await triggerAnalysisForDocument(document.id, {
        persona_id: selectedPersona,
        custom_instructions: customInstructions.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: "Analysis started",
          description: "Your document is being analyzed. Check Recent Analyses for updates.",
        });
        onAnalysisStarted?.();
        onOpenChange(false);
        
        // Reset form
        setSelectedPersona("");
        setCustomInstructions("");
      } else {
        throw new Error(result.error?.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedPersonaData = personas?.find(p => p.id === selectedPersona);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-8pt">
            <Sparkles className="h-5 w-5" />
            <span>Configure Analysis</span>
          </DialogTitle>
          {document && (
            <p className="text-muted-foreground">
              Analyzing: {document.title}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-24pt">
          {/* Persona Selection */}
          <div className="space-y-12pt">
            <Label className="text-body font-medium">Select Analysis Persona</Label>
            
            {loadingPersonas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12pt">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-16pt">
                      <div className="h-4 bg-muted rounded w-3/4 mb-8pt"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12pt max-h-64 overflow-y-auto">
                {personas?.map((persona) => (
                  <Card
                    key={persona.id}
                    className={`cursor-pointer transition-all ${
                      selectedPersona === persona.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPersona(persona.id)}
                  >
                    <CardContent className="pt-16pt">
                      <div className="flex items-start space-x-8pt">
                        <span className="text-lg">{persona.avatar_emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4pt mb-4pt">
                            <h4 className="font-medium text-body">{persona.name}</h4>
                            {persona.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-body text-muted-foreground text-xs line-clamp-2">
                            {persona.description}
                          </p>
                          {persona.expertise_areas && persona.expertise_areas.length > 0 && (
                            <div className="flex flex-wrap gap-4pt mt-8pt">
                              {persona.expertise_areas.slice(0, 2).map((area, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                              {persona.expertise_areas.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{persona.expertise_areas.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Persona Details */}
          {selectedPersonaData && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-8pt text-body">
                  <span>{selectedPersonaData.avatar_emoji}</span>
                  <span>{selectedPersonaData.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-muted-foreground mb-12pt">
                  {selectedPersonaData.description}
                </p>
                <div className="text-body">
                  <strong>Analysis Approach:</strong>
                  <p className="text-muted-foreground mt-4pt text-xs">
                    {selectedPersonaData.system_prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Custom Instructions */}
          <div className="space-y-8pt">
            <Label htmlFor="custom-instructions" className="text-body font-medium">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="custom-instructions"
              placeholder="Add specific requirements, focus areas, or questions you want the analysis to address..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These instructions will be combined with the selected persona's expertise for a tailored analysis.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-12pt pt-16pt border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAnalyze}
              disabled={!selectedPersona || isAnalyzing}
              className="min-w-32"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-8pt"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-8pt" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};