import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [searchFilters, setSearchFilters] = useState<string[]>([]);

  const { data: personas } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSearch = () => {
    // This will be connected to the vector search API
    console.log('Searching:', { searchQuery, selectedPersona, searchFilters });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Semantic Document Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search for topics, impacts, or specific findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} className="px-6">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Analyst Persona
            </label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialist perspective" />
              </SelectTrigger>
              <SelectContent>
                {personas?.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{persona.name}</span>
                    </div>
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Document Type
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environmental-assessment">Environmental Assessment</SelectItem>
                <SelectItem value="impact-statement">Impact Statement</SelectItem>
                <SelectItem value="monitoring-report">Monitoring Report</SelectItem>
                <SelectItem value="technical-study">Technical Study</SelectItem>
                <SelectItem value="consultation-report">Consultation Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Active Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Fish Habitat</Badge>
            <Badge variant="secondary">Water Quality</Badge>
            <Badge variant="secondary">Recent (2023-2024)</Badge>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Filter className="h-3 w-3 mr-1" />
              Add Filter
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Smart Search:</strong> Use natural language queries like "What are the cumulative effects on caribou migration?" 
            or "Show me all fish habitat compensation measures." The AI will understand context and find relevant passages.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};