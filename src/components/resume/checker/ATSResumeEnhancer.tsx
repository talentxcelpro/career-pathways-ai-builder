import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/useAIService';

interface ATSResumeEnhancerProps {
  initialData: any;
  onChange?: (data: any) => void;
}

export const ATSResumeEnhancer: React.FC<ATSResumeEnhancerProps> = ({ initialData, onChange }) => {
  const [resumeData, setResumeData] = useState<any>(initialData);
  const { enhanceResume, isProcessing } = useAIService();

  const handleEnhance = async () => {
    const current = resumeData;
    const resp = await enhanceResume(current, { sectionType: 'summary', enhancementType: 'ats' });
    if (!resp.success) {
      toast.error(resp.error || 'Enhancement failed');
      return;
    }

    let updated = resp.data as any;
    try {
      if (typeof updated === 'string') {
        // If the AI returned plain text, treat it as enhanced summary only
        updated = { ...current, ats: { ...current.ats, summary: updated } };
      }
      // If JSON, keep structure
      if (typeof updated === 'object' && updated) {
        setResumeData(updated);
        onChange?.(updated);
        toast.success('Summary enhanced for ATS');
      }
    } catch (e) {
      console.error('Parsing enhanced data failed:', e);
      toast.error('Could not apply AI changes');
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

        <div className="flex justify-end">
          <Button onClick={handleEnhance} disabled={isProcessing} size="sm">
            {isProcessing ? 'Enhancing…' : 'Enhance with AI'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
