import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { ChatbotInterface } from "@/components/dashboard/ChatbotInterface";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, BarChart3, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
const Index = () => {
  const { t } = useLanguage();
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-8 lg:px-24pt py-8 sm:py-16 lg:py-32pt space-y-8 sm:space-y-16 lg:space-y-32pt animate-fade-in-up">
        

        <StatsCards />

        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-12 lg:space-y-24pt">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-1 sm:p-2 lg:p-4pt bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8pt px-3 sm:px-8 lg:px-16pt py-2 sm:py-6 lg:py-12pt transition-all duration-300 hover-lift">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">{t('tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8pt px-3 sm:px-8 lg:px-16pt py-2 sm:py-6 lg:py-12pt transition-all duration-300 hover-lift">
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">{t('tabs.upload')}</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8pt px-3 sm:px-8 lg:px-16pt py-2 sm:py-6 lg:py-12pt transition-all duration-300 hover-lift">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">{t('tabs.aiAnalyst')}</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8pt px-3 sm:px-8 lg:px-16pt py-2 sm:py-6 lg:py-12pt transition-all duration-300 hover-lift">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm lg:text-base font-medium">{t('tabs.analyses')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 sm:space-y-12 lg:space-y-24pt">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-32pt">
              <div className="space-y-6 sm:space-y-12 lg:space-y-24pt hover-lift">
                <DocumentUpload />
              </div>
              <div className="space-y-6 sm:space-y-12 lg:space-y-24pt hover-lift">
                <RecentAnalyses />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6 sm:space-y-12 lg:space-y-24pt">
            <DocumentUpload />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-32pt">
              <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.uploadGuidelines')}</h3>
                <ul className="space-y-2 sm:space-y-4 lg:space-y-8pt text-sm sm:text-base lg:text-body text-muted-foreground">
                  <li>{t('upload.maxFileSize')}</li>
                  <li>{t('upload.supportedFormats')}</li>
                  <li>{t('upload.preferredDocs')}</li>
                  <li>{t('upload.autoProcessing')}</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.processingStatus')}</h3>
                <div className="space-y-3 sm:space-y-6 lg:space-y-12pt text-sm sm:text-base lg:text-body">
                  <div className="flex items-center justify-between">
                    <span>{t('processing.docParsing')}</span>
                    <span className="text-primary">{t('processing.complete')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('processing.vectorIndexing')}</span>
                    <span className="text-primary">{t('processing.complete')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('processing.metadataExtraction')}</span>
                    <span className="text-primary">{t('processing.complete')}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6 sm:space-y-12 lg:space-y-24pt">
            <ChatbotInterface />
            <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
              <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.aiAnalystFeatures')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-16pt text-sm sm:text-base lg:text-body text-muted-foreground">
                <div>
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium text-foreground mb-2 sm:mb-4 lg:mb-8pt">{t('dashboard.documentAnalysis')}</h4>
                  <ul className="space-y-1 sm:space-y-2 lg:space-y-4pt">
                    <li>{t('ai.searchesUploaded')}</li>
                    <li>{t('ai.sourceReferences')}</li>
                    <li>{t('ai.contextualAnalysis')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base lg:text-lg font-medium text-foreground mb-2 sm:mb-4 lg:mb-8pt">{t('dashboard.onlineResearch')}</h4>
                  <ul className="space-y-1 sm:space-y-2 lg:space-y-4pt">
                    <li>{t('ai.searchesOnline')}</li>
                    <li>{t('ai.currentRegulations')}</li>
                    <li>{t('ai.bestPractices')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyses" className="space-y-6 sm:space-y-12 lg:space-y-24pt">
            <RecentAnalyses />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12 lg:gap-24pt">
              <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.analysisTypes')}</h3>
                <ul className="space-y-2 sm:space-y-4 lg:space-y-8pt text-sm sm:text-base lg:text-body text-muted-foreground">
                  <li>{t('analysis.impactAssessment')}</li>
                  <li>{t('analysis.comparativeAnalysis')}</li>
                  <li>{t('analysis.complianceReview')}</li>
                  <li>{t('analysis.riskAssessment')}</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.confidenceLevels')}</h3>
                <div className="space-y-2 sm:space-y-4 lg:space-y-8pt text-sm sm:text-base lg:text-body">
                  <div className="flex items-center justify-between">
                    <span>{t('confidence.high')}</span>
                    <span className="text-green-600">●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('confidence.medium')}</span>
                    <span className="text-yellow-600">●</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('confidence.low')}</span>
                    <span className="text-red-600">●</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-4 sm:p-8 lg:p-24pt rounded-lg hover-lift transition-all duration-400">
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-8 lg:mb-16pt">{t('dashboard.verification')}</h3>
                <ul className="space-y-2 sm:space-y-4 lg:space-y-8pt text-sm sm:text-base lg:text-body text-muted-foreground">
                  <li>{t('verification.humanReview')}</li>
                  <li>{t('verification.sourceTraceability')}</li>
                  <li>{t('verification.qualityScoring')}</li>
                  <li>{t('verification.auditTrail')}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};
export default Index;