import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { SearchInterface } from "@/components/dashboard/SearchInterface";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, BarChart3, Upload } from "lucide-react";

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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Analyses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <DocumentUpload />
              </div>
              <div className="space-y-6">
                <RecentAnalyses />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <DocumentUpload />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Upload Guidelines</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Maximum file size: 500MB</li>
                  <li>• Supported formats: PDF, HTML, DOC/DOCX</li>
                  <li>• Environmental assessment documents preferred</li>
                  <li>• Files are automatically processed for semantic search</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Processing Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Document Parsing</span>
                    <span className="text-primary">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vector Indexing</span>
                    <span className="text-primary">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Metadata Extraction</span>
                    <span className="text-primary">✓ Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <SearchInterface />
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Search Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Natural Language Queries</h4>
                  <ul className="space-y-1">
                    <li>• "What are the impacts on fish habitat?"</li>
                    <li>• "Show me caribou migration concerns"</li>
                    <li>• "Water quality monitoring requirements"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Specialist Perspectives</h4>
                  <ul className="space-y-1">
                    <li>• Fish Habitat Specialist</li>
                    <li>• Water Quality Expert</li>
                    <li>• Caribou Biologist</li>
                    <li>• Indigenous Knowledge Keeper</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyses" className="space-y-6">
            <RecentAnalyses />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Analysis Types</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Impact Assessment</li>
                  <li>• Comparative Analysis</li>
                  <li>• Compliance Review</li>
                  <li>• Risk Assessment</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Confidence Levels</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>High (90%+)</span>
                    <span className="text-green-600">●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium (75-89%)</span>
                    <span className="text-yellow-600">●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low (&lt;75%)</span>
                    <span className="text-red-600">●</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Verification</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Human expert review</li>
                  <li>• Source traceability</li>
                  <li>• Quality scoring</li>
                  <li>• Audit trail</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
