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

  useEffect(() => {
    const runCheck = async () => {
      if (!open) return;
      setLoading(true);
      setResult(null);
      try {
        const { data, error } = await supabase.functions.invoke('ai-resume-analyzer', {
          body: {
            resumeContent: resume,
          },
        });
        if (error) throw error;
        setResult(data?.data || data);
      } catch (e: any) {
        console.error('ATS check failed:', e);
        toast.error('ATS check failed. Please try again later.');
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };
    runCheck();
  }, [open]);

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

            {result.keywords && (
              <div>
                <h4 className="text-sm font-medium mb-2">Keywords</h4>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="font-medium">Matched:</span>{' '}
                    {result.keywords.matched?.slice(0, 10).join(', ') || '—'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Missing:</span>{' '}
                    {result.keywords.missing?.slice(0, 10).join(', ') || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Recommendations:</span>{' '}
                    {result.keywords.recommendations?.slice(0, 10).join(', ') || '—'}
                  </div>
                </div>
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

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No result.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
