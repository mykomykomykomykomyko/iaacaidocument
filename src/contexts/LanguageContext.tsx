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
    
    // Tabs
    'tabs.overview': 'Overview',
    'tabs.upload': 'Upload',
    'tabs.aiAnalyst': 'AI Analyst',
    'tabs.analyses': 'Analyses',
    
    // Stats Cards
    'stats.documentsProcessed': 'Documents Processed',
    'stats.aiAnalyses': 'AI Analyses',
    'stats.fileFormats': 'File Formats',
    'stats.completedAnalyses': 'Completed Analyses',
    'stats.documentsDesc': 'HTML, Excel, PDF & text files analyzed',
    'stats.aiAnalysesDesc': 'AI-powered environmental assessments',
    'stats.fileFormatsDesc': 'Different document types supported',
    'stats.completedDesc': 'Successfully processed documents',
    
    // Document Upload
    'upload.title': 'Upload Document',
    'upload.recentAnalyses': 'Recent Analyses',
    'upload.viewAll': 'View All',
    'upload.noAnalyses': 'No analyses yet',
    'upload.getStarted': 'Upload documents to get started',
    'upload.viewReport': 'View Report',
    'upload.fileUpload': 'File Upload',
    'upload.plainText': 'Plain Text',
    'upload.textContent': 'Text Content',
    'upload.selectDocuments': 'Select Documents (Multiple files supported)',
    'upload.documentTitle': 'Document Title',
    'upload.description': 'Description (Optional)',
    'upload.autoAnalyze': 'Auto-analyze after upload',
    'upload.uploadBtn': 'Upload Documents',
    'upload.analyzeBtn': 'Analyze',
    'upload.viewBtn': 'View',
    'upload.deleteBtn': 'Delete',
    'upload.pasteText': 'Paste your text content here...',
    'upload.enterTitle': 'Enter document title',
    'upload.briefDesc': 'Brief description of the document',
    'upload.autoAnalyzeDesc': 'Automatically start AI analysis after upload completes',
    'upload.selectedFiles': 'Selected files:',
    'upload.totalSize': 'Total size:',
    'upload.characters': 'Characters:',
    'upload.size': 'Size:',
    'upload.recentDocs': 'Recent Documents',
    
    // ChatbotInterface  
    'chat.title': 'AI Analyst',
    'chat.selectPersona': 'Select persona',
    'chat.loading': 'Loading...',
    'chat.clearChat': 'Clear Chat',
    'chat.welcome': 'Welcome to AI Analyst',
    'chat.welcomeDesc': 'Ask me questions about your uploaded documents. If I don\'t find relevant information in your documents, I\'ll search online for additional data.',
    'chat.tryAsking': 'Try asking:',
    'chat.example1': '"What are the environmental impacts mentioned in my documents?"',
    'chat.example2': '"Tell me about water quality standards for mining operations"',
    'chat.example3': '"What mitigation measures are recommended for fish habitat?"',
    'chat.sourcesFromDocs': 'Sources from your documents:',
    'chat.onlineSource': 'Information sourced from online search',
    'chat.thinking': 'AI Analyst is thinking...',
    'chat.placeholder': 'Ask me anything about your documents or environmental topics...',
    'chat.howItWorks': 'How it works',
    'chat.searchDocs': 'First, I search through your uploaded documents',
    'chat.searchOnline': 'If no relevant information is found, I search online',
    'chat.provideSources': 'I provide sources and indicate when information comes from online',
    'chat.choosePersona': 'Choose a specialist persona for expert-level responses',
    'chat.tips': 'Tips for better responses',
    'chat.beSpecific': 'Be specific in your questions',
    'chat.askAbout': 'Ask about environmental impacts, regulations, or best practices',
    'chat.reference': 'Reference specific projects or locations when relevant',
    'chat.followUp': 'Use follow-up questions to dive deeper into topics',
    'chat.onlineSearchPerformed': 'Online search performed',
    'chat.onlineSearchDesc': 'I searched online for additional information to answer your question.',
    'chat.chatFailed': 'Chat failed',
    'chat.chatFailedDesc': 'Failed to get response from AI analyst',
    'chat.errorMessage': 'I apologize, but I encountered an error processing your request. Please try again.',
    
    // Upload Button States and Messages  
    'upload.uploadCompleteBtn': 'Upload Complete!',
    'upload.uploadFailedBtn': 'Upload Failed',
    'upload.createTextDoc': 'Create Text Document',
    'upload.analyzeExisting': 'Analyze Existing Documents',
    'upload.formats': 'Supported Formats (Auto-detected):',
    'upload.plainTextFormat': 'Plain Text - Paste text directly for quick analysis',
    'upload.htmlFormat': 'HTML files - Best for environmental assessments (MVP format)',
    'upload.excelFormat': 'Excel files - XLS, XLSX spreadsheets with data analysis', 
    'upload.textFormat': 'Text files - Plain text documents (TXT)',
    'upload.pdfFormat': 'PDF documents - Up to 500MB (basic text extraction)',
    'upload.formatNote': 'Use the toggle above to switch between file upload and plain text input. File types are automatically detected. Size limits: 100MB (HTML/Excel/TXT), 500MB (PDF).',
    'upload.deleteDocument': 'Delete Document',
    'upload.deleteConfirm': 'Are you sure you want to delete "{title}"? This action cannot be undone and will also delete all related analyses.',
    'upload.deleting': 'Deleting...',
    'upload.deleteDocumentBtn': 'Delete Document',
    
    // SearchInterface
    'search.title': 'Semantic Search',
    'search.placeholder': 'Ask about environmental impacts, fish habitat, water quality...',
    'search.searching': 'Searching...',
    'search.searchBtn': 'Search',
    'search.searchSummary': 'Search Summary',
    'search.searchResults': 'Search Results',
    'search.relevantPassages': 'Relevant Passages:',
    'search.noResults': 'No results found for "{query}". Try uploading some documents first or adjusting your search terms.',
    'search.enterQuery': 'Enter search query',
    'search.enterQueryDesc': 'Please enter a search query',
    'search.searchCompleted': 'Search completed',
    'search.searchCompletedDesc': 'Found {count} relevant results',
    'search.searchFailed': 'Search failed',
    'search.searchFailedDesc': 'Failed to perform search',
    'search.confidence': '{score}% confidence',
    
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
    
    // Tabs
    'tabs.overview': 'Aperçu',
    'tabs.upload': 'Télécharger',
    'tabs.aiAnalyst': 'Analyste IA',
    'tabs.analyses': 'Analyses',
    
    // Stats Cards
    'stats.documentsProcessed': 'Documents traités',
    'stats.aiAnalyses': 'Analyses IA',
    'stats.fileFormats': 'Formats de fichiers',
    'stats.completedAnalyses': 'Analyses terminées',
    'stats.documentsDesc': 'Fichiers HTML, Excel, PDF et texte analysés',
    'stats.aiAnalysesDesc': 'Évaluations environnementales par IA',
    'stats.fileFormatsDesc': 'Différents types de documents pris en charge',
    'stats.completedDesc': 'Documents traités avec succès',
    
    // Document Upload
    'upload.title': 'Télécharger un document',
    'upload.recentAnalyses': 'Analyses récentes',
    'upload.viewAll': 'Voir tout',
    'upload.noAnalyses': 'Aucune analyse pour le moment',
    'upload.getStarted': 'Téléchargez des documents pour commencer',
    'upload.viewReport': 'Voir le rapport',
    'upload.fileUpload': 'Téléchargement de fichier',
    'upload.plainText': 'Texte brut',
    'upload.textContent': 'Contenu texte',
    'upload.selectDocuments': 'Sélectionner des documents (Plusieurs fichiers pris en charge)',
    'upload.documentTitle': 'Titre du document',
    'upload.description': 'Description (Optionnel)',
    'upload.autoAnalyze': 'Analyser automatiquement après téléchargement',
    'upload.uploadBtn': 'Télécharger les documents',
    'upload.analyzeBtn': 'Analyser',
    'upload.viewBtn': 'Voir',
    'upload.deleteBtn': 'Supprimer',
    'upload.pasteText': 'Collez votre contenu texte ici...',
    'upload.enterTitle': 'Entrez le titre du document',
    'upload.briefDesc': 'Brève description du document',
    'upload.autoAnalyzeDesc': 'Démarrer automatiquement l\'analyse IA après la fin du téléchargement',
    'upload.selectedFiles': 'Fichiers sélectionnés :',
    'upload.totalSize': 'Taille totale :',
    'upload.characters': 'Caractères :',
    'upload.size': 'Taille :',
    'upload.recentDocs': 'Documents récents',
    
    // ChatbotInterface  
    'chat.title': 'Analyste IA',
    'chat.selectPersona': 'Sélectionner un persona',
    'chat.loading': 'Chargement...',
    'chat.clearChat': 'Effacer la conversation',
    'chat.welcome': 'Bienvenue dans Analyste IA',
    'chat.welcomeDesc': 'Posez-moi des questions sur vos documents téléchargés. Si je ne trouve pas d\'informations pertinentes dans vos documents, je rechercherai en ligne pour des données supplémentaires.',
    'chat.tryAsking': 'Essayez de demander :',
    'chat.example1': '"Quels sont les impacts environnementaux mentionnés dans mes documents ?"',
    'chat.example2': '"Parlez-moi des normes de qualité de l\'eau pour les opérations minières"',
    'chat.example3': '"Quelles mesures d\'atténuation sont recommandées pour l\'habitat du poisson ?"',
    'chat.sourcesFromDocs': 'Sources de vos documents :',
    'chat.onlineSource': 'Informations provenant d\'une recherche en ligne',
    'chat.thinking': 'L\'analyste IA réfléchit...',
    'chat.placeholder': 'Demandez-moi tout ce que vous voulez sur vos documents ou les sujets environnementaux...',
    'chat.howItWorks': 'Comment ça marche',
    'chat.searchDocs': 'D\'abord, je cherche dans vos documents téléchargés',
    'chat.searchOnline': 'Si aucune information pertinente n\'est trouvée, je cherche en ligne',
    'chat.provideSources': 'Je fournis des sources et indique quand les informations proviennent d\'en ligne',
    'chat.choosePersona': 'Choisissez un persona spécialisé pour des réponses de niveau expert',
    'chat.tips': 'Conseils pour de meilleures réponses',
    'chat.beSpecific': 'Soyez spécifique dans vos questions',
    'chat.askAbout': 'Demandez au sujet des impacts environnementaux, réglementations ou meilleures pratiques',
    'chat.reference': 'Référencez des projets ou emplacements spécifiques quand pertinent',
    'chat.followUp': 'Utilisez des questions de suivi pour approfondir les sujets',
    'chat.onlineSearchPerformed': 'Recherche en ligne effectuée',
    'chat.onlineSearchDesc': 'J\'ai cherché en ligne pour des informations supplémentaires pour répondre à votre question.',
    'chat.chatFailed': 'Conversation échouée',
    'chat.chatFailedDesc': 'Impossible d\'obtenir une réponse de l\'analyste IA',
    'chat.errorMessage': 'Je m\'excuse, mais j\'ai rencontré une erreur en traitant votre demande. Veuillez réessayer.',
    
    // Upload Button States and Messages  
    'upload.uploadCompleteBtn': 'Téléchargement terminé !',
    'upload.uploadFailedBtn': 'Échec du téléchargement',
    'upload.createTextDoc': 'Créer un document texte',
    'upload.analyzeExisting': 'Analyser les documents existants',
    'upload.formats': 'Formats pris en charge (Détection automatique) :',
    'upload.plainTextFormat': 'Texte brut - Collez le texte directement pour une analyse rapide',
    'upload.htmlFormat': 'Fichiers HTML - Idéal pour les évaluations environnementales (format MVP)',
    'upload.excelFormat': 'Fichiers Excel - Feuilles de calcul XLS, XLSX avec analyse de données', 
    'upload.textFormat': 'Fichiers texte - Documents en texte brut (TXT)',
    'upload.pdfFormat': 'Documents PDF - Jusqu\'à 500 Mo (extraction de texte de base)',
    'upload.formatNote': 'Utilisez le commutateur ci-dessus pour basculer entre le téléchargement de fichier et la saisie de texte brut. Les types de fichiers sont détectés automatiquement. Limites de taille : 100 Mo (HTML/Excel/TXT), 500 Mo (PDF).',
    'upload.deleteDocument': 'Supprimer le document',
    'upload.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer "{title}" ? Cette action ne peut pas être annulée et supprimera également toutes les analyses liées.',
    'upload.deleting': 'Suppression...',
    'upload.deleteDocumentBtn': 'Supprimer le document',
    
    // SearchInterface
    'search.title': 'Recherche sémantique',
    'search.placeholder': 'Demandez au sujet des impacts environnementaux, habitat du poisson, qualité de l\'eau...',
    'search.searching': 'Recherche...',
    'search.searchBtn': 'Rechercher',
    'search.searchSummary': 'Résumé de recherche',
    'search.searchResults': 'Résultats de recherche',
    'search.relevantPassages': 'Passages pertinents :',
    'search.noResults': 'Aucun résultat trouvé pour "{query}". Essayez de télécharger des documents d\'abord ou d\'ajuster vos termes de recherche.',
    'search.enterQuery': 'Entrez une requête de recherche',
    'search.enterQueryDesc': 'Veuillez entrer une requête de recherche',
    'search.searchCompleted': 'Recherche terminée',
    'search.searchCompletedDesc': 'Trouvé {count} résultats pertinents',
    'search.searchFailed': 'Échec de la recherche',
    'search.searchFailedDesc': 'Impossible d\'effectuer la recherche',
    'search.confidence': '{score}% de confiance',
    
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