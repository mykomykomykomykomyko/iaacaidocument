import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const { data, error } = await supabase.functions.invoke('upload-document', {
        body: formData
      });

      if (error) throw error;

      setUploadStatus('success');
      toast({
        title: "Upload successful",
        description: "Document has been uploaded and analysis has started"
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload failed", 
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  return (
    <Card className="hover-lift transition-all duration-400">
      <CardHeader>
        <CardTitle className="flex items-center space-x-8pt">
          <FileText className="h-5 w-5" />
          <span>Upload Document</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-16pt">
        <div className="space-y-8pt">
          <Label htmlFor="file-upload">Select Document</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.html,.txt"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
          />
          {file && (
            <p className="text-body text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="space-y-8pt">
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
          />
        </div>

        <div className="space-y-8pt">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full gradient-btn flex items-center space-x-8pt"
        >
          {getStatusIcon()}
          <span>
            {uploadStatus === 'uploading' ? 'Uploading...' : 
             uploadStatus === 'success' ? 'Upload Complete!' :
             uploadStatus === 'error' ? 'Upload Failed' : 'Upload & Analyze'}
          </span>
        </Button>

        <div className="bg-muted/50 p-16pt rounded-lg">
          <div className="flex items-start space-x-8pt">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-body text-muted-foreground">
              <p className="font-medium mb-4pt">Supported Formats:</p>
              <ul className="list-disc list-inside space-y-4pt">
                <li>PDF documents (up to 500MB)</li>
                <li>HTML files from Impact Assessment Registry</li>
                <li>Word documents (DOC, DOCX)</li>
                <li>Plain text files</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};