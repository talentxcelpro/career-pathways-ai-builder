import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Eye, Sparkles, Target, CheckCircle2, AlertTriangle, FileText, Lock, ShieldAlert } from "lucide-react";
import { validateSourceFidelity } from "@/services/resumeParsingService";

interface SourceFidelityBarProps {
  localData: any;
  onKeepOriginal?: () => void;
  onAIEnhance?: () => void;
  onATSOptimize?: () => void;
}

export const SourceFidelityBar: React.FC<SourceFidelityBarProps> = ({
  localData,
  onKeepOriginal,
  onAIEnhance,
  onATSOptimize
}) => {
  const [showSourceModal, setShowSourceModal] = useState(false);

  const report = validateSourceFidelity(localData?.rawSourceText || '', localData || {});
  const score = report.fidelityScore;
  const isBlocked = report.isMaterialFactBlocked;

  return (
    <div className={`w-full border-b px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
      isBlocked ? 'bg-rose-950/30 border-rose-500/30' : 'bg-emerald-950/20 border-emerald-500/20'
    }`}>
      {/* Left: Fidelity Status & Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold">
          {isBlocked ? (
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>⛔ MATERIAL FACT GATE: BLOCKED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>✓ UNIVERSAL SOURCE FIDELITY PASS</span>
            </span>
          )}
        </div>

        <Badge 
          variant="outline" 
          className={`font-bold px-2 py-0.5 text-[11px] ${
            isBlocked ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' :
            score >= 90 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' :
            'bg-amber-500/10 text-amber-600 border-amber-500/30'
          }`}
        >
          10D Fidelity Score: {score}%
        </Badge>

        {isBlocked && (
          <span className="text-[11px] text-rose-400 font-medium hidden md:inline">
            ({report.blockReason || 'Material facts unconfirmed'})
          </span>
        )}

        {!isBlocked && (
          <div className="hidden lg:flex items-center gap-2 text-muted-foreground text-[11px]">
            {report.checks.slice(0, 5).map((check, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {check.preserved ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                )}
                <span className={check.preserved ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {check.field}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: Explicit Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSourceModal(true)}
          className="h-7 text-[11px] font-semibold gap-1 border-border hover:bg-muted"
        >
          <Eye className="w-3 h-3 text-blue-500" />
          VIEW SOURCE PROVENANCE
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onKeepOriginal}
          className="h-7 text-[11px] font-semibold gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Keep Original Facts
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isBlocked}
          onClick={onAIEnhance}
          className="h-7 text-[11px] font-semibold gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          {isBlocked ? <Lock className="w-3 h-3" /> : null}
          AI Enhance
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isBlocked}
          onClick={onATSOptimize}
          className="h-7 text-[11px] font-semibold gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          <Target className="w-3 h-3 text-emerald-500" />
          {isBlocked ? <Lock className="w-3 h-3" /> : null}
          ATS Optimize
        </Button>
      </div>

      {/* View Source Provenance Modal */}
      <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="w-5 h-5 text-emerald-500" />
              Layer 1 — Raw Extracted Source Text & Provenance Lineage
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* Extraction Metadata */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border text-[11px]">
              <div>
                <span className="font-bold text-foreground">Extracted Document Volume: </span>
                <span className="text-muted-foreground">{report.metadata.characterCount} chars | {report.metadata.wordCount} words | ~{report.metadata.pageCount} page(s)</span>
              </div>
              <Badge variant="outline" className="font-bold">10D Score: {score}%</Badge>
            </div>

            {/* 10D Checklist */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
              <span className="font-bold text-foreground block mb-2">10-Dimensional Fact Verification Matrix</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {report.checks.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-background border border-border/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-foreground">{c.field} ({c.weight}%)</div>
                      <div className="text-muted-foreground">{c.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-foreground">Immutable Original Text Stream:</label>
              <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg text-[11px] leading-relaxed whitespace-pre-wrap font-mono max-h-[350px] overflow-y-auto border border-zinc-800">
                {localData?.rawSourceText || "Raw extracted document text stored in Layer 1 Master Memory."}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
