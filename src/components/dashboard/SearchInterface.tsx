import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResult {
  document_id: string;
  document_title: string;
  relevant_passages: string[];
  explanation: string;
  confidence_score: number;
}

export const SearchInterface = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [persona, setPersona] = useState("general");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchSummary, setSummary] = useState("");
  const { toast } = useToast();

  const personas = {
    'general': 'Environmental Analyst',
    'fish-habitat': 'Fish Habitat Specialist',
    'water-quality': 'Water Quality Expert', 
    'caribou-biologist': 'Caribou Biologist',
    'indigenous-knowledge': 'Indigenous Knowledge Keeper'
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: t('search.enterQuery'),
        description: t('search.enterQueryDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { query, persona }
      });

      if (error) throw error;

      setResults(data.results || []);
      setSummary(data.summary || '');
      
      toast({
        title: t('search.searchCompleted'),
        description: t('search.searchCompletedDesc').replace('{count}', (data.results?.length || 0).toString())
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: t('search.searchFailed'),
        description: error.message || t('search.searchFailedDesc'),
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"; 
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="space-y-24pt">
      <Card className="hover-lift transition-all duration-400">
        <CardHeader>
          <CardTitle className="flex items-center space-x-8pt">
            <Search className="h-5 w-5" />
            <span>{t('search.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-16pt">
          <div className="flex flex-col lg:flex-row gap-12pt">
            <div className="flex-1">
              <Input
                placeholder={t('search.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="text-body"
              />
            </div>
            <div className="lg:w-64">
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(personas).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="gradient-btn flex items-center space-x-8pt"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isSearching ? t('search.searching') : t('search.searchBtn')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchSummary && (
        <Card className="bg-muted/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">{t('search.searchSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-muted-foreground leading-relaxed">{searchSummary}</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-16pt">
          <h3 className="text-xl font-medium">{t('search.searchResults')}</h3>
          <div className="grid gap-16pt">
            {results.map((result, index) => (
              <Card key={index} className="hover-lift transition-all duration-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-8pt">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{result.document_title}</CardTitle>
                    </div>
                    <Badge className={`${getConfidenceColor(result.confidence_score)} border`}>
                      {t('search.confidence').replace('{score}', result.confidence_score.toString())}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-12pt">
                  <p className="text-body text-muted-foreground">{result.explanation}</p>
                  
                  {result.relevant_passages.length > 0 && (
                    <div className="space-y-8pt">
                      <h4 className="font-medium">{t('search.relevantPassages')}</h4>
                      <div className="space-y-8pt">
                        {result.relevant_passages.map((passage, pIndex) => (
                          <blockquote key={pIndex} className="border-l-4 border-primary/30 pl-16pt bg-muted/20 p-12pt rounded-r">
                            <p className="text-body italic">{passage}</p>
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && query && !isSearching && (
        <Card className="bg-muted/20">
          <CardContent className="p-24pt text-center">
            <Search className="h-12 w-12 mx-auto mb-12pt text-muted-foreground" />
            <p className="text-body text-muted-foreground">
              {t('search.noResults').replace('{query}', query)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};