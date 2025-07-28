import { useState, useRef, useEffect, useMemo } from "react"
import { Upload, FileText, Eye, Save, AlertCircle, CheckCircle, Clock, Settings, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Grid3X3, Send, Key } from "lucide-react"
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

// Assumes pdfjsLib is globally available from HTML
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const configurePdfWorker = () => {
  try {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('pdfjsLib is not available globally. Make sure PDF.js scripts are loaded.');
    }

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use CDN worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    }

    console.log('PDF.js worker configured successfully');
    return true;
  } catch (error) {
    console.error(`Failed to configure PDF.js worker: ${error.message}`);
    throw error;
  }
};

// Initialize worker configuration when module loads
let pdfWorkerConfigured = false;

interface PageImage {
  pageNum: number
  canvas: HTMLCanvasElement
  selected: boolean
}

interface PDFProcessingTesterProps {
  documentProp?: {
    id: string;
    title: string;
    filename: string;
    original_filename: string;
    content?: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    storage_path?: string;
  };
}

export const PDFProcessingTester = ({ documentProp }: PDFProcessingTesterProps) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [isRasterizing, setIsRasterizing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  
  // Gallery states
  const [pageImages, setPageImages] = useState<Map<number, PageImage>>(new Map())
  const [currentGalleryPage, setCurrentGalleryPage] = useState(1)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  
  // Gemini states
  const [geminiPrompt, setGeminiPrompt] = useState('Analyze this page from an environmental impact assessment document. Extract key information about environmental impacts, mitigation measures, and any regulatory requirements.')
  const [geminiResponses, setGeminiResponses] = useState<Map<number, any>>(new Map())
  const [isProcessingGemini, setIsProcessingGemini] = useState(false)
  const [selectedHeatmapPage, setSelectedHeatmapPage] = useState<number | null>(null)
  
  const pagesPerGalleryPage = 20

  // Load PDF from provided document prop
  useEffect(() => {
    if (documentProp && documentProp.mime_type.includes('pdf') && documentProp.storage_path) {
      loadPDFFromStorage(documentProp.storage_path)
    }
  }, [documentProp])

  const loadPDFFromStorage = async (storagePath: string) => {
    setIsProcessing(true)
    setProcessingStage("Loading PDF from storage...")
    
    try {
      // Initialize PDF.js worker once
      if (!pdfWorkerConfigured) {
        configurePdfWorker()
        pdfWorkerConfigured = true
      }

      // Download PDF from Supabase storage
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(storagePath)

      if (error) throw error

      // Convert to ArrayBuffer and load with PDF.js
      const arrayBuffer = await data.arrayBuffer()
      const pdfjsLib = window.pdfjsLib
      
      if (!pdfjsLib) {
        throw new Error('PDF.js not available globally')
      }

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false
      })
      
      const pdf = await loadingTask.promise
      setPdfDocument(pdf)
      setNumPages(pdf.numPages)
      setCurrentPage(1)
      
      setProcessingStage(`PDF loaded successfully - ${pdf.numPages} pages`)
      
      // Render first page to main viewer
      await renderPage(pdf, 1)
      
      toast({
        title: "PDF Loaded",
        description: `Successfully loaded ${pdf.numPages} pages`
      })
      
    } catch (error) {
      console.error('Error loading PDF from storage:', error)
      setProcessingStage(`Error loading PDF: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to load PDF file",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const mockProcessingStages = [
    { stage: "upload", label: "File Upload", status: uploadedFile || documentProp ? "completed" : "pending" },
    { stage: "parse", label: "PDF Parsing", status: pdfDocument ? "completed" : (uploadedFile || documentProp) ? "processing" : "pending" },
    { stage: "rasterize", label: "Page Rasterization", status: pageImages.size > 0 ? "completed" : pdfDocument ? "processing" : "pending" },
    { stage: "ai", label: "AI Analysis", status: geminiResponses.size > 0 ? "completed" : "pending" },
    { stage: "save", label: "Save to Database", status: "pending" }
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
      setIsProcessing(true)
      setProcessingStage("Initializing PDF.js...")
      
      try {
        // Initialize PDF.js worker once
        if (!pdfWorkerConfigured) {
          configurePdfWorker()
          pdfWorkerConfigured = true
        }
        
        // Simulate upload progress
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += 10
          setUploadProgress(progress)
          if (progress >= 100) {
            clearInterval(progressInterval)
          }
        }, 200)

        setProcessingStage("Loading PDF document...")
        
        // Load PDF document using window.pdfjsLib
        const arrayBuffer = await file.arrayBuffer()
        const pdfjsLib = window.pdfjsLib
        
        if (!pdfjsLib) {
          throw new Error('PDF.js not available globally')
        }

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          disableAutoFetch: false,
          disableStream: false,
          disableRange: false
        })
        
        const pdf = await loadingTask.promise
        setPdfDocument(pdf)
        setNumPages(pdf.numPages)
        setCurrentPage(1)
        
        setProcessingStage(`PDF loaded successfully - ${pdf.numPages} pages`)
        setIsProcessing(false)
        
        // Render first page to main viewer
        await renderPage(pdf, 1)
        
      } catch (error) {
        console.error('Error loading PDF:', error)
        setProcessingStage(`Error loading PDF: ${error.message}`)
        setIsProcessing(false)
      }
    }
  }

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current) return

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }

    await page.render(renderContext).promise
  }

  const renderPageToCanvas = async (pdf: any, pageNum: number, targetScale = 1.5): Promise<HTMLCanvasElement> => {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: targetScale })
    const canvas = window.document.createElement('canvas')
    const context = canvas.getContext('2d')!

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
      enableWebGL: true
    }

    try {
      await page.render(renderContext).promise
      console.debug(`Page ${pageNum} rendered successfully`)
    } catch (renderError) {
      console.warn(`Partial rendering for page ${pageNum} due to error: ${renderError.message}`)
    }

    return canvas
  }

  const loadGalleryPages = async (startPage: number, endPage: number) => {
    if (!pdfDocument) return

    const newImages = new Map(pageImages)
    
    for (let pageNum = startPage; pageNum <= Math.min(endPage, numPages); pageNum++) {
      if (!newImages.has(pageNum)) {
        try {
          const canvas = await renderPageToCanvas(pdfDocument, pageNum, 1.2)
          newImages.set(pageNum, {
            pageNum,
            canvas,
            selected: selectedPages.has(pageNum)
          })
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error)
        }
      }
    }
    
    setPageImages(newImages)
  }

  const totalGalleryPages = Math.ceil(numPages / pagesPerGalleryPage)
  
  const visiblePageNumbers = useMemo(() => {
    const start = (currentGalleryPage - 1) * pagesPerGalleryPage + 1
    const end = Math.min(start + pagesPerGalleryPage - 1, numPages)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentGalleryPage, numPages, pagesPerGalleryPage])

  useEffect(() => {
    if (pdfDocument && visiblePageNumbers.length > 0) {
      loadGalleryPages(visiblePageNumbers[0], visiblePageNumbers[visiblePageNumbers.length - 1])
    }
  }, [pdfDocument, currentGalleryPage, visiblePageNumbers])

  const togglePageSelection = (pageNum: number) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum)
    } else {
      newSelected.add(pageNum)
    }
    setSelectedPages(newSelected)
    
    // Update pageImages to reflect selection
    const newImages = new Map(pageImages)
    const pageImage = newImages.get(pageNum)
    if (pageImage) {
      newImages.set(pageNum, { ...pageImage, selected: newSelected.has(pageNum) })
      setPageImages(newImages)
    }
  }

  const selectAllPages = () => {
    const allPageNumbers = Array.from({ length: numPages }, (_, i) => i + 1)
    setSelectedPages(new Set(allPageNumbers))
    
    // Update pageImages to reflect selection
    const newImages = new Map(pageImages)
    for (const [pageNum, pageImage] of newImages) {
      newImages.set(pageNum, { ...pageImage, selected: true })
    }
    setPageImages(newImages)
  }

  const processSelectedPagesWithGemini = async () => {
    if (selectedPages.size === 0) {
      toast({
        title: "No pages selected",
        description: "Please select at least one page to process",
        variant: "destructive"
      })
      return
    }

    setIsProcessingGemini(true)
    const responses = new Map(geminiResponses)
    
    try {
      // Call Supabase Edge Function for Gemini analysis
      const selectedPagesArray = Array.from(selectedPages)
      
      // Process pages one at a time
      for (let i = 0; i < selectedPagesArray.length; i++) {
        const pageNum = selectedPagesArray[i]
        
        // Check if page is already rasterized, if not, rasterize just-in-time
        let pageImage = pageImages.get(pageNum)
        if (!pageImage && pdfDocument) {
          try {
            setProcessingStage(`Rasterizing page ${pageNum} (${i + 1}/${selectedPagesArray.length})...`)
            const canvas = await renderPageToCanvas(pdfDocument, pageNum, 1.2)
            pageImage = {
              pageNum,
              canvas,
              selected: true
            }
          } catch (error) {
            console.error(`Error rasterizing page ${pageNum}:`, error)
            continue
          }
        }
        
        if (!pageImage) continue

        try {
          setProcessingStage(`Processing page ${pageNum} (${i + 1}/${selectedPagesArray.length}) with Gemini...`)
          
          // Convert canvas to base64
          const base64 = pageImage.canvas.toDataURL('image/png').split(',')[1]
          
          // Call Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('analyze-page-with-gemini', {
            body: {
              imageData: base64,
              prompt: geminiPrompt,
              pageNumber: pageNum
            }
          })

          if (error) throw error
          
          responses.set(pageNum, {
            pageNum,
            response: data.analysis,
            timestamp: new Date().toISOString()
          })
          
          // Update state immediately for progressive heatmap building
          setGeminiResponses(new Map(responses))
          
        } catch (error) {
          console.error(`Error processing page ${pageNum}:`, error)
          responses.set(pageNum, {
            pageNum,
            error: error.message,
            timestamp: new Date().toISOString()
          })
          
          // Update state even for errors
          setGeminiResponses(new Map(responses))
        }
        
        // Small delay between requests to avoid rate limiting
        if (i < selectedPagesArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      setProcessingStage(`Completed processing ${responses.size} pages`)
    } catch (error) {
      console.error('Error processing with Gemini:', error)
      setProcessingStage(`Error: ${error.message}`)
    } finally {
      setIsProcessingGemini(false)
    }
  }

  const downloadPageAsPNG = async (pageNum: number, highRes = true) => {
    if (!pdfDocument) return

    setIsRasterizing(true)
    try {
      const page = await pdfDocument.getPage(pageNum)
      const renderScale = highRes ? 3.0 : 1.5
      const viewport = page.getViewport({ scale: renderScale })

      const tempCanvas = window.document.createElement('canvas')
      const tempContext = tempCanvas.getContext('2d')
      
      if (!tempContext) return

      tempCanvas.height = viewport.height
      tempCanvas.width = viewport.width

      const renderContext = {
        canvasContext: tempContext,
        viewport: viewport,
        canvas: tempCanvas,
      }

      await page.render(renderContext).promise

      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = window.document.createElement('a')
          link.href = url
          link.download = `${displayDocument?.title || 'page'}_page_${pageNum}.png`
          window.document.body.appendChild(link)
          link.click()
          window.document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png', 1.0)

    } catch (error) {
      console.error('Error rasterizing page:', error)
    } finally {
      setIsRasterizing(false)
    }
  }

  useEffect(() => {
    if (pdfDocument && canvasRef.current) {
      renderPage(pdfDocument, currentPage)
    }
  }, [pdfDocument, currentPage, scale])

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum)
    }
  }

  // Heatmap component
  const HeatmapGrid = () => {
    const processedPages = Array.from(geminiResponses.entries())
      .filter(([_, result]) => !result.error && result.response?.subjectRelevance !== undefined)
      .map(([pageNum, result]) => ({
        pageNum,
        relevance: result.response.subjectRelevance,
        data: result
      }))

    if (processedPages.length === 0) return null

    const totalPages = processedPages.length
    const cols = Math.ceil(Math.sqrt(totalPages))
    const rows = Math.ceil(totalPages / cols)

    const getHeatmapColor = (relevance: number) => {
      if (relevance >= 80) return 'hsl(60, 100%, 85%)'
      if (relevance >= 60) return 'hsl(45, 80%, 75%)'
      if (relevance >= 40) return 'hsl(30, 70%, 65%)'
      if (relevance >= 20) return 'hsl(15, 60%, 55%)'
      return 'hsl(25, 40%, 30%)'
    }

    const gridData = Array(rows * cols).fill(null).map((_, index) => {
      return processedPages[index] || null
    })

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Subject Relevance Heatmap</h4>
          <div className="flex items-center gap-2 text-xs">
            <span>Low</span>
            <div className="flex">
              {[0, 25, 50, 75, 95].map(val => (
                <div
                  key={val}
                  className="w-4 h-3"
                  style={{ backgroundColor: getHeatmapColor(val) }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
        
        <div 
          className="grid gap-1 max-w-md mx-auto"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {gridData.map((item, index) => (
            <div
              key={index}
              className={`aspect-square border rounded cursor-pointer transition-all hover:scale-105 flex items-center justify-center text-xs font-medium ${
                item ? 'hover:ring-2 hover:ring-primary' : ''
              }`}
              style={{
                backgroundColor: item ? getHeatmapColor(item.relevance) : 'hsl(var(--muted))',
                color: item && item.relevance > 50 ? 'black' : item ? 'white' : 'hsl(var(--muted-foreground))'
              }}
              onClick={() => item && setSelectedHeatmapPage(item.pageNum)}
            >
              {item ? item.pageNum : ''}
            </div>
          ))}
        </div>

        {selectedHeatmapPage && geminiResponses.has(selectedHeatmapPage) && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium">Page {selectedHeatmapPage} Details</h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHeatmapPage(null)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Relevance Score:</span>
                <Badge variant="secondary">
                  {geminiResponses.get(selectedHeatmapPage)?.response?.subjectRelevance || 'N/A'}%
                </Badge>
              </div>
              <div className="p-3 bg-background rounded border">
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(geminiResponses.get(selectedHeatmapPage)?.response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Display document info if provided as prop
  const displayDocument = documentProp || (uploadedFile ? {
    title: uploadedFile.name,
    filename: uploadedFile.name,
    original_filename: uploadedFile.name,
    file_size: uploadedFile.size,
    mime_type: uploadedFile.type,
    created_at: new Date().toISOString()
  } : null)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          PDF Processing & Analysis
        </h1>
        <p className="text-muted-foreground">
          {documentProp ? `Viewing: ${documentProp.title}` : 'Upload and analyze PDF documents with AI'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Processing Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document Info/Upload Section */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Document {documentProp ? 'Information' : 'Upload'}</CardTitle>
              <CardDescription>
                {documentProp ? 'Document details and processing status' : 'Upload environmental assessment documents (up to 500MB)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayDocument ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                     <FileText className="h-8 w-8 text-primary" />
                     <div className="flex-1">
                       <p className="font-medium text-foreground">{displayDocument.title}</p>
                       <p className="text-sm text-muted-foreground">
                         {numPages} pages • {(displayDocument.file_size / (1024 * 1024)).toFixed(1)} MB
                       </p>
                     </div>
                     <Badge variant="secondary">
                       <CheckCircle className="h-3 w-3 mr-1" />
                       Loaded
                     </Badge>
                   </div>
                  
                  {isProcessing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Processing Progress</span>
                        <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">{processingStage}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">Drop your PDF here or click to browse</p>
                    <p className="text-sm text-muted-foreground">Supports files up to 500MB</p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Pipeline */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>Track the document processing stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProcessingStages.map((item, index) => (
                  <div key={item.stage} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-success text-success-foreground' :
                      item.status === 'processing' ? 'bg-primary text-primary-foreground animate-pulse' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                       item.status === 'processing' ? <Clock className="h-4 w-4 animate-spin" /> :
                       <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      {item.status === 'processing' && (
                        <p className="text-sm text-muted-foreground">{processingStage}</p>
                      )}
                    </div>
                    <Badge variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'processing' ? 'secondary' :
                      'outline'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Page Viewer */}
          {pdfDocument && (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Page Viewer
                </CardTitle>
                <CardDescription>
                  Current page: {currentPage} of {numPages}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Page Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <Input
                        type="number"
                        min={1}
                        max={numPages}
                        value={currentPage}
                        onChange={(e) => goToPage(parseInt(e.target.value))}
                        className="w-20 text-center"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= numPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.min(3, scale + 0.25))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Canvas for current page */}
                  <div className="border rounded-lg overflow-auto max-h-96">
                    <canvas ref={canvasRef} className="max-w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page Gallery */}
          {pdfDocument && (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Page Gallery
                </CardTitle>
                <CardDescription>
                  Select pages for AI processing ({selectedPages.size} selected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Gallery Controls */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentGalleryPage(Math.max(1, currentGalleryPage - 1))}
                        disabled={currentGalleryPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        Pages {visiblePageNumbers[0] || 0}-{visiblePageNumbers[visiblePageNumbers.length - 1] || 0} of {numPages}
                        (Gallery page {currentGalleryPage} of {totalGalleryPages})
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentGalleryPage(Math.min(totalGalleryPages, currentGalleryPage + 1))}
                        disabled={currentGalleryPage >= totalGalleryPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={selectAllPages}
                      disabled={numPages === 0}
                    >
                      <Grid3X3 className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                  </div>

                  {/* Page Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                    {visiblePageNumbers.map(pageNum => {
                      const pageImage = pageImages.get(pageNum)
                      return (
                        <div key={pageNum} className="relative">
                          <div className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                            selectedPages.has(pageNum) ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                          }`}>
                            {pageImage ? (
                              <div className="relative">
                                <img
                                  src={pageImage.canvas.toDataURL()}
                                  alt={`Page ${pageNum}`}
                                  className="w-full h-auto"
                                  onClick={() => togglePageSelection(pageNum)}
                                />
                                <div className="absolute top-2 left-2">
                                  <Checkbox
                                    checked={selectedPages.has(pageNum)}
                                    onCheckedChange={() => togglePageSelection(pageNum)}
                                    className="bg-background/90"
                                  />
                                </div>
                                <div className="absolute bottom-1 right-1 bg-background/90 px-1 py-0.5 rounded text-xs font-medium">
                                  {pageNum}
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                                <div className="text-center">
                                  <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground animate-spin" />
                                  <p className="text-xs text-muted-foreground">Loading...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selection Actions */}
                  {selectedPages.size > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="secondary">
                        {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPages(new Set())}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gemini AI Configuration */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Gemini AI Analysis
              </CardTitle>
              <CardDescription>Configure prompt for AI analysis of selected pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">AI Analysis Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt for AI analysis"
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={processSelectedPagesWithGemini}
                  disabled={selectedPages.size === 0 || isProcessingGemini}
                  className="w-full bg-gradient-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isProcessingGemini ? 'Processing...' : `Process ${selectedPages.size} Selected Page${selectedPages.size !== 1 ? 's' : ''} with Gemini`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gemini AI Results */}
          {geminiResponses.size > 0 && (
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Gemini AI Analysis Results</CardTitle>
                <CardDescription>AI-generated analysis of selected pages</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="heatmap" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
                  </TabsList>

                  <TabsContent value="heatmap" className="space-y-4">
                    <HeatmapGrid />
                  </TabsContent>

                  <TabsContent value="detailed" className="space-y-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Array.from(geminiResponses.entries()).map(([pageNum, result]) => (
                        <div key={pageNum} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Page {pageNum}</h4>
                              {result.response?.subjectRelevance !== undefined && (
                                <Badge variant="secondary">
                                  {result.response.subjectRelevance}% relevance
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </Badge>
                          </div>
                          
                          {result.error ? (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-sm text-destructive">Error: {result.error}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(result.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const data = Array.from(geminiResponses.entries()).map(([pageNum, result]) => ({
                        pageNum,
                        ...result
                      }))
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const link = window.document.createElement('a')
                      link.href = url
                      link.download = `gemini-analysis-${new Date().toISOString().split('T')[0]}.json`
                      window.document.body.appendChild(link)
                      link.click()
                      window.document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results as JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-gradient-primary"
                onClick={() => goToPage(currentPage)}
                disabled={!pdfDocument}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Current Page
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => downloadPageAsPNG(currentPage)}
                disabled={!pdfDocument || isRasterizing}
              >
                <Download className="h-4 w-4 mr-2" />
                {isRasterizing ? 'Downloading...' : 'Download Page as PNG'}
              </Button>
              
              <Button variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Analysis Results
              </Button>
            </CardContent>
          </Card>

          {/* Processing Stats */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-base">Processing Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Pages</span>
                <span className="text-sm font-medium">{numPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pages Rasterized</span>
                <span className="text-sm font-medium">{pageImages.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pages Analyzed</span>
                <span className="text-sm font-medium">{geminiResponses.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selected Pages</span>
                <span className="text-sm font-medium">{selectedPages.size}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}