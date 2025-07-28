import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.govCanada': 'Government of Canada',
    'header.govCanadaFr': 'Gouvernement du Canada',
    'header.appTitle': 'AI Document Analysis Tool',
    'header.agency': 'Impact Assessment Agency of Canada',
    'header.dashboard': 'Dashboard',
    'header.personas': 'Personas',
    'header.french': 'Français',
    'header.english': 'English',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to the AI Document Analysis Tool',
    'dashboard.description': 'Upload and analyze environmental assessment documents with AI-powered insights',
    'dashboard.recentAnalyses': 'Recent Analyses',
    'dashboard.uploadDocument': 'Upload Document',
    'dashboard.searchDocuments': 'Search Documents',
    'dashboard.viewAll': 'View All',
    
    // PDF Processing
    'pdf.upload': 'Upload PDF',
    'pdf.processing': 'Processing...',
    'pdf.analyze': 'Analyze with AI',
    'pdf.pages': 'pages',
    'pdf.selectAll': 'Select All',
    'pdf.download': 'Download',
    'pdf.results': 'Analysis Results',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  fr: {
    // Header
    'header.govCanada': 'Gouvernement du Canada',
    'header.govCanadaFr': 'Government of Canada',
    'header.appTitle': 'Outil d\'analyse de documents par IA',
    'header.agency': 'Agence d\'évaluation d\'impact du Canada',
    'header.dashboard': 'Tableau de bord',
    'header.personas': 'Personas',
    'header.french': 'Français',
    'header.english': 'Anglais',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue à l\'outil d\'analyse de documents par IA',
    'dashboard.description': 'Téléchargez et analysez des documents d\'évaluation environnementale avec des insights alimentés par l\'IA',
    'dashboard.recentAnalyses': 'Analyses récentes',
    'dashboard.uploadDocument': 'Télécharger un document',
    'dashboard.searchDocuments': 'Rechercher des documents',
    'dashboard.viewAll': 'Voir tout',
    
    // PDF Processing
    'pdf.upload': 'Télécharger PDF',
    'pdf.processing': 'Traitement en cours...',
    'pdf.analyze': 'Analyser avec IA',
    'pdf.pages': 'pages',
    'pdf.selectAll': 'Tout sélectionner',
    'pdf.download': 'Télécharger',
    'pdf.results': 'Résultats d\'analyse',
    
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};