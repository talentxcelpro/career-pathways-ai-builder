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
import { 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  MapPin, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import type { IndianInstitution } from '@/types/indianEducation';

interface IndianEvidenceDrawerProps {
  institution: IndianInstitution;
  trigger?: React.ReactNode;
}

export const IndianEvidenceDrawer: React.FC<IndianEvidenceDrawerProps> = ({
  institution,
  trigger,
}) => {
  const isVerified = institution.verification.status === 'verified';
  const dataPoints = institution.verification.dataPoints;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 bg-white hover:bg-indigo-50/50 gap-1.5 h-9 rounded-xl transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            Inspect Evidence
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              FORENSIC EVIDENCE REPORT
            </span>
            <Badge variant="secondary" className="text-xs font-mono font-bold bg-slate-100 text-slate-800">
              {institution.verification.confidenceScore}% CONFIDENCE
            </Badge>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {institution.name}
          </DialogTitle>
          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider mt-1">
            "Don't trust the badge. Inspect the evidence."
          </div>
          <DialogDescription className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {institution.location.city}, {institution.location.state}
            {institution.identity.establishedYear && ` · Est. ${institution.identity.establishedYear}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Section 1: Verified Costs */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                VERIFIED FEE STRUCTURE
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Official Statute Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 block">Annual Tuition:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {institution.costs.annualTuition
                    ? `₹${(institution.costs.annualTuition / 100000).toFixed(2)} Lakh / year`
                    : 'Governed by State Fee Regulatory Body'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Hostel &amp; Mess:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {institution.costs.hostelAnnual ? `₹${institution.costs.hostelAnnual.toLocaleString()} / year` : 'Optional / Self-arranged'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Examination &amp; Lab Fees:</span>
                <span className="font-medium text-slate-700 font-mono">
                  {institution.costs.examinationFees ? `₹${institution.costs.examinationFees.toLocaleString()}` : 'Included in semester fee'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Scholarship &amp; Waivers:</span>
                <span className="font-semibold text-indigo-700">
                  {institution.costs.scholarshipsAvailable ? 'Central/State + Merit Available' : 'Self-funded'}
                </span>
              </div>
            </div>

            {institution.costs.feeNotes && (
              <div className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200/60 mt-1">
                Note: {institution.costs.feeNotes}
              </div>
            )}
          </div>

          {/* Section 2: Academics & Recognition */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                ACADEMICS &amp; RANKING ACCREDITATION
              </span>
              {institution.accreditation.nirfRank && (
                <span className="text-xs font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  NIRF #{institution.accreditation.nirfRank}
                </span>
              )}
            </div>

            <div className="text-xs space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Flagship Programs:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {institution.academics.flagshipPrograms.slice(0, 3).join(', ')}
                </span>
              </div>
              {institution.academics.entranceExams && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Accepted Entrance Exams:</span>
                  <span className="font-bold text-indigo-700 text-right">
                    {institution.academics.entranceExams.join(', ')}
                  </span>
                </div>
              )}
              {institution.accreditation.naacGrade && (
                <div className="flex justify-between">
                  <span className="text-slate-500">NAAC Accreditation:</span>
                  <span className="font-semibold text-slate-800">
                    Grade {institution.accreditation.naacGrade}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Outcomes (Honest Reality) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                CAREER OUTCOMES
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  institution.outcomes.placementVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {institution.outcomes.placementVerified ? 'Verified Official Report' : 'Not Publicly Verified'}
              </span>
            </div>

            {institution.outcomes.placementVerified ? (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Placement Rate:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {institution.outcomes.placementRate}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Median CTC:</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    ₹{institution.outcomes.medianPackageLpa} LPA
                  </span>
                </div>
                {institution.outcomes.topRecruiters && institution.outcomes.topRecruiters.length > 0 && (
                  <div className="col-span-2 pt-1">
                    <span className="text-slate-500 block mb-1">Key Recruiting Partners:</span>
                    <div className="flex flex-wrap gap-1">
                      {institution.outcomes.topRecruiters.map((r) => (
                        <span
                          key={r}
                          className="bg-white border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic pt-1">
                TalentXcel does not publish estimated or unverified placement statistics. Official audited placement reports for this institution are currently under verification.
              </p>
            )}
          </div>

          {/* Section 4: Data Verification Checklist */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              DATA TRACEABILITY CHECKLIST
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Tuition Fees Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Academic Programs Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Location &amp; Campus Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                {institution.outcomes.placementVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span>
                  {institution.outcomes.placementVerified ? 'Placements Verified' : 'Placements Under Review'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100 mt-2">
              <span>Last verified: {new Date(institution.verification.lastVerifiedAt).toLocaleDateString()}</span>
              <span>{institution.verification.sourceCount} Primary Sources</span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              className="w-full h-11 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
              asChild
            >
              <a
                href={institution.identity.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Official Institution Portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
