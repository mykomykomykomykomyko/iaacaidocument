import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Eye, AlertCircle } from "lucide-react";
import { PDFRasterizer } from "./PDFRasterizer";
import { useState, useEffect } from "react";

interface Document {
  id: string;
  title: string;
  filename: string;
  original_filename: string;
  content?: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  storage_path?: string;
}

interface DocumentViewerDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentViewerDialog = ({ document, open, onOpenChange }: DocumentViewerDialogProps) => {
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // Load PDF data when document changes and it's a PDF
  useEffect(() => {
    const loadPDFData = async () => {
      if (!document || !document.mime_type.includes('pdf') || !open) {
        setPdfArrayBuffer(null);
        return;
      }

      setLoadingPDF(true);
      try {
        // For PDFs, we need to fetch the actual file data
        // This is a placeholder - you might need to implement actual PDF file fetching
        // For now, we'll show the rasterizer when the document is opened
        console.log('PDF document detected, rasterization available');
      } catch (error) {
        console.error('Error loading PDF data:', error);
      } finally {
        setLoadingPDF(false);
      }
    };

    loadPDFData();
  }, [document, open]);
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (mimeType.includes('html')) return 'bg-blue-100 text-blue-800';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'bg-green-100 text-green-800';
    if (mimeType.includes('text')) return 'bg-gray-100 text-gray-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-8pt">
            <FileText className="h-5 w-5" />
            <span>Document Content Preview</span>
          </DialogTitle>
          <p className="text-muted-foreground">
            {document.title}
          </p>
        </DialogHeader>

        <div className="space-y-16pt">
          {/* Document Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12pt">
            <Card>
              <CardContent className="pt-16pt">
                <div className="text-center">
                  <p className="text-body font-medium">File Type</p>
                  <Badge className={getFileTypeColor(document.mime_type)}>
                    {document.mime_type.split('/')[1]?.toUpperCase() || 'Unknown'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-16pt">
                <div className="text-center">
                  <p className="text-body font-medium">File Size</p>
                  <p className="text-body text-muted-foreground">
                    {formatFileSize(document.file_size)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-16pt">
                <div className="text-center">
                  <p className="text-body font-medium">Original Name</p>
                  <p className="text-body text-muted-foreground truncate" title={document.original_filename}>
                    {document.original_filename}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-16pt">
                <div className="text-center">
                  <p className="text-body font-medium">Upload Date</p>
                  <p className="text-body text-muted-foreground">
                    {new Date(document.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Extracted Content */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-8pt">
                <Eye className="h-5 w-5" />
                <span>Extracted Content for AI Analysis</span>
              </CardTitle>
              <p className="text-body text-muted-foreground">
                This is the text content that was extracted from your document and will be used by AI for analysis.
              </p>
            </CardHeader>
            <CardContent>
              {document.content ? (
                <ScrollArea className="h-96 w-full rounded-md border p-16pt">
                  <div className="whitespace-pre-wrap text-body leading-relaxed font-mono text-xs">
                    {document.content}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-32pt text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-16pt text-muted-foreground/50" />
                  <p className="text-body">No content extracted</p>
                  <p className="text-body">The document may be image-based or content extraction failed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Stats */}
          {document.content && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12pt">
              <Card>
                <CardContent className="pt-16pt">
                  <div className="text-center">
                    <p className="text-body font-medium">Character Count</p>
                    <p className="text-lg font-semibold text-primary">
                      {document.content.length.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-16pt">
                  <div className="text-center">
                    <p className="text-body font-medium">Word Count</p>
                    <p className="text-lg font-semibold text-primary">
                      {document.content.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-16pt">
                  <div className="text-center">
                    <p className="text-body font-medium">Lines</p>
                    <p className="text-lg font-semibold text-primary">
                      {document.content.split('\n').length.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};