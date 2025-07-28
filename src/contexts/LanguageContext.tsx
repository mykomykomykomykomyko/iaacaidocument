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
    'dashboard.title': 'AI Document Analysis Dashboard',
    'dashboard.subtitle': 'Analyze Impact Assessment documents with specialized AI personas and semantic search',
    'dashboard.overview': 'Overview',
    'dashboard.upload': 'Upload',
    'dashboard.aiAnalyst': 'AI Analyst',
    'dashboard.analyses': 'Analyses',
    'dashboard.uploadGuidelines': 'Upload Guidelines',
    'dashboard.processingStatus': 'Processing Status',
    'dashboard.aiAnalystFeatures': 'AI Analyst Features',
    'dashboard.documentAnalysis': 'Document Analysis',
    'dashboard.onlineResearch': 'Online Research',
    'dashboard.analysisTypes': 'Analysis Types',
    'dashboard.confidenceLevels': 'Confidence Levels',
    'dashboard.verification': 'Verification',
    
    // Upload Guidelines
    'upload.maxFileSize': '• Maximum file size: 500MB',
    'upload.supportedFormats': '• Supported formats: PDF, HTML, DOC/DOCX',
    'upload.preferredDocs': '• Environmental assessment documents preferred',
    'upload.autoProcessing': '• Files are automatically processed for semantic search',
    
    // Processing Status
    'processing.docParsing': 'Document Parsing',
    'processing.vectorIndexing': 'Vector Indexing',
    'processing.metadataExtraction': 'Metadata Extraction',
    'processing.complete': '✓ Complete',
    
    // AI Features
    'ai.searchesUploaded': '• Searches through your uploaded documents first',
    'ai.sourceReferences': '• Provides source references from your files',
    'ai.contextualAnalysis': '• Contextual analysis based on your data',
    'ai.searchesOnline': '• Searches online when documents lack information',
    'ai.currentRegulations': '• Current environmental regulations and standards',
    'ai.bestPractices': '• Best practices and industry guidelines',
    
    // Analysis Types
    'analysis.impactAssessment': '• Impact Assessment',
    'analysis.comparativeAnalysis': '• Comparative Analysis',
    'analysis.complianceReview': '• Compliance Review',
    'analysis.riskAssessment': '• Risk Assessment',
    
    // Confidence Levels
    'confidence.high': 'High (90%+)',
    'confidence.medium': 'Medium (75-89%)',
    'confidence.low': 'Low (<75%)',
    
    // Verification
    'verification.humanReview': '• Human expert review',
    'verification.sourceTraceability': '• Source traceability',
    'verification.qualityScoring': '• Quality scoring',
    'verification.auditTrail': '• Audit trail',
    
    // Personas Page
    'personas.title': 'AI Analysis Personas',
    'personas.subtitle': 'Manage specialized AI personas for document analysis',
    'personas.aiGenerate': 'AI Generate',
    'personas.createNew': 'Create New Persona',
    'personas.personaName': 'Persona Name *',
    'personas.avatarEmoji': 'Avatar Emoji',
    'personas.description': 'Description',
    'personas.expertiseAreas': 'Expertise Areas (comma-separated)',
    'personas.systemPrompt': 'System Prompt *',
    'personas.generateWithAI': 'Generate with AI',
    'personas.generating': 'Generating...',
    'personas.createPersona': 'Create Persona',
    'personas.editPersona': 'Edit Persona',
    'personas.systemPromptLabel': 'System Prompt:',
    'personas.noDescription': 'No description provided',
    'personas.default': 'Default',
    
    // Stats Cards
    'stats.documentsProcessed': 'Documents Processed',
    'stats.aiAnalyses': 'AI Analyses',
    'stats.fileFormats': 'File Formats',
    'stats.completedAnalyses': 'Completed Analyses',
    'stats.documentsDesc': 'HTML, Excel, PDF & text files analyzed',
    'stats.aiAnalysesDesc': 'AI-powered environmental assessments',
    'stats.fileFormatsDesc': 'Different document types supported',
    'stats.completedDesc': 'Successfully processed documents',
    
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
    'dashboard.title': 'Tableau de bord d\'analyse de documents par IA',
    'dashboard.subtitle': 'Analysez les documents d\'évaluation d\'impact avec des personas IA spécialisés et une recherche sémantique',
    'dashboard.overview': 'Aperçu',
    'dashboard.upload': 'Télécharger',
    'dashboard.aiAnalyst': 'Analyste IA',
    'dashboard.analyses': 'Analyses',
    'dashboard.uploadGuidelines': 'Directives de téléchargement',
    'dashboard.processingStatus': 'État du traitement',
    'dashboard.aiAnalystFeatures': 'Fonctionnalités de l\'analyste IA',
    'dashboard.documentAnalysis': 'Analyse de documents',
    'dashboard.onlineResearch': 'Recherche en ligne',
    'dashboard.analysisTypes': 'Types d\'analyse',
    'dashboard.confidenceLevels': 'Niveaux de confiance',
    'dashboard.verification': 'Vérification',
    
    // Upload Guidelines
    'upload.maxFileSize': '• Taille maximale de fichier : 500 Mo',
    'upload.supportedFormats': '• Formats pris en charge : PDF, HTML, DOC/DOCX',
    'upload.preferredDocs': '• Documents d\'évaluation environnementale privilégiés',
    'upload.autoProcessing': '• Les fichiers sont automatiquement traités pour la recherche sémantique',
    
    // Processing Status
    'processing.docParsing': 'Analyse du document',
    'processing.vectorIndexing': 'Indexation vectorielle',
    'processing.metadataExtraction': 'Extraction des métadonnées',
    'processing.complete': '✓ Terminé',
    
    // AI Features
    'ai.searchesUploaded': '• Recherche d\'abord dans vos documents téléchargés',
    'ai.sourceReferences': '• Fournit des références sources de vos fichiers',
    'ai.contextualAnalysis': '• Analyse contextuelle basée sur vos données',
    'ai.searchesOnline': '• Recherche en ligne quand les documents manquent d\'informations',
    'ai.currentRegulations': '• Réglementations et normes environnementales actuelles',
    'ai.bestPractices': '• Meilleures pratiques et directives de l\'industrie',
    
    // Analysis Types
    'analysis.impactAssessment': '• Évaluation d\'impact',
    'analysis.comparativeAnalysis': '• Analyse comparative',
    'analysis.complianceReview': '• Examen de conformité',
    'analysis.riskAssessment': '• Évaluation des risques',
    
    // Confidence Levels
    'confidence.high': 'Élevé (90%+)',
    'confidence.medium': 'Moyen (75-89%)',
    'confidence.low': 'Faible (<75%)',
    
    // Verification
    'verification.humanReview': '• Examen par un expert humain',
    'verification.sourceTraceability': '• Traçabilité des sources',
    'verification.qualityScoring': '• Notation de qualité',
    'verification.auditTrail': '• Piste d\'audit',
    
    // Personas Page
    'personas.title': 'Personas d\'analyse IA',
    'personas.subtitle': 'Gérer les personas IA spécialisés pour l\'analyse de documents',
    'personas.aiGenerate': 'Générer par IA',
    'personas.createNew': 'Créer un nouveau persona',
    'personas.personaName': 'Nom du persona *',
    'personas.avatarEmoji': 'Emoji d\'avatar',
    'personas.description': 'Description',
    'personas.expertiseAreas': 'Domaines d\'expertise (séparés par des virgules)',
    'personas.systemPrompt': 'Invite système *',
    'personas.generateWithAI': 'Générer avec IA',
    'personas.generating': 'Génération en cours...',
    'personas.createPersona': 'Créer un persona',
    'personas.editPersona': 'Modifier le persona',
    'personas.systemPromptLabel': 'Invite système :',
    'personas.noDescription': 'Aucune description fournie',
    'personas.default': 'Par défaut',
    
    // Stats Cards
    'stats.documentsProcessed': 'Documents traités',
    'stats.aiAnalyses': 'Analyses IA',
    'stats.fileFormats': 'Formats de fichiers',
    'stats.completedAnalyses': 'Analyses terminées',
    'stats.documentsDesc': 'Fichiers HTML, Excel, PDF et texte analysés',
    'stats.aiAnalysesDesc': 'Évaluations environnementales par IA',
    'stats.fileFormatsDesc': 'Différents types de documents pris en charge',
    'stats.completedDesc': 'Documents traités avec succès',
    
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