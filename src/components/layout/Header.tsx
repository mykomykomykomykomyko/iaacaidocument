import { Button } from "@/components/ui/button";
import { User, Home } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
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
          
          <nav className="flex items-center space-x-8pt">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-8pt" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/personas" ? "default" : "ghost"} 
              size="sm"
              asChild
            >
              <Link to="/personas">
                <User className="h-4 w-4 mr-8pt" />
                Personas
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>;
};