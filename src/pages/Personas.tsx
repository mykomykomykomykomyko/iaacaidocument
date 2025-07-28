import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, User, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";

interface Persona {
  id: string;
  name: string;
  description?: string;
  system_prompt: string;
  expertise_areas?: string[];
  avatar_emoji: string;
  is_default?: boolean;
  created_at: string;
}

const PersonasManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAIGenerateDialogOpen, setIsAIGenerateDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state - memoized to prevent unnecessary re-renders
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    system_prompt: "",
    expertise_areas: "",
    avatar_emoji: "🤖"
  });

  const { data: personas, isLoading } = useQuery({
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_prompt: "",
      expertise_areas: "",
      avatar_emoji: "🤖"
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (persona: Persona) => {
    setSelectedPersona(persona);
    setFormData({
      name: persona.name,
      description: persona.description || "",
      system_prompt: persona.system_prompt,
      expertise_areas: persona.expertise_areas?.join(", ") || "",
      avatar_emoji: persona.avatar_emoji
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDeleteDialogOpen(true);
  };

  const generatePersonaWithAI = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please provide a description to generate a persona with AI",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPersona(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-persona', {
        body: { description: formData.description }
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        system_prompt: data.system_prompt || prev.system_prompt,
        expertise_areas: data.expertise_areas?.join(", ") || prev.expertise_areas,
        avatar_emoji: data.avatar_emoji || prev.avatar_emoji
      }));

      toast({
        title: "Persona generated",
        description: "AI has generated the persona details. Review and adjust as needed."
      });
    } catch (error) {
      console.error('Persona generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate persona with AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const generatePersonaFromPrompt = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please provide a prompt to generate a persona",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPersona(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-persona', {
        body: { description: aiPrompt.trim() }
      });

      if (error) throw error;

      const personaData = {
        name: data.name,
        description: aiPrompt.trim(),
        system_prompt: data.system_prompt,
        expertise_areas: Array.isArray(data.expertise_areas) 
          ? data.expertise_areas 
          : data.expertise_areas?.split(",").map((area: string) => area.trim()).filter(Boolean) || [],
        avatar_emoji: data.avatar_emoji,
        is_default: false
      };

      const { error: saveError } = await supabase
        .from('personas')
        .insert([personaData]);
      
      if (saveError) throw saveError;

      toast({
        title: "Persona created",
        description: "AI has generated and saved your new persona!"
      });

      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsAIGenerateDialogOpen(false);
      setAiPrompt("");
    } catch (error) {
      console.error('AI persona generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate persona with AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const savePersona = async (isEdit = false) => {
    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name and system prompt are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const personaData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        system_prompt: formData.system_prompt.trim(),
        expertise_areas: formData.expertise_areas.trim() 
          ? formData.expertise_areas.split(",").map(area => area.trim()).filter(Boolean)
          : null,
        avatar_emoji: formData.avatar_emoji,
        is_default: false
      };

      if (isEdit && selectedPersona) {
        const { error } = await supabase
          .from('personas')
          .update(personaData)
          .eq('id', selectedPersona.id);
        
        if (error) throw error;
        
        toast({
          title: "Persona updated",
          description: "The persona has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('personas')
          .insert([personaData]);
        
        if (error) throw error;
        
        toast({
          title: "Persona created",
          description: "New persona has been created successfully"
        });
      }

      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save persona error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save persona. Please try again.",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedPersona) return;

    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', selectedPersona.id);
      
      if (error) throw error;
      
      toast({
        title: "Persona deleted",
        description: "The persona has been deleted successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsDeleteDialogOpen(false);
      setSelectedPersona(null);
    } catch (error) {
      console.error('Delete persona error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete persona. Please try again.",
        variant: "destructive"
      });
    }
  };

  const PersonaForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-16pt">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16pt">
        <div className="space-y-8pt">
          <Label htmlFor="name">Persona Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Wildlife Biologist"
          />
        </div>
        <div className="space-y-8pt">
          <Label htmlFor="emoji">Avatar Emoji</Label>
          <Input
            id="emoji"
            value={formData.avatar_emoji}
            onChange={(e) => setFormData(prev => ({ ...prev, avatar_emoji: e.target.value }))}
            placeholder="🤖"
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-8pt">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this persona's expertise and focus areas"
          rows={2}
        />
        {!isEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={generatePersonaWithAI}
            disabled={isGeneratingPersona || !formData.description.trim()}
          >
            {isGeneratingPersona ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-8pt"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-8pt" />
                Generate with AI
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-8pt">
        <Label htmlFor="expertise">Expertise Areas (comma-separated)</Label>
        <Input
          id="expertise"
          value={formData.expertise_areas}
          onChange={(e) => setFormData(prev => ({ ...prev, expertise_areas: e.target.value }))}
          placeholder="e.g., wildlife conservation, habitat assessment, biodiversity"
        />
      </div>

      <div className="space-y-8pt">
        <Label htmlFor="system_prompt">System Prompt *</Label>
        <Textarea
          id="system_prompt"
          value={formData.system_prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
          placeholder="Define how this persona should analyze documents and what expertise they bring..."
          rows={6}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-24pt py-32pt">
        <div className="space-y-32pt">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-8pt">AI Analysis Personas</h1>
              <p className="text-body text-muted-foreground">
                Manage specialized AI personas for document analysis
              </p>
            </div>
            <div className="flex items-center space-x-12pt">
              <Button onClick={() => setIsAIGenerateDialogOpen(true)} variant="outline">
                <Brain className="h-4 w-4 mr-8pt" />
                AI Generate
              </Button>
              <Button onClick={handleCreate} className="gradient-btn">
                <Plus className="h-4 w-4 mr-8pt" />
                Create New Persona
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24pt">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse hover-lift">
                  <CardContent className="pt-24pt">
                    <div className="h-4 bg-muted rounded w-3/4 mb-8pt"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-12pt"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24pt">
              {personas?.map((persona) => (
                <Card key={persona.id} className="hover-lift transition-all duration-400">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-8pt">
                        <span className="text-xl">{persona.avatar_emoji}</span>
                        <span className="text-body font-medium">{persona.name}</span>
                      </div>
                      <div className="flex items-center space-x-4pt">
                        {persona.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(persona)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!persona.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(persona)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body text-muted-foreground mb-16pt line-clamp-2">
                      {persona.description || "No description provided"}
                    </p>
                    
                    {persona.expertise_areas && persona.expertise_areas.length > 0 && (
                      <div className="flex flex-wrap gap-4pt mb-16pt">
                        {persona.expertise_areas.slice(0, 3).map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {persona.expertise_areas.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{persona.expertise_areas.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="text-body text-muted-foreground">
                      <strong className="text-foreground">System Prompt:</strong>
                      <p className="mt-8pt line-clamp-3 text-xs">{persona.system_prompt}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Dialogs remain the same */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-8pt">
                  <User className="h-5 w-5" />
                  <span>Create New Persona</span>
                </DialogTitle>
              </DialogHeader>
              <PersonaForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => savePersona(false)}>
                  Create Persona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-8pt">
                  <Edit className="h-5 w-5" />
                  <span>Edit Persona</span>
                </DialogTitle>
              </DialogHeader>
              <PersonaForm isEdit />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => savePersona(true)}>
                  Update Persona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{selectedPersona?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* AI Generate Dialog */}
          <Dialog open={isAIGenerateDialogOpen} onOpenChange={setIsAIGenerateDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-8pt">
                  <Brain className="h-5 w-5" />
                  <span>AI Generate Persona</span>
                </DialogTitle>
                <p className="text-muted-foreground text-body">
                  Describe the type of specialist you need and AI will create a complete persona
                </p>
              </DialogHeader>
              <div className="space-y-16pt">
                <div className="space-y-8pt">
                  <Label htmlFor="ai-prompt">What kind of specialist do you need?</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A marine biologist who specializes in coral reef impacts and ocean acidification..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAIGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={generatePersonaFromPrompt}
                  disabled={!aiPrompt.trim() || isGeneratingPersona}
                  className="min-w-32"
                >
                  {isGeneratingPersona ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-8pt"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-3 w-3 mr-8pt" />
                      Generate Persona
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default PersonasManagement;