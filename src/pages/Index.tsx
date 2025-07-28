import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, BarChart3, Upload, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-12 lg:py-20 text-center">
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground canada-heading">
              IAAC.AI (iaac.ai)
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Advanced AI-powered document analysis and research tool for the Government of Canada
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button onClick={() => navigate('/dashboard')} size="lg" className="canada-btn-primary text-base lg:text-lg px-8 py-4">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="text-base lg:text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 lg:py-20">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Powerful tools designed for government document analysis and research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">Document Upload</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Securely upload and process various document formats including PDFs, Word documents, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">AI Analysis</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Leverage advanced AI to analyze documents, extract insights, and answer complex questions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">Analytics Dashboard</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Comprehensive dashboard with statistics, trends, and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">Secure & Compliant</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Built with government-grade security and compliance standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">Document Management</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Organize, search, and manage your document library with ease
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-8 w-8 lg:h-12 lg:w-12 text-primary mb-2" />
                <CardTitle className="text-lg lg:text-xl xl:text-2xl">Fast Processing</CardTitle>
                <CardDescription className="text-sm lg:text-base xl:text-lg">
                  Quick document processing and real-time analysis results
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-12 lg:py-20">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Simple steps to get started with document analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl lg:text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-sm lg:text-base xl:text-lg text-muted-foreground">
                Securely upload your documents to the platform
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl lg:text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm lg:text-base xl:text-lg text-muted-foreground">
                Our AI processes and analyzes your documents
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl lg:text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2">Get Insights</h3>
              <p className="text-sm lg:text-base xl:text-lg text-muted-foreground">
                Access detailed analysis and insights
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-20 text-center">
          <div className="bg-muted/50 rounded-lg p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access the dashboard to begin uploading and analyzing your documents
            </p>
            <Button onClick={() => navigate('/dashboard')} size="lg" className="canada-btn-primary text-base lg:text-lg px-8 py-4">
              Access Dashboard
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;