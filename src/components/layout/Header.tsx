import { Button } from "@/components/ui/button";
export const Header = () => {
  return <header className="border-b bg-card/50 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-24pt py-16pt">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-16pt">
            <div className="flex items-center space-x-12pt">
              <div className="w-10 h-10 gradient-btn rounded-sm flex items-center justify-center hover-lift">
                <span className="text-primary-foreground font-bold text-base">IA</span>
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground tracking-tight">
                  AI Document Analysis Tool
                </h1>
                <p className="text-body text-muted-foreground">
                  Impact Assessment Agency of Canada
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            
            
            
            
            
          </nav>
        </div>
      </div>
    </header>;
};