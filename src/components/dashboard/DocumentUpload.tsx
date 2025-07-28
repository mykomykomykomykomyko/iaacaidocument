import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, Play, Sparkles, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AnalysisConfigDialog } from "./AnalysisConfigDialog";
import { DocumentViewerDialog } from "./DocumentViewerDialog";
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

export const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [documentForViewing, setDocumentForViewing] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
        description: `Document uploaded successfully. Use "Analyze" button to start AI analysis.`
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh documents list
      refetchDocuments();

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

  // Query for existing documents
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const handleAnalyzeDocument = (document: any) => {
    setSelectedDocument(document);
    setAnalysisDialogOpen(true);
  };

  const handleViewDocument = (document: any) => {
    setDocumentForViewing(document);
    setViewerDialogOpen(true);
  };

  const handleDeleteDocument = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      // Delete the document from Supabase (this will cascade delete related analyses)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (error) throw error;

      toast({
        title: "Document deleted",
        description: "Document and related analyses have been permanently deleted."
      });

      // Refresh the documents list
      refetchDocuments();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
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
             uploadStatus === 'error' ? 'Upload Failed' : 'Upload Document'}
          </span>
        </Button>

        {/* Existing Documents for Analysis */}
        {documents && documents.length > 0 && (
          <div className="space-y-12pt">
            <div className="flex items-center space-x-8pt">
              <Sparkles className="h-4 w-4" />
              <Label className="font-medium">Analyze Existing Documents</Label>
            </div>
            <div className="space-y-8pt max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-12pt border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-body truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.filename}</p>
                  </div>
                  <div className="flex items-center space-x-4pt">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-3 w-3 mr-4pt" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAnalyzeDocument(doc)}
                    >
                      <Sparkles className="h-3 w-3 mr-4pt" />
                      Analyze
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        <AnalysisConfigDialog
          document={selectedDocument}
          open={analysisDialogOpen}
          onOpenChange={setAnalysisDialogOpen}
          onAnalysisStarted={() => {
            refetchDocuments();
          }}
        />

        <DocumentViewerDialog
          document={documentForViewing}
          open={viewerDialogOpen}
          onOpenChange={setViewerDialogOpen}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone and will also delete all related analyses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-8pt"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Document'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};