import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { EditorResume } from '@/types/editor-resume';
import { toast } from 'sonner';

interface ImproveSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: EditorResume;
  selectedSection: 'summary' | 'experience' | 'skills' | 'projects';
  selectedItemIndex: number;
  onApply: (updated: EditorResume) => void;
}

export const ImproveSectionDialog: React.FC<ImproveSectionDialogProps> = ({
  open,
  onOpenChange,
  resume,
  selectedSection,
  selectedItemIndex,
  onApply,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const payload = useMemo(() => {
    switch (selectedSection) {
      case 'summary':
        return { type: 'summary', data: { summary: resume.personalInfo.summary } };
      case 'experience': {
        const item = resume.experience[selectedItemIndex] || {} as any;
        return { type: 'experience', data: { position: item.title, company: item.company, description: item.description } };
      }
      case 'skills':
        return { type: 'skills', data: { skills: resume.skills.technical } };
      case 'projects': {
        const item = resume.projects[selectedItemIndex] || {} as any;
        return { type: 'projects', data: { title: item.title, description: item.description, technologies: item.technologies } };
      }
      default:
        return { type: 'summary', data: { summary: resume.personalInfo.summary } };
    }
  }, [resume, selectedSection, selectedItemIndex]);

  useEffect(() => {
    const run = async () => {
      if (!open) return;
      setLoading(true);
      setSuggestion('');
      try {
        const { data, error } = await supabase.functions.invoke('ai-resume-content', {
          body: payload,
        });
        if (error) throw error;
        const content = data?.content || data?.suggestions || '';
        setSuggestion(content);
      } catch (e: any) {
        console.error('Improve section failed:', e);
        console.error('Error details:', e.message, e.stack);
        toast.error(`Failed to generate suggestions: ${e.message || 'Please try again later.'}`);
        // Don't close the dialog immediately, let user see error and try again
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open]);

  const handleApply = () => {
    const updated: EditorResume = JSON.parse(JSON.stringify(resume));
    if (selectedSection === 'summary') {
      updated.personalInfo.summary = suggestion;
    } else if (selectedSection === 'experience') {
      const item = updated.experience[selectedItemIndex];
      if (item) item.description = suggestion;
    } else if (selectedSection === 'skills') {
      updated.skills.technical = suggestion.split(/[,•\n]+/).map(s => s.trim()).filter(Boolean);
    } else if (selectedSection === 'projects') {
      const item = updated.projects[selectedItemIndex];
      if (item) item.description = suggestion;
    }
    onApply(updated);
    toast.success('Applied improvements');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Improve {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Generating suggestions…</span>
              <span>Processing</span>
            </div>
            <Progress value={70} />
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            <Textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={10} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleApply}>Apply Changes</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              No suggestions available. Please try again.
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
