import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  CheckCircle2, 
  Download, 
  FileText, 
  Linkedin, 
  MessageSquare, 
  Target, 
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetJobTitle: string;
  resumeData: any;
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

export const ApplicationPackModal: React.FC<ApplicationPackModalProps> = ({
  isOpen,
  onClose,
  targetJobTitle,
  resumeData,
  onExportPDF,
  onExportDOCX
}) => {
  const packItems = [
    { title: `Targeted Resume (${targetJobTitle || 'Target Job'})`, type: "PDF & DOCX", status: "Generated" },
    { title: "Custom Contextual Cover Letter", type: "Formatted Text", status: "Generated" },
    { title: "LinkedIn Headline & About Copy", type: "Social Format", status: "Ready" },
    { title: "Naukri.com Keyword Snippets", type: "India Search String", status: "Ready" },
    { title: "ATS Match & Evidence Gap Audit", type: "Detailed Report", status: "Verified" },
    { title: "Tailored STAR Interview Cheat Sheet", type: "Question & Answer Set", status: "Ready" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Package className="w-5 h-5 text-primary" />
            1-Click Job Application Package
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete job search package generated from your Master Career Identity for "{targetJobTitle || 'Target Position'}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="divide-y border rounded-xl overflow-hidden bg-background">
            {packItems.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">{item.title}</span>
                    <p className="text-[11px] text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>One job → One complete application pack. Zero duplicate data entry required.</span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                onExportDOCX();
                toast.success('Downloading Application Pack (DOCX)...');
              }} 
              variant="outline"
              size="sm" 
              className="text-xs font-semibold gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download DOCX Pack
            </Button>
            <Button 
              onClick={() => {
                onExportPDF();
                toast.success('Downloading Application Pack (PDF)...');
              }} 
              size="sm" 
              className="text-xs font-semibold gap-1 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Pack
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
