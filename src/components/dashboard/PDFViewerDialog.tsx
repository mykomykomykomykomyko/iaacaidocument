import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Eye, AlertCircle, FileImage, Download } from "lucide-react";
import { PDFRasterizer } from "./PDFRasterizer";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  filename: string;
  original_filename: string;
  content?: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

interface PDFViewerDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PDFViewerDialog = ({ document, open, onOpenChange }: PDFViewerDialogProps) => {
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const { toast } = useToast();

  // Mock PDF data - In real implementation, you would fetch the actual PDF file
  useEffect(() => {
    const loadPDFData = async () => {
      if (!document || !document.mime_type.includes('pdf') || !open) {
        setPdfArrayBuffer(null);
        return;
      }

      setLoadingPDF(true);
      try {
        // Create a mock PDF for demonstration
        // In real implementation, you would fetch from storage or use the file blob
        const mockPdfResponse = await fetch('/placeholder.pdf').catch(() => null);
        
        if (mockPdfResponse?.ok) {
          const arrayBuffer = await mockPdfResponse.arrayBuffer();
          setPdfArrayBuffer(arrayBuffer);
        } else {
          // Generate a simple mock PDF for demo purposes
          console.log('Using mock PDF data for demonstration');
          // You would replace this with actual PDF file fetching
          setPdfArrayBuffer(null);
        }
      } catch (error) {
        console.error('Error loading PDF data:', error);
        toast({
          title: "Error",
          description: "Could not load PDF file for rasterization",
          variant: "destructive"
        });
      } finally {
        setLoadingPDF(false);
      }
    };

    loadPDFData();
  }, [document, open, toast]);

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
    return 'bg-purple-100 text-purple-800';
  };

  const isPDF = document.mime_type.includes('pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>PDF Document Viewer</span>
            <Badge className={getFileTypeColor(document.mime_type)}>
              PDF
            </Badge>
          </DialogTitle>
          <p className="text-muted-foreground">
            {document.title} • {document.original_filename}
          </p>
        </DialogHeader>

        {isPDF ? (
          <Tabs defaultValue="pages" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages" className="flex items-center space-x-2">
                <FileImage className="h-4 w-4" />
                <span>PDF Pages</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Extracted Text</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages" className="flex-1 mt-4">
              {loadingPDF ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                      <p className="text-lg font-medium">Loading PDF...</p>
                      <p className="text-sm text-muted-foreground">Preparing for rasterization</p>
                    </div>
                  </CardContent>
                </Card>
              ) : pdfArrayBuffer ? (
                <PDFRasterizer 
                  pdfArrayBuffer={pdfArrayBuffer}
                  documentTitle={document.title}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">PDF Rasterization Unavailable</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Could not load PDF file for page rendering
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="content" className="flex-1 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Extracted Text Content</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This is the text content extracted from the PDF for AI analysis
                  </p>
                </CardHeader>
                <CardContent>
                  {document.content ? (
                    <ScrollArea className="h-96 w-full rounded-md border p-4">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                        {document.content}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-base">No text content available</p>
                      <p className="text-sm">The PDF may be image-based or text extraction failed</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">File Size</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatFileSize(document.file_size)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {document.content && (
                  <>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Character Count</p>
                          <p className="text-lg font-semibold text-primary">
                            {document.content.length.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Word Count</p>
                          <p className="text-lg font-semibold text-primary">
                            {document.content.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Not a PDF Document</p>
            <p className="text-sm text-muted-foreground">
              This viewer is designed for PDF files only
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};