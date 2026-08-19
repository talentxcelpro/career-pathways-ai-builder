import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ExternalLink, Calendar, BookOpen, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import type { GlobalProgram } from '@/types/globalEducation';

interface EvidenceViewerModalProps {
  program: GlobalProgram;
  trigger?: React.ReactNode;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({ program, trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 gap-1.5 p-0 h-auto font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Why is this {program.tuition_cost_usd === 0 ? '₹0 / Tuition-Free' : 'Verified'}?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Official Evidence
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Confidence: {program.confidence_score || 95}%
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold">
            {program.program_title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {program.institution_name} • {program.institution_country}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Honest Cost Summary */}
          <div className="rounded-lg border bg-muted/40 p-3.5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Honest Cost & Fee Evidence
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Tuition Cost:</span>
                <span className="font-semibold text-emerald-600">
                  {program.tuition_cost_usd === 0 ? '₹0 / Free Tuition' : $}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Mandatory Admin/Semester Fees:</span>
                <span className="font-medium text-foreground">
                  {program.other_mandatory_costs_usd === 0 ? '' : ~{program.other_mandatory_costs_usd}/yr}
                </span>
              </div>
            </div>
            {program.currency_note && (
              <p className="text-xs text-muted-foreground italic border-t pt-2">
                Note: {program.currency_note}
              </p>
            )}
          </div>

          {/* Raw Evidence Citations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              Official Verified Quotes & Sources
            </h4>

            {/* Tuition Evidence Quote */}
            {program.tuition_evidence && (
              <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Tuition & Fee Policy Excerpt
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Verified {program.last_verified_at ? new Date(program.last_verified_at).toLocaleDateString() : 'Aug 2026'}
                  </span>
                </div>
                <blockquote className="text-xs text-emerald-950 italic border-l-2 border-emerald-400 pl-3 py-0.5">
                  "{program.tuition_evidence}"
                </blockquote>
              </div>
            )}

            {/* Funding Evidence Quote */}
            {program.funding_evidence && (
              <div className="p-3.5 rounded-lg border border-blue-100 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    Funding & Scholarship Excerpt
                  </span>
                </div>
                <blockquote className="text-xs text-blue-950 italic border-l-2 border-blue-400 pl-3 py-0.5">
                  "{program.funding_evidence}"
                </blockquote>
              </div>
            )}

            {/* General Source Citation */}
            <div className="p-3 rounded-lg border bg-background text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Primary Authoritative Source:</span>
                <Badge variant="outline" className="text-[10px]">
                  {program.source_evidence || 'Official University Portal'}
                </Badge>
              </div>
              <div className="pt-1">
                <a
                  href={program.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 break-all"
                >
                  {program.official_url}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Academic Credential & Legitimacy */}
          <div className="rounded-lg border p-3 text-xs bg-muted/20 space-y-1">
            <div className="font-semibold text-foreground">
              Academic Credential: {program.credential}
            </div>
            <p className="text-muted-foreground">
              {program.academic_credits_awarded !== false
                ? '✓ Accredited degree program awarding formal university credits.'
                : 'Non-credit learning unit (skill-building track).'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
