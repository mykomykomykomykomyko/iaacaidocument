import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Sparkles, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  isOnlineSearch?: boolean;
  timestamp: Date;
}

export const ChatbotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [persona, setPersona] = useState("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const personas = {
    'general': 'Environmental Analyst',
    'fish-habitat': 'Fish Habitat Specialist',
    'water-quality': 'Water Quality Expert', 
    'caribou-biologist': 'Caribou Biologist',
    'indigenous-knowledge': 'Indigenous Knowledge Keeper'
  };

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
          persona: persona,
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
          title: "Online search performed",
          description: "I searched online for additional information to answer your question."
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat failed",
        description: error.message || "Failed to get response from AI analyst",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
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
              <span>AI Analyst</span>
            </CardTitle>
            <div className="flex items-center space-x-12pt">
              <Select value={persona} onValueChange={setPersona}>
                <SelectTrigger className="w-48">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(personas).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat}>
                  Clear Chat
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
                    <h3 className="font-medium text-foreground mb-8pt">Welcome to AI Analyst</h3>
                    <p className="text-body text-muted-foreground max-w-md">
                      Ask me questions about your uploaded documents. If I don't find relevant information in your documents, I'll search online for additional data.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-8pt text-sm text-muted-foreground">
                    <p className="italic">Try asking:</p>
                    <div className="space-y-4pt">
                      <p>• "What are the environmental impacts mentioned in my documents?"</p>
                      <p>• "Tell me about water quality standards for mining operations"</p>
                      <p>• "What mitigation measures are recommended for fish habitat?"</p>
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
                              <span>Sources from your documents:</span>
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
                              <span>Information sourced from online search</span>
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
                          <span className="text-body text-muted-foreground">AI Analyst is thinking...</span>
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
                placeholder="Ask me anything about your documents or environmental topics..."
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
                <span>How it works</span>
              </h4>
              <ul className="space-y-8pt text-body text-muted-foreground">
                <li>• First, I search through your uploaded documents</li>
                <li>• If no relevant information is found, I search online</li>
                <li>• I provide sources and indicate when information comes from online</li>
                <li>• Choose a specialist persona for expert-level responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-12pt flex items-center space-x-8pt">
                <MessageSquare className="h-4 w-4" />
                <span>Tips for better responses</span>
              </h4>
              <ul className="space-y-8pt text-body text-muted-foreground">
                <li>• Be specific in your questions</li>
                <li>• Ask about environmental impacts, regulations, or best practices</li>
                <li>• Reference specific projects or locations when relevant</li>
                <li>• Use follow-up questions to dive deeper into topics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};