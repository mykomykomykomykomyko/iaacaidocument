import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const StatsCards = () => {
  const { data: documentsCount } = useQuery({
    queryKey: ['documents-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: analysesCount } = useQuery({
    queryKey: ['analyses-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: analysisTypesCount } = useQuery({
    queryKey: ['analysis-types-count'],
    queryFn: async () => {
      const { data } = await supabase
        .from('analyses')
        .select('analysis_type');
      const uniqueTypes = new Set(data?.map(a => a.analysis_type) || []);
      return uniqueTypes.size;
    }
  });

  const { data: verifiedCount } = useQuery({
    queryKey: ['verified-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      return count || 0;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Documents Processed"
        value={documentsCount?.toString() || "0"}
        icon={<FileText className="h-4 w-4" />}
        description="HTML, Excel, PDF & text files analyzed"
      />
      <StatCard
        title="AI Analyses"
        value={analysesCount?.toString() || "0"}
        icon={<Search className="h-4 w-4" />}
        description="AI-powered environmental assessments"
      />
      <StatCard
        title="File Formats"
        value={analysisTypesCount?.toString() || "0"}
        icon={<Users className="h-4 w-4" />}
        description="Different document types supported"
      />
      <StatCard
        title="Completed Analyses"
        value={verifiedCount?.toString() || "0"}
        icon={<CheckCircle className="h-4 w-4" />}
        description="Successfully processed documents"
      />
    </div>
  );
};