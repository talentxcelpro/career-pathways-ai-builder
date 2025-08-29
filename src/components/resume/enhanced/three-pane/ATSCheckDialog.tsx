import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { EditorResume } from '@/types/editor-resume';
import { toast } from 'sonner';

interface ATSCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: EditorResume;
}

export const ATSCheckDialog: React.FC<ATSCheckDialogProps> = ({ open, onOpenChange, resume }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runCheck = async () => {
    if (!open) return;
    setLoading(true);
    setResult(null);
    try {
      console.log('Starting ATS check...');
      const { data, error } = await supabase.functions.invoke('ai-ats-analyzer', {
        body: {
          resumeContent: JSON.stringify(resume),
          targetRole: 'Software Engineer',
          industry: 'Technology'
        },
      });
      console.log('ATS check response:', { data, error });
      if (error) throw error;
      setResult(data?.analysis || data);
      toast.success('ATS analysis completed!');
    } catch (e: any) {
      console.error('ATS check failed:', e);
      console.error('Error details:', e.message, e.stack);
      toast.error(`ATS check failed: ${e.message || 'Please try again later.'}`);
      // Don't close the dialog immediately, let user see error and try again
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, [open, resume]);

  const score = result?.overallScore ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ATS Check</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Analyzing your resume…</span>
              <span>Processing</span>
            </div>
            <Progress value={70} />
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant={score >= 85 ? 'default' : score >= 70 ? 'secondary' : 'outline'}>
                Overall ATS Score: {score}%
              </Badge>
            </div>

            {result.keywordAnalysis && (
              <div>
                <h4 className="text-sm font-medium mb-2">Keyword Analysis</h4>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="font-medium">Found:</span>{' '}
                    {result.keywordAnalysis.found?.slice(0, 10).join(', ') || '—'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Missing:</span>{' '}
                    {result.keywordAnalysis.missing?.slice(0, 10).join(', ') || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Suggestions:</span>{' '}
                    {result.keywordAnalysis.suggestions?.slice(0, 10).join(', ') || '—'}
                  </div>
                </div>
              </div>
            )}

            {result.strengths && result.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">Strengths</h4>
                <ul className="text-sm space-y-1">
                  {result.strengths.slice(0, 5).map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-blue-600">Improvement Suggestions</h4>
                <ul className="text-sm space-y-1">
                  {result.suggestions.slice(0, 5).map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.sections && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.sections).map(([name, section]: any) => (
                  <div key={name} className="rounded border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium capitalize">{name}</h5>
                      <Badge variant="outline">{section.score || 0}%</Badge>
                    </div>
                    {section.issues?.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium mb-1">Issues</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {section.issues.slice(0, 3).map((i: string, idx: number) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => runCheck()}>
                Try Again
              </Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              No analysis result available.
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
