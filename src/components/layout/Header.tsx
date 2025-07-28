import { Button } from "@/components/ui/button";
import { User, Home, Flag } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  return (
    <header className="gc-header border-b-4 border-primary bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Government of Canada Brand */}
          <div className="flex items-center space-x-6">
            <div className="gc-logo">
              {/* Canada Flag Symbol */}
              <div className="w-8 h-6 bg-primary rounded-sm flex items-center justify-center relative">
                <Flag className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-foreground">
                  Government of Canada
                </div>
                <div className="text-sm text-muted-foreground">
                  Gouvernement du Canada
                </div>
              </div>
            </div>
            
            {/* Application Name */}
            <div className="border-l border-border pl-6 ml-6">
              <h1 className="text-lg font-semibold text-foreground">
                AI Document Analysis Tool
              </h1>
              <p className="text-sm text-muted-foreground">
                Impact Assessment Agency of Canada
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              asChild
              className="gc-btn-secondary"
            >
              <Link to="/" className="gc-link no-underline">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/personas" ? "default" : "ghost"} 
              size="sm"
              asChild
              className="gc-btn-secondary"
            >
              <Link to="/personas" className="gc-link no-underline">
                <User className="h-4 w-4 mr-2" />
                Personas
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};