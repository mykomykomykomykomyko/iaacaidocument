import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Clock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Analysis {
  id: string;
  title: string;
  summary?: string;
  analysis_type: string;
  status: string;
  created_at: string;
  confidence_score?: number;
  key_findings?: string[];
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

const getPersonaDisplayName = (persona: string) => {
  const personaMap: Record<string, string> = {
    'fish-habitat': 'Fish Habitat Specialist',
    'water-quality': 'Water Quality Expert',
    'caribou-biologist': 'Caribou Biologist', 
    'indigenous-knowledge': 'Indigenous Knowledge Keeper',
    'general': 'Environmental Analyst'
  };
  return personaMap[persona] || 'Environmental Analyst';
};

export const RecentAnalyses = () => {
  const { data: analyses, isLoading, refetch } = useQuery({
    queryKey: ['recent-analyses'],
    refetchInterval: 5000, // Refresh every 5 seconds to show new analyses
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          title,
          summary,
          analysis_type,
          status,
          created_at,
          confidence_score,
          key_findings
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Analysis[];
    }
  });

  return (
    <Card className="hover-lift transition-all duration-400">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-8pt">
            <FileText className="h-5 w-5" />
            <span>Recent Analyses</span>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-16pt">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-16pt animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-8pt"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : analyses && analyses.length > 0 ? (
          <div className="space-y-16pt">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="border rounded-lg p-16pt hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-8pt">
                  <h4 className="font-medium text-foreground pr-16pt">
                    {analysis.title || 'Environmental Analysis'}
                  </h4>
                  <Badge className={getStatusColor(analysis.status)}>
                    {analysis.status}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-16pt text-body text-muted-foreground mb-12pt">
                  <div className="flex items-center space-x-4pt">
                    <User className="h-3 w-3" />
                    <span>{analysis.analysis_type || 'Environmental'}</span>
                  </div>
                  <div className="flex items-center space-x-4pt">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8pt">
                    <Badge variant="outline" className="capitalize">
                      {analysis.analysis_type.replace('-', ' ')}
                    </Badge>
                    {analysis.confidence_score && (
                      <span className={`text-body font-medium ${getConfidenceColor(analysis.confidence_score * 100)}`}>
                        {Math.round(analysis.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-4pt" />
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32pt text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-16pt text-muted-foreground/50" />
            <p className="text-body">No analyses yet</p>
            <p className="text-body">Upload documents to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};