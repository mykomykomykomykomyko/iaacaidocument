import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileImage, 
  Loader2, 
  AlertCircle,
  Eye
} from "lucide-react";
import { rasterizePdfPage } from "@/utils/pdfParser";
import { useToast } from "@/hooks/use-toast";

interface PDFRasterizerProps {
  pdfArrayBuffer: ArrayBuffer;
  documentTitle: string;
  totalPages?: number;
}

interface RasterizedPage {
  pageNumber: number;
  dataUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const PAGES_PER_LOAD = 20;

export const PDFRasterizer = ({ pdfArrayBuffer, documentTitle, totalPages }: PDFRasterizerProps) => {
  const [pages, setPages] = useState<RasterizedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detectedTotalPages, setDetectedTotalPages] = useState<number>(totalPages || 0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedPageImage, setSelectedPageImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate pagination
  const totalPagesForPagination = detectedTotalPages || Math.max(...pages.map(p => p.pageNumber), 0);
  const startPage = Math.floor((currentPage - 1) / PAGES_PER_LOAD) * PAGES_PER_LOAD + 1;
  const endPage = Math.min(startPage + PAGES_PER_LOAD - 1, totalPagesForPagination);
  const currentBatch = Math.floor((currentPage - 1) / PAGES_PER_LOAD) + 1;
  const totalBatches = Math.ceil(totalPagesForPagination / PAGES_PER_LOAD);

  // Get PDF info and initialize pages
  useEffect(() => {
    const initializePDF = async () => {
      if (!window.pdfjsLib || !pdfArrayBuffer) return;
      
      try {
        setIsInitializing(true);
        const pdfjsLib = window.pdfjsLib;
        
        // Create a copy of the ArrayBuffer to avoid detachment issues
        const pdfData = new Uint8Array(pdfArrayBuffer).buffer;
        
        const loadingTask = pdfjsLib.getDocument({
          data: pdfData,
          disableJpx: pdfjsLib.disableJpx || typeof pdfjsLib.JpxImage === 'undefined'
        });
        
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        console.log(`PDF loaded successfully with ${numPages} pages`);
        setDetectedTotalPages(numPages);
        
        // Initialize pages array with placeholders
        const initialPages: RasterizedPage[] = Array.from({ length: numPages }, (_, i) => ({
          pageNumber: i + 1,
          dataUrl: null,
          isLoading: false,
          error: null
        }));
        
        setPages(initialPages);
        
        toast({
          title: "PDF Loaded",
          description: `Ready to rasterize ${numPages} pages`
        });
      } catch (error) {
        console.error('Error initializing PDF:', error);
        toast({
          title: "Error",
          description: "Failed to load PDF",
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializePDF();
  }, [pdfArrayBuffer, toast]);

  // Rasterize a single page
  const rasterizePage = useCallback(async (pageNumber: number) => {
    if (!pdfArrayBuffer) return;

    setPages(prev => prev.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, isLoading: true, error: null }
        : page
    ));

    try {
      // Create a copy of the ArrayBuffer to avoid detachment issues
      const pdfData = new Uint8Array(pdfArrayBuffer).buffer;
      const dataUrl = await rasterizePdfPage(pdfData, pageNumber - 1);
      
      setPages(prev => prev.map(page => 
        page.pageNumber === pageNumber 
          ? { ...page, dataUrl, isLoading: false }
          : page
      ));
    } catch (error) {
      console.error(`Error rasterizing page ${pageNumber}:`, error);
      
      setPages(prev => prev.map(page => 
        page.pageNumber === pageNumber 
          ? { 
              ...page, 
              isLoading: false, 
              error: `Failed to rasterize page ${pageNumber}`
            }
          : page
      ));
    }
  }, [pdfArrayBuffer]);

  // Rasterize current batch of pages
  const rasterizeCurrentBatch = useCallback(async () => {
    const pagesToRasterize = pages.slice(startPage - 1, endPage).filter(
      page => !page.dataUrl && !page.isLoading && !page.error
    );

    // Rasterize pages in parallel, but limit concurrency
    const concurrencyLimit = 3;
    for (let i = 0; i < pagesToRasterize.length; i += concurrencyLimit) {
      const batch = pagesToRasterize.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map(page => rasterizePage(page.pageNumber)));
    }
  }, [pages, startPage, endPage, rasterizePage]);

  // Auto-rasterize current batch when pagination changes
  useEffect(() => {
    if (!isInitializing && pages.length > 0) {
      rasterizeCurrentBatch();
    }
  }, [isInitializing, pages.length, currentPage, rasterizeCurrentBatch]);

  const currentBatchPages = useMemo(() => {
    return pages.slice(startPage - 1, endPage);
  }, [pages, startPage, endPage]);

  const goToNextBatch = () => {
    if (currentBatch < totalBatches) {
      setCurrentPage(startPage + PAGES_PER_LOAD);
    }
  };

  const goToPrevBatch = () => {
    if (currentBatch > 1) {
      setCurrentPage(Math.max(1, startPage - PAGES_PER_LOAD));
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewFullSize = (dataUrl: string) => {
    setSelectedPageImage(dataUrl);
  };

  if (isInitializing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading PDF...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5" />
              <span>PDF Pages</span>
              <Badge variant="secondary">
                {detectedTotalPages} pages
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevBatch}
                disabled={currentBatch <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Batch {currentBatch} of {totalBatches}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextBatch}
                disabled={currentBatch >= totalBatches}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing pages {startPage}-{endPage} of {detectedTotalPages}
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Page</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBatchPages.map((page) => (
                  <TableRow 
                    key={page.pageNumber}
                    className={currentPage === page.pageNumber ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Button
                        variant={currentPage === page.pageNumber ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageClick(page.pageNumber)}
                      >
                        {page.pageNumber}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {page.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Rasterizing...</span>
                        </div>
                      ) : page.error ? (
                        <div className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{page.error}</span>
                        </div>
                      ) : page.dataUrl ? (
                        <img 
                          src={page.dataUrl} 
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-32 max-h-24 object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleViewFullSize(page.dataUrl!)}
                        />
                      ) : (
                        <div className="w-32 h-24 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Not loaded</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {page.isLoading ? (
                        <Badge variant="secondary">Loading</Badge>
                      ) : page.error ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : page.dataUrl ? (
                        <Badge variant="default">Ready</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {page.dataUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFullSize(page.dataUrl!)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {page.error && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rasterizePage(page.pageNumber)}
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Full-size image viewer */}
      {selectedPageImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPageImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={selectedPageImage} 
              alt="Full size page"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedPageImage(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};