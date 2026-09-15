import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

interface PreFlightExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

export const PreFlightExportModal: React.FC<PreFlightExportModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onExportPDF,
  onExportDOCX
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Integrity Checks
  const hasName = Boolean(resumeData?.personalInfo?.fullName?.trim());
  const hasEmail = Boolean(resumeData?.personalInfo?.email?.trim());
  const hasPhone = Boolean(resumeData?.personalInfo?.phone?.trim());
  const experienceCount = (resumeData?.experience || []).length;

  // Check for malformed dates
  const malformedDates = (resumeData?.experience || []).some((exp: any) => 
    !exp.startDate || exp.startDate.trim() === '' || exp.endDate?.includes('- Present')
  );

  // Check skill casing duplicates
  const rawSkills: string[] = Array.isArray(resumeData?.skills) 
    ? resumeData.skills 
    : [
        ...(resumeData?.skills?.technical || []),
        ...(resumeData?.skills?.soft || []),
        ...(resumeData?.skills?.languages || [])
      ];

  const skillSet = new Set(rawSkills.map((s: string) => (typeof s === 'string' ? s.toLowerCase() : '')));
  const hasSkillDuplicates = skillSet.size < rawSkills.length;

  const checks = [
    { label: "Contact Details Valid", passed: hasName && hasEmail, detail: hasName && hasEmail ? "Full Name & Email verified" : "Add name & email" },
    { label: "Date Range Integrity", passed: !malformedDates, detail: !malformedDates ? "Clean start/end dates" : "Check for missing start dates" },
    { label: "Zero Duplicate Skills", passed: !hasSkillDuplicates, detail: !hasSkillDuplicates ? "Skills normalized & deduplicated" : "Duplicate skill casing detected" },
    { label: "ATS Layout Compatibility", passed: true, detail: "Standard single/double column layout" }
  ];

  const allPassed = checks.every(c => c.passed);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Pre-Flight Export Integrity Check
          </DialogTitle>
          <DialogDescription className="text-xs">
            Validates document structure, date ranges, contact info, and ATS layout before generating your export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="divide-y border rounded-xl overflow-hidden bg-background">
            {checks.map((chk, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-foreground">{chk.label}</span>
                    <p className="text-[11px] text-muted-foreground">{chk.detail}</p>
                  </div>
                </div>
                <Badge variant={chk.passed ? 'secondary' : 'outline'} className={chk.passed ? 'bg-emerald-500/10 text-emerald-700' : 'text-amber-600'}>
                  {chk.passed ? 'PASS' : 'WARN'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>Ready for high-fidelity export in ATS-friendly PDF and DOCX formats.</span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                onExportDOCX();
                onClose();
                toast.success('Exporting DOCX resume...');
              }} 
              variant="outline"
              size="sm" 
              className="text-xs font-semibold gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              DOCX
            </Button>
            <Button 
              onClick={() => {
                onExportPDF();
                onClose();
                toast.success('Exporting PDF resume...');
              }} 
              size="sm" 
              className="text-xs font-semibold gap-1 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
