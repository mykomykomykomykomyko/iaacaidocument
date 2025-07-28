import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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
        title={t('stats.documentsProcessed')}
        value={documentsCount?.toString() || "0"}
        icon={<FileText className="h-4 w-4" />}
        description={t('stats.documentsDesc')}
      />
      <StatCard
        title={t('stats.aiAnalyses')}
        value={analysesCount?.toString() || "0"}
        icon={<Search className="h-4 w-4" />}
        description={t('stats.aiAnalysesDesc')}
      />
      <StatCard
        title={t('stats.fileFormats')}
        value={analysisTypesCount?.toString() || "0"}
        icon={<Users className="h-4 w-4" />}
        description={t('stats.fileFormatsDesc')}
      />
      <StatCard
        title={t('stats.completedAnalyses')}
        value={verifiedCount?.toString() || "0"}
        icon={<CheckCircle className="h-4 w-4" />}
        description={t('stats.completedDesc')}
      />
    </div>
  );
};