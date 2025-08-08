import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSectionEnhancer } from '@/hooks/useSectionEnhancer';

interface ATSResumeEnhancerProps {
  initialData: any;
  onChange?: (data: any) => void;
  resumeId?: string; // Needed to save versions & logs
}

export const ATSResumeEnhancer: React.FC<ATSResumeEnhancerProps> = ({ initialData, onChange, resumeId }) => {
  const [resumeData, setResumeData] = useState<any>(initialData);
  const [prevSummary, setPrevSummary] = useState<string | null>(null);
  const { enhanceSection, commitEnhancement, isLoading } = useSectionEnhancer();

  const handleEnhance = async () => {
    const current = resumeData?.ats?.summary || '';
    setPrevSummary(current);

    const enhanced = await enhanceSection({
      resumeId,
      section: 'summary',
      text: current,
      atsJson: resumeData,
    });

    const next = { ...resumeData, ats: { ...resumeData.ats, summary: enhanced } };
    setResumeData(next);
    onChange?.(next);
    toast.success('Enhanced summary (not yet saved)');
  };

  const handleApplyAndSave = async () => {
    if (!resumeId) {
      toast.error('Missing resumeId to save version');
      return;
    }
    const beforeText = prevSummary ?? '';
    const afterText = resumeData?.ats?.summary || '';
    const version = await commitEnhancement({
      resumeId,
      section: 'summary',
      beforeText,
      afterText,
      content: resumeData,
    });
    if (version) {
      setPrevSummary(null);
    }
  };

  const handleSummaryChange = (val: string) => {
    const next = { ...resumeData, ats: { ...resumeData.ats, summary: val } };
    setResumeData(next);
    onChange?.(next);
  };

  const profile = resumeData?.ats?.profile || {};

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" /> ATS Enhancer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium">Summary</label>
          <textarea
            className="mt-1 w-full rounded-md border p-2 text-sm"
            rows={4}
            value={resumeData?.ats?.summary || ''}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder={`Professional summary for ${profile.fullName || 'your profile'}`}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleEnhance} disabled={isLoading} size="sm">
            {isLoading ? 'Enhancing…' : 'Enhance with AI'}
          </Button>
          <Button onClick={handleApplyAndSave} disabled={isLoading || !resumeId} size="sm" variant="secondary">
            <Save className="mr-2 h-4 w-4" /> Apply & Save Version
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
