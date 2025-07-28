import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFProcessingTester } from "./PDFProcessingTester";

interface Document {
  id: string;
  title: string;
  filename: string;
  original_filename: string;
  content?: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  storage_path?: string;
}

interface PDFViewerDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PDFViewerDialog = ({ document, open, onOpenChange }: PDFViewerDialogProps) => {
  if (!document) return null;

  const isPDF = document.mime_type.includes('pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto p-0">
        <DialogHeader className="p-6 pb-0 sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center space-x-2">
            <span>PDF Document Viewer</span>
          </DialogTitle>
        </DialogHeader>

        {isPDF ? (
          <div className="overflow-auto max-h-[calc(95vh-100px)]">
            <PDFProcessingTester documentProp={document} />
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-lg font-medium">Not a PDF Document</p>
            <p className="text-sm text-muted-foreground">
              This viewer is designed for PDF files only
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};