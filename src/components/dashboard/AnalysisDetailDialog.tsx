import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, User, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Analysis {
  id: string;
  title: string;
  analysis_content?: string;
  analysis_type: string;
  status: string;
  created_at: string;
  confidence_score?: number;
  key_findings?: string[];
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
              <div className="prose prose-sm max-w-none">
                {analysis.analysis_content ? (
                  <div className="whitespace-pre-wrap text-body leading-relaxed">
                    {analysis.analysis_content}
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
    </Dialog>
  );
};