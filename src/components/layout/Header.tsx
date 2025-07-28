import { Button } from "@/components/ui/button";
import { User, Home, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  return (
    <div>
      {/* Top bar with language toggle */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-2">
          <div className="flex justify-end">
            <a href="#" className="text-sm text-primary hover:text-primary/80 underline">
              Français
            </a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <header className="bg-background border-b-4 border-primary">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Government of Canada Brand */}
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/e5155a7e-e6bf-455b-9018-36b7c397bb4a.png" 
                alt="Flag of Canada"
                className="w-10 h-6 object-cover"
              />
              <div className="flex flex-col">
                <div className="text-lg font-semibold text-foreground leading-tight">
                  Government of Canada
                </div>
                <div className="text-lg font-semibold text-foreground leading-tight">
                  Gouvernement du Canada
                </div>
              </div>
            </div>
            
            {/* Search and Navigation */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search Canada.ca"
                  className="w-64 pr-10"
                />
                <Button 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-3"
                  variant="default"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sub-navigation for app */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                AI Document Analysis Tool
              </h1>
              <p className="text-sm text-muted-foreground">
                Impact Assessment Agency of Canada
              </p>
            </div>
            
            <nav className="flex items-center space-x-2">
              <Button 
                variant={location.pathname === "/" ? "default" : "ghost"} 
                size="sm"
                asChild
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                variant={location.pathname === "/personas" ? "default" : "ghost"} 
                size="sm"
                asChild
              >
                <Link to="/personas">
                  <User className="h-4 w-4 mr-2" />
                  Personas
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};