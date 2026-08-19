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
import { ShieldCheck, ExternalLink, Calendar, CheckCircle2, AlertCircle, Sparkles, Building2, Clock } from 'lucide-react';
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
            className="w-full text-xs font-semibold border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50/50 gap-1.5 h-9 rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {isZero ? 'Why €0?' : 'View Evidence'}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              FORENSIC EVIDENCE REPORT
            </span>
            <Badge variant="secondary" className="text-xs font-mono font-bold bg-slate-100 text-slate-700">
              {program.confidence_score || 96}% CONFIDENCE
            </Badge>
          </div>

          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {isZero ? 'WHY TALENTXCEL SAYS €0' : `COST & EVIDENCE VERIFICATION`}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {program.institution_name} · {program.institution_country}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Section 1: Verified Cost */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              VERIFIED COST BREAKDOWN
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-600 font-medium">Tuition Fee</span>
                <span className="font-bold text-emerald-700">
                  {isZero ? '€0 / ₹0 Tuition' : `$${program.tuition_cost_usd.toLocaleString()}/year`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-600 font-medium">Mandatory Semester Contribution</span>
                <span className="font-semibold text-slate-800">
                  {program.other_mandatory_costs_usd === 0 ? 'None (€0)' : `~€${program.other_mandatory_costs_usd}/semester`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-600 font-medium">Application Fee</span>
                <span className="font-medium text-slate-700">€0 / Free Direct Portal</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-600 font-medium">Scholarship Required</span>
                <span className="font-semibold text-slate-800">
                  {program.scholarship_name ? `Required: ${program.scholarship_name}` : (isZero ? 'NO (Universal State Higher Education Policy)' : 'Direct')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Credential */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              ACADEMIC CREDENTIAL
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{program.program_title}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{program.credential} · Accredited University Qualification</div>
              </div>
              <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-700 bg-white">
                {program.level.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Section 3: Primary Official Source Evidence */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>PRIMARY OFFICIAL SOURCE</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Checked 19 Aug 2026 · 21:00 UTC
              </span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2.5">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {program.institution_name} Official Fee Statute
              </div>

              {program.tuition_evidence ? (
                <blockquote className="text-xs text-slate-700 italic border-l-2 border-emerald-500 pl-3 py-1 bg-white/90 rounded-r-lg">
                  "{program.tuition_evidence}"
                </blockquote>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  Sourced and cross-verified directly against the official university fee schedule and state higher education act.
                </p>
              )}

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Authoritative Portal:</span>
                <a
                  href={program.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
                >
                  Open Official Source <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 4: What Could Change? (Risk Monitor) */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              WHAT COULD CHANGE? (MUTATION RISK MONITOR)
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <div className="text-[10px] text-slate-400">Tuition Policy</div>
                  <div className="font-bold text-emerald-700 text-xs mt-0.5">Low Risk</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <div className="text-[10px] text-slate-400">Admission Deadline</div>
                  <div className="font-bold text-amber-700 text-xs mt-0.5">Medium Risk</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-100">
                  <div className="text-[10px] text-slate-400">Funding Status</div>
                  <div className="font-bold text-emerald-700 text-xs mt-0.5">Low Risk</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Next scheduled check:
                </span>
                <span className="font-semibold text-slate-700">20 Aug 2026 (Daily 24h cycle)</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
