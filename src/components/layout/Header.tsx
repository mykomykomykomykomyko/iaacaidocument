import { Button } from "@/components/ui/button";
import { User, Home, Globe } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Header = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <div>
      {/* Top bar with language toggle */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-2">
          <div className="flex justify-end">
            <button 
              onClick={toggleLanguage}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              {language === 'en' ? t('header.french') : t('header.english')}
            </button>
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
                  {t('header.govCanada')}
                </div>
                <div className="text-sm text-muted-foreground leading-tight">
                  {t('header.govCanadaFr')}
                </div>
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
                {t('header.appTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('header.agency')}
              </p>
            </div>
            
            <nav className="flex items-center space-x-2">
              <Button 
                variant={location.pathname === "/" ? "default" : "ghost"} 
                size="sm"
                asChild
                className="text-white"
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  {t('header.dashboard')}
                </Link>
              </Button>
              
              <Button 
                onClick={toggleLanguage}
                variant="ghost" 
                size="sm"
                className="ml-2 text-white"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'FR' : 'EN'}
              </Button>
              
              <Button 
                variant={location.pathname === "/personas" ? "default" : "ghost"} 
                size="sm"
                asChild
                className="text-white"
              >
                <Link to="/personas">
                  <User className="h-4 w-4 mr-2" />
                  {t('header.personas')}
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};