import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, User, BarChart3, CheckCircle, AlertCircle, FileText, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { DocumentViewerDialog } from "./DocumentViewerDialog";
import { AnalysisPDFViewer } from "./AnalysisPDFViewer";
import { supabase } from "@/integrations/supabase/client";
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

interface Analysis {
  id: string;
  title: string;
  analysis_content?: string;
  analysis_type: string;
  status: string;
  created_at: string;
  confidence_score?: number;
  key_findings?: string[];
  document_id?: string;
  page_references?: Array<{page: number, text: string}>;
}

interface AnalysisDetailDialogProps {
  analysis: Analysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

export const AnalysisDetailDialog = ({ analysis, open, onOpenChange }: AnalysisDetailDialogProps) => {
  const [sourceDocument, setSourceDocument] = useState<Document | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    if (analysis?.document_id && open) {
      fetchSourceDocument(analysis.document_id);
    }
  }, [analysis?.document_id, open]);

  const fetchSourceDocument = async (documentId: string) => {
    setLoadingDocument(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        return;
      }

      setSourceDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleViewDocument = () => {
    if (sourceDocument) {
      setDocumentViewerOpen(true);
    }
  };

  const handlePageReferenceClick = (pageNumber: number) => {
    if (sourceDocument) {
      setSelectedPage(pageNumber);
      setPdfViewerOpen(true);
    }
  };

  if (!analysis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{analysis.title}</span>
            <Badge className={getStatusColor(analysis.status)}>
              {analysis.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-24pt">
          {/* Analysis Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16pt">
            <Card>
              <CardContent className="pt-24pt">
                <div className="flex items-center space-x-8pt">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-body font-medium">Analysis Type</p>
                    <p className="text-body text-muted-foreground capitalize">
                      {analysis.analysis_type.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-24pt">
                <div className="flex items-center space-x-8pt">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-body font-medium">Created</p>
                    <p className="text-body text-muted-foreground">
                      {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysis.confidence_score && (
              <Card>
                <CardContent className="pt-24pt">
                  <div className="flex items-center space-x-8pt">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-body font-medium">Confidence</p>
                      <p className={`text-body font-medium ${getConfidenceColor(analysis.confidence_score * 100)}`}>
                        {Math.round(analysis.confidence_score * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Source Document */}
          {sourceDocument && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-8pt">
                  <FileText className="h-5 w-5" />
                  <span>Source Document</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-16pt bg-muted rounded-lg">
                  <div className="flex items-center space-x-12pt">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-body">{sourceDocument.title}</p>
                      <p className="text-body text-muted-foreground">{sourceDocument.original_filename}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewDocument}
                    className="flex items-center space-x-8pt"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Document</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page References */}
          {analysis.page_references && analysis.page_references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-8pt">
                  <FileText className="h-5 w-5" />
                  <span>Referenced Pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8pt">
                  {analysis.page_references.map((ref, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-12pt h-auto text-left justify-start"
                      onClick={() => handlePageReferenceClick(ref.page)}
                    >
                      <div>
                        <div className="font-medium text-body">Page {ref.page}</div>
                        <div className="text-xs text-muted-foreground mt-2pt line-clamp-2">
                          {ref.text}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Findings */}
          {analysis.key_findings && analysis.key_findings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-8pt">
                  <CheckCircle className="h-5 w-5" />
                  <span>Key Findings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-8pt">
                  {analysis.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start space-x-8pt">
                      <AlertCircle className="h-4 w-4 text-primary mt-2pt flex-shrink-0" />
                      <span className="text-body">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Full Analysis Content */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {analysis.analysis_content ? (
                  <div className="text-body leading-relaxed">
                    <ReactMarkdown 
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-semibold mb-16pt mt-24pt">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold mb-12pt mt-20pt">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-body font-semibold mb-8pt mt-16pt">{children}</h3>,
                        p: ({ children }) => <p className="mb-12pt text-body leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="mb-12pt ml-20pt list-disc space-y-4pt">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-12pt ml-20pt list-decimal space-y-4pt">{children}</ol>,
                        li: ({ children }) => <li className="text-body">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-16pt my-12pt italic text-muted-foreground">{children}</blockquote>,
                        code: ({ children }) => <code className="bg-muted px-4pt py-2pt rounded text-xs font-mono">{children}</code>,
                        pre: ({ children }) => <pre className="bg-muted p-12pt rounded overflow-x-auto mb-12pt">{children}</pre>,
                      }}
                    >
                      {analysis.analysis_content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-32pt text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-16pt text-muted-foreground/50" />
                    <p className="text-body">No detailed analysis available</p>
                    <p className="text-body">The analysis may still be processing</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      <DocumentViewerDialog 
        document={sourceDocument}
        open={documentViewerOpen}
        onOpenChange={setDocumentViewerOpen}
      />

      <AnalysisPDFViewer
        document={sourceDocument}
        open={pdfViewerOpen}
        onOpenChange={setPdfViewerOpen}
        initialPage={selectedPage}
      />
    </Dialog>
  );
};