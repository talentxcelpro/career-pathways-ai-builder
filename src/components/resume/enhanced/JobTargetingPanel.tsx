import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useJobTargeting } from '@/hooks/useJobTargeting';
import { Loader2, Target, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface JobTargetingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export const JobTargetingPanel: React.FC<JobTargetingPanelProps> = ({ isOpen, onClose, resumeData }) => {
  const [jd, setJd] = useState('');
  const { isAnalyzing, result, analyze, reset } = useJobTargeting(resumeData);

  const missingCount = result?.missing?.length || 0;
  const matchedCount = result?.matched?.length || 0;

  const badgeVariant = useMemo(() => {
    const score = result?.matchScore ?? 0;
    if (score >= 80) return 'Good fit';
    if (score >= 60) return 'Close fit';
    return 'Needs work';
  }, [result?.matchScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { onClose(); reset(); }} />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-background border-l shadow-xl flex flex-col">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Job Description Targeting</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => { onClose(); reset(); }}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 grid gap-5">
          <section className="grid gap-3">
            <label htmlFor="jd" className="text-sm text-muted-foreground">Paste the job description</label>
            <textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job posting here..."
              className="min-h-[160px] rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{jd.length} characters</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setJd('')}>Clear</Button>
                <Button size="sm" onClick={() => analyze(jd)} disabled={isAnalyzing}>
                  {isAnalyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Analyze
                </Button>
              </div>
            </div>
          </section>

          {result && (
            <section className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Match score</p>
                  <p className="text-2xl font-semibold">{Math.round(result.matchScore)}%</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border">{badgeVariant}</span>
              </div>

              <div className="grid gap-3">
                <h3 className="font-medium">Keyword coverage</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matched.map((k) => (
                    <span key={`m-${k}`} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {k}
                    </span>
                  ))}
                  {missingCount > 0 && result.missing.map((k) => (
                    <span key={`x-${k}`} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> {k}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Matched {matchedCount} • Missing {missingCount}</p>
              </div>

              {result.recommendations?.length > 0 && (
                <div className="grid gap-2">
                  <h3 className="font-medium">Recommendations</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground grid gap-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sectionsToUpdate?.length > 0 && (
                <div className="grid gap-3">
                  <h3 className="font-medium">Suggested edits by section</h3>
                  <div className="grid gap-3">
                    {result.sectionsToUpdate.map((s, i) => (
                      <div key={i} className="rounded-md border p-3">
                        <p className="text-sm font-medium capitalize">{s.section}</p>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground grid gap-1 mt-2">
                          {s.suggestions.map((sg, j) => (
                            <li key={j}>{sg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        <footer className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Close</Button>
          {result && <Button onClick={() => { onClose(); }}>Apply Manually</Button>}
        </footer>
      </aside>
    </div>
  );
};
