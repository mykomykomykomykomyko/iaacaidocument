import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 500MB",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload process
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Document uploaded successfully",
            description: `${file.name} is being processed for analysis`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Document Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload Impact Assessment documents (PDF, HTML, DOC) up to 500MB
          </p>
          <input
            type="file"
            accept=".pdf,.html,.htm,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>Choose File</span>
            </Button>
          </label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Supported Formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF documents (up to 500MB)</li>
                <li>HTML files from Impact Assessment Registry</li>
                <li>Word documents (DOC, DOCX)</li>
                <li>Structured data (CSV, Excel)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};