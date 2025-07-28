import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { triggerAnalysisForDocument } from "@/utils/triggerAnalysis";

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
        description: `${data.document.mime_type.split('/')[1].toUpperCase()} file processed successfully. AI analysis is running - check Recent Analyses for results.`
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Don't reload the page - let React Query handle refreshing the data

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

  // Debug function to manually trigger analysis for existing documents
  const handleManualAnalysis = async () => {
    try {
      // Test with the HTML document (Northern Road Link Project)
      const result = await triggerAnalysisForDocument('13b863ba-1eb6-4ac9-9a8f-0e6e86813152');
      
      console.log('Manual analysis result:', result);
      
      if (result.success) {
        toast({
          title: "Analysis triggered",
          description: "Manual analysis started for HTML document. Check console for details."
        });
      } else {
        console.error('Analysis failed with error:', result.error);
        toast({
          title: "Analysis failed",
          description: result.error?.message || "Failed to start analysis",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Manual analysis error:', error);
      toast({
        title: "Analysis error",
        description: "Failed to trigger manual analysis",
        variant: "destructive"
      });
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
            accept=".html,.htm,.xls,.xlsx,.txt,.pdf"
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

        {/* Debug button to manually trigger analysis */}
        <Button 
          onClick={handleManualAnalysis}
          variant="outline"
          className="w-full flex items-center space-x-8pt"
        >
          <Play className="h-4 w-4" />
          <span>Test Analysis (Debug)</span>
        </Button>

        <div className="bg-muted/50 p-16pt rounded-lg">
          <div className="flex items-start space-x-8pt">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-body text-muted-foreground">
              <p className="font-medium mb-4pt">Supported Formats (Auto-detected):</p>
              <ul className="list-disc list-inside space-y-4pt">
                <li><strong>HTML files</strong> - Best for environmental assessments (MVP format)</li>
                <li><strong>Excel files</strong> - XLS, XLSX spreadsheets with data analysis</li>
                <li><strong>Text files</strong> - Plain text documents (TXT)</li>
                <li><strong>PDF documents</strong> - Up to 500MB (basic text extraction)</li>
              </ul>
              <p className="mt-8pt text-sm">File types are automatically detected. Size limits: 100MB (HTML/Excel/TXT), 500MB (PDF).</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};