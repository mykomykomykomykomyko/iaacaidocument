import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Clock, User } from "lucide-react";

interface Analysis {
  id: string;
  title: string;
  persona: string;
  topic: string;
  status: 'completed' | 'pending' | 'reviewing';
  timestamp: string;
  sourceCount: number;
  confidence: number;
}

const mockAnalyses: Analysis[] = [
  {
    id: '1',
    title: 'Caribou Habitat Impact Assessment - Trans Mountain Pipeline',
    persona: 'Caribou Biologist',
    topic: 'Wildlife Impact',
    status: 'completed',
    timestamp: '2 hours ago',
    sourceCount: 15,
    confidence: 92
  },
  {
    id: '2',
    title: 'Fish Habitat Compensation Measures - Site C Dam',
    persona: 'Fish Habitat Specialist',
    topic: 'Aquatic Ecosystem',
    status: 'reviewing',
    timestamp: '4 hours ago',
    sourceCount: 23,
    confidence: 87
  },
  {
    id: '3',
    title: 'Water Quality Monitoring Requirements - LNG Canada',
    persona: 'Water Quality Expert',
    topic: 'Water Resources',
    status: 'completed',
    timestamp: '1 day ago',
    sourceCount: 18,
    confidence: 95
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'reviewing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

export const RecentAnalyses = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Analyses</span>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAnalyses.map((analysis) => (
            <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground pr-4">{analysis.title}</h4>
                <Badge className={getStatusColor(analysis.status)}>
                  {analysis.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{analysis.persona}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{analysis.timestamp}</span>
                </div>
                <div>
                  <span>{analysis.sourceCount} sources</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{analysis.topic}</Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                    {analysis.confidence}% confidence
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};