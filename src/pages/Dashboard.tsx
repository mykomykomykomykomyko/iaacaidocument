import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { ChatbotInterface } from "@/components/dashboard/ChatbotInterface";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, MessageSquare, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="space-y-6 lg:space-y-12">
          <div className="text-center space-y-3 lg:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-foreground canada-heading">
              {t('dashboard.title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-sm lg:text-base xl:text-lg py-3 lg:py-4">
                <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">{t('dashboard.tabs.overview')}</span>
                <span className="sm:hidden">{t('dashboard.tabs.overviewShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2 text-sm lg:text-base xl:text-lg py-3 lg:py-4">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">{t('dashboard.tabs.upload')}</span>
                <span className="sm:hidden">{t('dashboard.tabs.uploadShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2 text-sm lg:text-base xl:text-lg py-3 lg:py-4">
                <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">{t('dashboard.tabs.search')}</span>
                <span className="sm:hidden">{t('dashboard.tabs.searchShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="analyses" className="flex items-center gap-2 text-sm lg:text-base xl:text-lg py-3 lg:py-4">
                <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">{t('dashboard.tabs.analyses')}</span>
                <span className="sm:hidden">{t('dashboard.tabs.analysesShort')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
              <StatsCards />
              <div className="text-center">
                <p className="text-sm lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('dashboard.overview.description')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
              <DocumentUpload />
              <div className="text-center">
                <p className="text-sm lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('dashboard.upload.guidelines')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
              <ChatbotInterface />
              <div className="text-center">
                <p className="text-sm lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('dashboard.search.description')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analyses" className="space-y-6 lg:space-y-8 mt-6 lg:mt-8">
              <RecentAnalyses />
              <div className="text-center">
                <p className="text-sm lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('dashboard.analyses.description')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;