import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Users, CheckCircle } from "lucide-react";

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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Documents Indexed"
        value="1,247"
        icon={<FileText className="h-4 w-4" />}
        description="Impact assessments processed"
      />
      <StatCard
        title="Analyses Completed"
        value="89"
        icon={<Search className="h-4 w-4" />}
        description="Topic-based extractions"
      />
      <StatCard
        title="Active Personas"
        value="12"
        icon={<Users className="h-4 w-4" />}
        description="Specialist perspectives"
      />
      <StatCard
        title="Verified Reports"
        value="34"
        icon={<CheckCircle className="h-4 w-4" />}
        description="Human-validated analyses"
      />
    </div>
  );
};