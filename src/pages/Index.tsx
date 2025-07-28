import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { ChatbotInterface } from "@/components/dashboard/ChatbotInterface";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, BarChart3, Upload } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-24pt py-32pt space-y-32pt animate-fade-in-up">
        <div className="space-y-12pt text-center">
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
            AI Document Analysis Dashboard
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze Impact Assessment documents with specialized AI personas and semantic search
          </p>
        </div>

        <StatsCards />

        <Tabs defaultValue="overview" className="space-y-24pt">
          <TabsList className="grid w-full grid-cols-4 p-4pt bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-8pt px-16pt py-12pt transition-all duration-300 hover-lift">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-8pt px-16pt py-12pt transition-all duration-300 hover-lift">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-8pt px-16pt py-12pt transition-all duration-300 hover-lift">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">AI Analyst</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center space-x-8pt px-16pt py-12pt transition-all duration-300 hover-lift">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Analyses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-24pt">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32pt">
              <div className="space-y-24pt hover-lift">
                <DocumentUpload />
              </div>
              <div className="space-y-24pt hover-lift">
                <RecentAnalyses />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-24pt">
            <DocumentUpload />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32pt">
              <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-lg font-medium mb-16pt">Upload Guidelines</h3>
                <ul className="space-y-8pt text-body text-muted-foreground">
                  <li>• Maximum file size: 500MB</li>
                  <li>• Supported formats: PDF, HTML, DOC/DOCX</li>
                  <li>• Environmental assessment documents preferred</li>
                  <li>• Files are automatically processed for semantic search</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-lg font-medium mb-16pt">Processing Status</h3>
                <div className="space-y-12pt text-body">
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

          <TabsContent value="search" className="space-y-24pt">
            <ChatbotInterface />
            <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
              <h3 className="text-lg font-medium mb-16pt">AI Analyst Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16pt text-body text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-8pt">Document Analysis</h4>
                  <ul className="space-y-4pt">
                    <li>• Searches through your uploaded documents first</li>
                    <li>• Provides source references from your files</li>
                    <li>• Contextual analysis based on your data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-8pt">Online Research</h4>
                  <ul className="space-y-4pt">
                    <li>• Searches online when documents lack information</li>
                    <li>• Current environmental regulations and standards</li>
                    <li>• Best practices and industry guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyses" className="space-y-24pt">
            <RecentAnalyses />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-24pt">
              <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-lg font-medium mb-16pt">Analysis Types</h3>
                <ul className="space-y-8pt text-body text-muted-foreground">
                  <li>• Impact Assessment</li>
                  <li>• Comparative Analysis</li>
                  <li>• Compliance Review</li>
                  <li>• Risk Assessment</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-lg font-medium mb-16pt">Confidence Levels</h3>
                <div className="space-y-8pt text-body">
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
              <div className="bg-muted/50 p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-lg font-medium mb-16pt">Verification</h3>
                <ul className="space-y-8pt text-body text-muted-foreground">
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
