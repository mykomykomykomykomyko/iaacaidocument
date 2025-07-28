import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { SearchInterface } from "@/components/dashboard/SearchInterface";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            AI Document Analysis Dashboard
          </h2>
          <p className="text-muted-foreground">
            Analyze Impact Assessment documents with specialized AI personas and semantic search
          </p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DocumentUpload />
            <SearchInterface />
          </div>
          
          <div className="space-y-8">
            <RecentAnalyses />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
