import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Assumes pdfjsLib is globally available from HTML
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

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

interface AnalysisPDFViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPage?: number;
}

const configurePdfWorker = () => {
  try {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('pdfjsLib is not available globally. Make sure PDF.js scripts are loaded.');
    }
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    }
    return true;
  } catch (error) {
    console.error(`Failed to configure PDF.js worker: ${error.message}`);
    throw error;
  }
};

export const AnalysisPDFViewer = ({ document, open, onOpenChange, initialPage = 1 }: AnalysisPDFViewerProps) => {
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [pageInput, setPageInput] = useState(initialPage.toString());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Update current page when initialPage changes
  useEffect(() => {
    if (initialPage !== currentPage && initialPage <= numPages && initialPage >= 1) {
      setCurrentPage(initialPage);
      setPageInput(initialPage.toString());
    }
  }, [initialPage, numPages]);

  // Load PDF when document or dialog opens
  useEffect(() => {
    if (document && open && document.mime_type.includes('pdf') && document.storage_path) {
      loadPDF(document.storage_path);
    }
  }, [document, open]);

  // Render page when PDF, page, or scale changes
  useEffect(() => {
    if (pdfDocument && currentPage >= 1 && currentPage <= numPages) {
      renderPage(pdfDocument, currentPage);
    }
  }, [pdfDocument, currentPage, scale]);

  const loadPDF = async (storagePath: string) => {
    setIsLoading(true);
    try {
      configurePdfWorker();

      // Download PDF from Supabase storage
      const { data, error } = await supabase.storage.from('pdfs').download(storagePath);
      if (error) throw error;

      // Convert to ArrayBuffer and load with PDF.js
      const arrayBuffer = await data.arrayBuffer();
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF.js not available globally');
      }

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false
      });

      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(initialPage);
      setPageInput(initialPage.toString());

    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load PDF file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      setPageInput(pageNum.toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      goToPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  if (!document) return null;

  const isPDF = document.mime_type.includes('pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Viewer - {document.title}</span>
            {isPDF && pdfDocument && (
              <div className="flex items-center space-x-12pt">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {Math.round(scale * 100)}%
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isPDF ? (
          <div className="flex flex-col h-[calc(95vh-120px)]">
            {/* PDF Controls */}
            {pdfDocument && (
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center space-x-8pt">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-4pt">
                    <span className="text-sm">Page</span>
                    <Input
                      type="number"
                      value={pageInput}
                      onChange={handlePageInputChange}
                      className="w-16 h-8 text-center"
                      min={1}
                      max={numPages}
                    />
                    <span className="text-sm">of {numPages}</span>
                  </form>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= numPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PDF Content */}
            <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/10">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pdfDocument ? (
                <canvas
                  ref={canvasRef}
                  className="border border-border shadow-lg bg-white"
                  style={{ maxWidth: '100%', height: 'fit-content' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Failed to load PDF
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
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