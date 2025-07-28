import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Sparkles, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  isOnlineSearch?: boolean;
  timestamp: Date;
}

interface Persona {
  id: string;
  name: string;
  description?: string;
  avatar_emoji?: string;
}

export const ChatbotInterface = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [persona, setPersona] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch personas from database
  const { data: personas, isLoading: personasLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('id, name, description, avatar_emoji')
        .order('name');
      
      if (error) throw error;
      return data as Persona[];
    }
  });

  // Set default persona when personas are loaded
  useEffect(() => {
    if (personas && personas.length > 0 && !persona) {
      setPersona(personas[0].id);
    }
  }, [personas, persona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-analyst-chat', {
        body: {
          message: inputMessage,
          persona_id: persona,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        isOnlineSearch: data.isOnlineSearch,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.isOnlineSearch) {
        toast({
          title: t('chat.onlineSearchPerformed'),
          description: t('chat.onlineSearchDesc')
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: t('chat.chatFailed'),
        description: error.message || t('chat.chatFailedDesc'),
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.errorMessage'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-24pt">
      <Card className="hover-lift transition-all duration-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-8pt">
              <MessageSquare className="h-5 w-5" />
              <span>{t('chat.title')}</span>
            </CardTitle>
            <div className="flex items-center space-x-12pt">
              <Select value={persona} onValueChange={setPersona} disabled={personasLoading}>
                <SelectTrigger className="w-48">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={personasLoading ? t('chat.loading') : t('chat.selectPersona')} />
                </SelectTrigger>
                <SelectContent>
                  {personas?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center space-x-8pt">
                        {p.avatar_emoji && <span>{p.avatar_emoji}</span>}
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  {t('chat.clearChat')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-16pt">
          {/* Chat Messages */}
          <Card className="h-96 border-muted">
            <ScrollArea className="h-full p-16pt">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-12pt">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-foreground mb-8pt">{t('chat.welcome')}</h3>
                    <p className="text-body text-muted-foreground max-w-md">
                      {t('chat.welcomeDesc')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-8pt text-sm text-muted-foreground">
                    <p className="italic">{t('chat.tryAsking')}</p>
                    <div className="space-y-4pt">
                      <p>• {t('chat.example1')}</p>
                      <p>• {t('chat.example2')}</p>
                      <p>• {t('chat.example3')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-16pt">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-12pt ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-12pt ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-body whitespace-pre-wrap">{message.content}</div>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-8pt pt-8pt border-t border-muted-foreground/20">
                            <div className="flex items-center space-x-4pt text-xs text-muted-foreground mb-4pt">
                              <FileText className="h-3 w-3" />
                              <span>{t('chat.sourcesFromDocs')}</span>
                            </div>
                            <ul className="text-xs space-y-2pt">
                              {message.sources.map((source, idx) => (
                                <li key={idx} className="truncate">• {source}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {message.isOnlineSearch && (
                          <div className="mt-8pt pt-8pt border-t border-muted-foreground/20">
                            <div className="flex items-center space-x-4pt text-xs text-muted-foreground">
                              <Search className="h-3 w-3" />
                              <span>{t('chat.onlineSource')}</span>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-4pt">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-start space-x-12pt">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-12pt">
                        <div className="flex items-center space-x-8pt">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-body text-muted-foreground">{t('chat.thinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </Card>

          {/* Input Area */}
          <div className="flex items-center space-x-8pt">
            <div className="flex-1">
              <Input
                placeholder={t('chat.placeholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="text-body"
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="gradient-btn flex items-center space-x-8pt"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="p-24pt">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24pt">
            <div>
              <h4 className="font-medium text-foreground mb-12pt flex items-center space-x-8pt">
                <Sparkles className="h-4 w-4" />
                <span>{t('chat.howItWorks')}</span>
              </h4>
              <ul className="space-y-8pt text-body text-muted-foreground">
                <li>• {t('chat.searchDocs')}</li>
                <li>• {t('chat.searchOnline')}</li>
                <li>• {t('chat.provideSources')}</li>
                <li>• {t('chat.choosePersona')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-12pt flex items-center space-x-8pt">
                <MessageSquare className="h-4 w-4" />
                <span>{t('chat.tips')}</span>
              </h4>
              <ul className="space-y-8pt text-body text-muted-foreground">
                <li>• {t('chat.beSpecific')}</li>
                <li>• {t('chat.askAbout')}</li>
                <li>• {t('chat.reference')}</li>
                <li>• {t('chat.followUp')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};