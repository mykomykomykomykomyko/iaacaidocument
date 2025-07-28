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

  const { data: personasCount } = useQuery({
    queryKey: ['personas-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('personas')
        .select('*', { count: 'exact', head: true });
      return count || 0;
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
        title="Documents Indexed"
        value={documentsCount?.toString() || "0"}
        icon={<FileText className="h-4 w-4" />}
        description="Impact assessments processed"
      />
      <StatCard
        title="Analyses Completed"
        value={analysesCount?.toString() || "0"}
        icon={<Search className="h-4 w-4" />}
        description="Topic-based extractions"
      />
      <StatCard
        title="Active Personas"
        value={personasCount?.toString() || "0"}
        icon={<Users className="h-4 w-4" />}
        description="Specialist perspectives"
      />
      <StatCard
        title="Verified Reports"
        value={verifiedCount?.toString() || "0"}
        icon={<CheckCircle className="h-4 w-4" />}
        description="Human-validated analyses"
      />
    </div>
  );
};