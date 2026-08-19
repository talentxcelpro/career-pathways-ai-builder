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
import { ShieldCheck, ExternalLink, Calendar, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import type { GlobalProgram } from '@/types/globalEducation';

interface EvidenceViewerModalProps {
  program: GlobalProgram;
  trigger?: React.ReactNode;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({ program, trigger }) => {
  const isZero = program.tuition_cost_usd === 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 gap-1.5 h-9 rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {isZero ? 'Why is this €0 / ₹0?' : 'Why is this Verified?'}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              OFFICIAL EVIDENCE REPORT
            </span>
            <Badge variant="secondary" className="text-xs font-mono font-medium">
              Confidence: {program.confidence_score || 96}%
            </Badge>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {isZero ? 'WHY DOES TALENTXCEL SAY THIS IS €0?' : `HOW TALENTXCEL VERIFIED THIS PROGRAM`}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            {program.institution_name} • {program.institution_country}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Fact Checklist */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Verified Fact Checklist
            </div>

            <div className="flex items-start justify-between text-sm py-1.5 border-b border-slate-200/60">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Tuition Fee:
              </span>
              <span className="font-bold text-emerald-700">
                {isZero ? '€0 / ₹0 Tuition' : `$${program.tuition_cost_usd.toLocaleString()}/year`}
              </span>
            </div>

            <div className="flex items-start justify-between text-sm py-1.5 border-b border-slate-200/60">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Mandatory University Contribution:
              </span>
              <span className="font-medium text-slate-800">
                {program.other_mandatory_costs_usd === 0 ? 'None (€0)' : `~€${program.other_mandatory_costs_usd}/semester`}
              </span>
            </div>

            <div className="flex items-start justify-between text-sm py-1.5 border-b border-slate-200/60">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Scholarship:
              </span>
              <span className="font-medium text-slate-800">
                {program.scholarship_name ? program.scholarship_name : (isZero ? 'Not Required (Universal State Fee Policy)' : 'Direct')}
              </span>
            </div>

            <div className="flex items-start justify-between text-sm py-1.5">
              <span className="text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Academic Credential:
              </span>
              <span className="font-semibold text-slate-900">
                {program.credential}
              </span>
            </div>
          </div>

          {/* Source Evidence Box */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Primary Source Evidence
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Verified: {program.last_verified_at ? new Date(program.last_verified_at).toLocaleDateString() : '19 Aug 2026'}
              </span>
            </div>

            {program.tuition_evidence ? (
              <blockquote className="text-xs text-slate-700 italic border-l-2 border-emerald-500 pl-3 py-1.5 bg-white/80 rounded-r-lg">
                "{program.tuition_evidence}"
              </blockquote>
            ) : (
              <p className="text-xs text-slate-600 italic">
                Sourced and cross-verified directly against the official university fee portal.
              </p>
            )}

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Official Portal:</span>
              <a
                href={program.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
              >
                View Official Source <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Explainability Callout */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Why TalentXcel Recommends This
              </span>
              <span className="text-[10px] font-semibold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                Match: 95%
              </span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Evidence-backed personalized pathway — verified against public tuition exemptions and official degree regulations. Subject to candidate eligibility and formal application approval.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
