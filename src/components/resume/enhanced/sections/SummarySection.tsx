import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SummarySectionProps {
  data: string;
  onChange: (summary: string) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  data,
  onChange
}) => {
  const handleImprove = () => {
    // TODO: Implement AI improvement
    console.log('Improving summary...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary" className="text-base font-medium">
          Professional Summary
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImprove}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Improve
        </Button>
      </div>
      
      <Textarea
        id="summary"
        value={data}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
        className="min-h-32 resize-none"
      />
      
      <div className="text-sm text-muted-foreground">
        <p>Tips for a great summary:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Keep it concise (2-4 sentences)</li>
          <li>Highlight your most relevant skills and experience</li>
          <li>Include your career goals or objectives</li>
          <li>Use action words and quantifiable achievements</li>
        </ul>
      </div>
    </div>
  );
};