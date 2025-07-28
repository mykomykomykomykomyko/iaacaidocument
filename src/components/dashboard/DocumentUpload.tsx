import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, Play, Sparkles, Eye, Trash2, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AnalysisConfigDialog } from "./AnalysisConfigDialog";
import { DocumentViewerDialog } from "./DocumentViewerDialog";
import { PDFViewerDialog } from "./PDFViewerDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { triggerAnalysisForDocument, triggerBulkAnalysis } from "@/utils/triggerAnalysis";
import { extractPDFText } from "@/utils/pdfParser";
export const DocumentUpload = () => {
  const {
    t
  } = useLanguage();
  const [isPlainText, setIsPlainText] = useState(false);
  const [plainTextContent, setPlainTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [pdfViewerDialogOpen, setPdfViewerDialogOpen] = useState(false);
  const [documentForViewing, setDocumentForViewing] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const {
    toast
  } = useToast();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setFile(selectedFiles[0]); // Keep single file for backward compatibility
      if (!title && selectedFiles.length === 1) {
        setTitle(selectedFiles[0].name.replace(/\.[^/.]+$/, ""));
      } else if (!title && selectedFiles.length > 1) {
        setTitle(`Bulk Upload - ${selectedFiles.length} files`);
      }
    }
  };
  const handleUpload = async () => {
    if (isPlainText) {
      if (!plainTextContent.trim()) {
        toast({
          title: "No content provided",
          description: "Please enter some text content",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (files.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select one or more files to upload",
          variant: "destructive"
        });
        return;
      }
    }
    setIsUploading(true);
    setUploadStatus('uploading');
    const uploadedDocuments = [];
    let successCount = 0;
    let failCount = 0;
    try {
      if (isPlainText) {
        // Handle plain text upload by creating document directly
        const {
          data,
          error
        } = await supabase.from('documents').insert({
          title: title || 'Plain Text Document',
          description: description,
          filename: `${title || 'plain-text'}.txt`,
          original_filename: `${title || 'plain-text'}.txt`,
          mime_type: 'text/plain',
          storage_path: 'plain-text',
          content: plainTextContent,
          file_size: new Blob([plainTextContent]).size,
          upload_status: 'uploaded'
        }).select().single();
        if (error) throw error;
        uploadedDocuments.push(data);
        successCount = 1;
      } else {
        // Handle bulk file upload
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          try {
            // For PDF files, extract text using the new PDF parser AND store the file
            if (currentFile.type === 'application/pdf') {
              const arrayBuffer = await currentFile.arrayBuffer();
              try {
                const {
                  pagesText
                } = await extractPDFText(arrayBuffer);
                const extractedText = pagesText.join('\n\n');

                // Upload PDF file to Supabase storage
                const fileName = `${Date.now()}-${currentFile.name}`;
                const {
                  data: uploadData,
                  error: uploadError
                } = await supabase.storage.from('pdfs').upload(fileName, currentFile, {
                  contentType: currentFile.type,
                  upsert: false
                });
                if (uploadError) {
                  console.error('Storage upload error:', uploadError);
                  throw uploadError;
                }

                // Create document with both extracted text and storage path
                const {
                  data,
                  error
                } = await supabase.from('documents').insert({
                  title: files.length === 1 ? title : `${title} - ${currentFile.name.replace(/\.[^/.]+$/, "")}`,
                  description: description,
                  filename: currentFile.name,
                  original_filename: currentFile.name,
                  mime_type: currentFile.type,
                  storage_path: uploadData.path,
                  content: extractedText,
                  file_size: currentFile.size,
                  upload_status: 'uploaded'
                }).select().single();
                if (error) throw error;
                uploadedDocuments.push(data);
                successCount++;
              } catch (pdfError) {
                console.warn(`PDF parsing failed for ${currentFile.name}, falling back to edge function:`, pdfError);
                // Fall back to the original upload method
                const formData = new FormData();
                formData.append('file', currentFile);
                formData.append('title', files.length === 1 ? title : `${title} - ${currentFile.name.replace(/\.[^/.]+$/, "")}`);
                formData.append('description', description);
                const {
                  data,
                  error
                } = await supabase.functions.invoke('upload-document', {
                  body: formData
                });
                if (error) throw error;
                uploadedDocuments.push(data?.document);
                successCount++;
              }
            } else {
              // For non-PDF files, use the original upload method
              const formData = new FormData();
              formData.append('file', currentFile);
              formData.append('title', files.length === 1 ? title : `${title} - ${currentFile.name.replace(/\.[^/.]+$/, "")}`);
              formData.append('description', description);
              const {
                data,
                error
              } = await supabase.functions.invoke('upload-document', {
                body: formData
              });
              if (error) throw error;
              uploadedDocuments.push(data?.document);
              successCount++;
            }
          } catch (error) {
            console.error(`Upload error for file ${currentFile.name}:`, error);
            failCount++;
          }
        }
      }
      setUploadStatus('success');

      // Auto-analyze if checkbox is checked
      if (autoAnalyze && uploadedDocuments.length > 0) {
        try {
          if (uploadedDocuments.length === 1) {
            // Single document analysis
            const analysisResult = await triggerAnalysisForDocument(uploadedDocuments[0].id);
            if (analysisResult.success) {
              toast({
                title: "Upload & Analysis Started",
                description: "Document uploaded and analysis has been started automatically."
              });
            } else {
              toast({
                title: "Upload successful, Analysis failed",
                description: "Document uploaded but auto-analysis failed. Use 'Analyze' button manually.",
                variant: "destructive"
              });
            }
          } else {
            // Bulk analysis - combine all documents into one analysis
            const documentIds = uploadedDocuments.filter(doc => doc?.id).map(doc => doc.id);
            const bulkAnalysisResult = await triggerBulkAnalysis(documentIds);
            if (bulkAnalysisResult.success) {
              toast({
                title: "Bulk Upload & Analysis Started",
                description: `${successCount} files uploaded and combined into a single analysis.`
              });
            } else {
              toast({
                title: "Upload successful, Analysis failed",
                description: "Files uploaded but bulk analysis failed. Use individual 'Analyze' buttons manually.",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          toast({
            title: "Upload successful, Analysis failed",
            description: "Files uploaded but auto-analysis failed. Use 'Analyze' button manually.",
            variant: "destructive"
          });
        }
      } else {
        if (successCount > 0) {
          toast({
            title: `Bulk Upload ${failCount > 0 ? 'Partially ' : ''}Complete`,
            description: `${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}. Use "Analyze" buttons to start AI analysis.`
          });
        }
      }

      // Reset form
      setFile(null);
      setFiles([]);
      setTitle("");
      setDescription("");
      setPlainTextContent("");

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
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  // Query for existing documents
  const {
    data: documents,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('documents').select('*').order('created_at', {
        ascending: false
      }).limit(5);
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
    if (document.mime_type.includes('pdf')) {
      setPdfViewerDialogOpen(true);
    } else {
      setViewerDialogOpen(true);
    }
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
      const {
        error
      } = await supabase.from('documents').delete().eq('id', documentToDelete.id);
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
  return <Card className="hover-lift transition-all duration-400">
      <CardHeader>
        <CardTitle className="flex items-center space-x-8pt">
          <FileText className="h-5 w-5" />
          <span>{t('upload.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-16pt">
        {/* Toggle between File Upload and Plain Text */}
        <div className="flex items-center justify-between p-16pt border rounded-lg">
          <div className="flex items-center space-x-8pt">
            <Upload className="h-4 w-4" />
            <span className="font-medium">{t('upload.fileUpload')}</span>
          </div>
          <div className="flex items-center space-x-8pt">
            <Label htmlFor="upload-mode" className="text-body">
              {isPlainText ? t('upload.plainText') : t('upload.fileUpload')}
            </Label>
            <Switch id="upload-mode" checked={isPlainText} onCheckedChange={setIsPlainText} />
            <Type className="h-4 w-4" />
          </div>
        </div>

        {isPlainText ?
      // Plain Text Mode
      <>
            <div className="space-y-8pt">
              <Label htmlFor="plain-text-content">{t('upload.textContent')}</Label>
              <Textarea id="plain-text-content" value={plainTextContent} onChange={e => setPlainTextContent(e.target.value)} placeholder={t('upload.pasteText')} rows={8} className="min-h-[200px]" />
              {plainTextContent && <p className="text-body text-muted-foreground">
                  {t('upload.characters')}: {plainTextContent.length} | {t('upload.size')}: {(new Blob([plainTextContent]).size / 1024).toFixed(2)} KB
                </p>}
            </div>
          </> :
      // File Upload Mode
      <>
            <div className="space-y-8pt">
              <Label htmlFor="file-upload">{t('upload.selectDocuments')}</Label>
              <Input id="file-upload" type="file" accept=".html,.htm,.xls,.xlsx,.txt,.pdf" onChange={handleFileChange} multiple className="file:mr-8pt file:px-12pt file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer mx-0 py-[2px]" />
              {files.length > 0 && <div className="space-y-4pt">
                  <p className="text-body text-muted-foreground font-medium">
                    {t('upload.selectedFiles')} {files.length}
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-2pt">
                    {files.map((f, index) => <div key={index} className="flex justify-between items-center text-sm p-8pt bg-muted/50 rounded">
                        <span className="truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('upload.totalSize')}: {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>}
            </div>
          </>}

        <div className="space-y-8pt">
          <Label htmlFor="title">{t('upload.documentTitle')}</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('upload.enterTitle')} />
        </div>

        <div className="space-y-8pt">
          <Label htmlFor="description">{t('upload.description')}</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('upload.briefDesc')} rows={3} />
        </div>

        {/* Auto-analyze checkbox */}
        <div className="flex items-center space-x-8pt p-12pt border rounded-lg bg-muted/20">
          <Checkbox id="auto-analyze" checked={autoAnalyze} onCheckedChange={checked => setAutoAnalyze(checked === true)} />
          <Label htmlFor="auto-analyze" className="text-body cursor-pointer">
            {t('upload.autoAnalyzeDesc')}
          </Label>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>

        <Button onClick={handleUpload} disabled={!files.length && !isPlainText || isPlainText && !plainTextContent.trim() || isUploading} className="w-full gradient-btn flex items-center space-x-8pt">
          {getStatusIcon()}
          <span>
             {uploadStatus === 'uploading' ? `Uploading ${files.length > 1 ? `${files.length} files` : 'file'}...` : uploadStatus === 'success' ? 'Upload Complete!' : uploadStatus === 'error' ? 'Upload Failed' : isPlainText ? 'Create Text Document' : files.length > 1 ? `Upload ${files.length} Documents` : 'Upload Document'}
          </span>
        </Button>

        {/* Existing Documents for Analysis */}
        {documents && documents.length > 0 && <div className="space-y-12pt">
            <div className="flex items-center space-x-8pt">
              <Sparkles className="h-4 w-4" />
              <Label className="font-medium">Analyze Existing Documents</Label>
            </div>
            <div className="space-y-8pt max-h-48 overflow-y-auto">
              {documents.map(doc => <div key={doc.id} className="flex items-center justify-between p-12pt border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-body truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.filename}</p>
                  </div>
                  <div className="flex items-center space-x-4pt">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                      <Eye className="h-3 w-3 mr-4pt" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAnalyzeDocument(doc)}>
                      <Sparkles className="h-3 w-3 mr-4pt" />
                      Analyze
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>)}
            </div>
          </div>}

        <div className="bg-muted/50 p-16pt rounded-lg">
          <div className="flex items-start space-x-8pt">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-body text-muted-foreground">
              <p className="font-medium mb-4pt">Supported Formats (Auto-detected):</p>
              <ul className="list-disc list-inside space-y-4pt">
                <li><strong>Plain Text</strong> - Paste text directly for quick analysis</li>
                <li><strong>HTML files</strong> - Best for environmental assessments (MVP format)</li>
                <li><strong>Excel files</strong> - XLS, XLSX spreadsheets with data analysis</li>
                <li><strong>Text files</strong> - Plain text documents (TXT)</li>
                <li><strong>PDF documents</strong> - Up to 500MB (basic text extraction)</li>
              </ul>
              <p className="mt-8pt text-sm">Use the toggle above to switch between file upload and plain text input. File types are automatically detected. Size limits: 100MB (HTML/Excel/TXT), 500MB (PDF).</p>
            </div>
          </div>
        </div>

        <AnalysisConfigDialog document={selectedDocument} open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen} onAnalysisStarted={() => {
        refetchDocuments();
      }} />

        <DocumentViewerDialog document={documentForViewing} open={viewerDialogOpen} onOpenChange={setViewerDialogOpen} />

        <PDFViewerDialog document={documentForViewing} open={pdfViewerDialogOpen} onOpenChange={setPdfViewerDialogOpen} />

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
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-8pt"></div>
                    Deleting...
                  </> : 'Delete Document'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>;
};