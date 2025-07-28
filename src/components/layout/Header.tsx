import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IA</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  AI Document Analysis Tool
                </h1>
                <p className="text-sm text-muted-foreground">
                  Impact Assessment Agency of Canada
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Documents
            </Button>
            <Button variant="ghost" size="sm">
              Analysis
            </Button>
            <Button variant="ghost" size="sm">
              Personas
            </Button>
            <Button variant="ghost" size="sm">
              Reports
            </Button>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};