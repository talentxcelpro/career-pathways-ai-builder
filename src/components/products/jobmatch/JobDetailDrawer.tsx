// src/components/products/jobmatch/JobDetailDrawer.tsx
// Comprehensive Job Detail Drawer & Modal for JobMatch OS
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Bookmark, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Clock, 
  Share2, 
  Zap, 
  GraduationCap, 
  HelpCircle,
  FileCode,
  Laptop,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompanyLogoAvatar } from './CompanyLogoAvatar';
import { toast } from 'sonner';

export interface JobDetailItem {
  id: string;
  title: string;
  company_name: string;
  location: string;
  location_city?: string;
  location_state?: string;
  employment_type?: string;
  is_remote?: boolean;
  work_mode?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  applicant_location_requirements?: string;
  min_experience?: number;
  max_experience?: number;
  department?: string;
  industry?: string;
  external_url?: string;
  skills_required?: string[];
  application_deadline?: string;
  expires_at?: string;
  created_at: string;
  job_summary?: string;
  description?: string;
  key_responsibilities?: string;
  must_have_requirements?: string;
  benefits_offered?: string;
}

interface JobDetailDrawerProps {
  job: JobDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobDetailItem) => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onLaunchMatch?: (job: JobDetailItem) => void;
  onLaunchInterviewPrep?: (job: JobDetailItem) => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  isSaved,
  onToggleSave,
  onLaunchMatch,
  onLaunchInterviewPrep
}) => {
  const [showStructuredData, setShowStructuredData] = useState(false);

  if (!isOpen || !job) return null;

  const getCountryCode = (location?: string): string => {
    const loc = (location || '').toLowerCase();
    if (loc.includes('united arab emirates') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) return 'AE';
    if (loc.includes('saudi arabia') || loc.includes('riyadh')) return 'SA';
    if (loc.includes('qatar') || loc.includes('doha')) return 'QA';
    if (loc.includes('oman') || loc.includes('muscat')) return 'OM';
    if (loc.includes('united states') || loc.includes('usa') || loc.includes('austin') || loc.includes('seattle') || loc.includes('new york') || loc.includes('san francisco') || loc.includes('san mateo')) return 'US';
    if (loc.includes('united kingdom') || loc.includes('london')) return 'GB';
    if (loc.includes('germany') || loc.includes('berlin') || loc.includes('amsterdam') || loc.includes('ireland')) return 'EU';
    return 'IN';
  };

  const countryCode = getCountryCode(job.location);
  const detectedCurrency = (job.salary_currency || '').toUpperCase() || (
    countryCode === 'AE' ? 'AED' :
    countryCode === 'SA' ? 'SAR' :
    countryCode === 'QA' ? 'QAR' :
    countryCode === 'OM' ? 'OMR' :
    countryCode === 'US' ? 'USD' :
    'INR'
  );

  const formatSalary = (min?: number, max?: number, currency?: string, location?: string) => {
    if (!min || min <= 0) return 'Competitive Compensation (Market Benchmarked)';
    const curr = (currency || '').toUpperCase() || detectedCurrency;

    if (curr === 'AED') {
      const minK = Math.round(min / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `AED ${minK}k – ${maxK}k / yr` : `AED ${minK}k / yr`;
    }
    if (curr === 'USD') {
      const minK = Math.round(min / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `$${minK}k – $${maxK}k / yr` : `$${minK}k / yr`;
    }
    if (curr === 'SAR') {
      const minK = Math.round(min / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `SAR ${minK}k – ${maxK}k / yr` : `SAR ${minK}k / yr`;
    }
    if (curr === 'QAR') {
      const minK = Math.round(min / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `QAR ${minK}k – ${maxK}k / yr` : `QAR ${minK}k / yr`;
    }
    if (curr === 'OMR') {
      const minK = Math.round(min / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `OMR ${minK}k – ${maxK}k / yr` : `OMR ${minK}k / yr`;
    }

    const minL = (min / 100000).toFixed(1);
    if (!max || max === min) return `₹${minL} LPA`;
    const maxL = (max / 100000).toFixed(1);
    return `₹${minL}L – ₹${maxL}L CTC`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/jobs/${job.id}`);
      toast.success('Job link copied to clipboard!');
    }
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `${window.location.origin}/jobs/${job.id}`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opening LinkedIn to share vacancy...');
  };

  // Structured Data Schema for verification
  const schemaJson = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      sameAs: job.external_url || 'https://jobs.talentxcel.in'
    },
    jobLocation: job.is_remote ? undefined : {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location_city || job.location || 'India',
        addressCountry: countryCode
      }
    },
    ...(job.is_remote ? { jobLocationType: 'TELECOMMUTE' } : {}),
    ...(job.applicant_location_requirements ? {
      applicantLocationRequirements: {
        '@type': 'Country',
        name: job.applicant_location_requirements
      }
    } : {}),
    datePosted: job.created_at,
    validThrough: job.expires_at || job.application_deadline,
    employmentType: job.employment_type || 'FULL_TIME',
    baseSalary: job.salary_min ? {
      '@type': 'MonetaryAmount',
      currency: detectedCurrency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max || job.salary_min,
        unitText: 'YEAR'
      }
    } : undefined
  };

  const drawerContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#E2E8F0] bg-[#F4F7FC]/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <CompanyLogoAvatar companyName={job.company_name} size="lg" className="mt-0.5" />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {job.company_name}
                </span>
                <a
                  href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(job.company_name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors"
                  title={`Find ${job.company_name} on LinkedIn`}
                >
                  <Linkedin className="w-3 h-3" />
                  <span>LinkedIn</span>
                </a>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Vacancy
                </Badge>
                {job.is_remote && (
                  <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 text-[10px] font-bold">
                    Remote Eligible
                  </Badge>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight leading-snug">
                {job.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location || 'India'}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.location)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLinkedIn}
              className="text-[#0A66C2] hover:text-[#004182] hover:bg-blue-50 h-8 w-8 p-0"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-[#64748B] hover:text-[#111827] h-8 w-8 p-0"
              title="Share Job"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleSave(job.id)}
              className={`h-8 w-8 p-0 ${isSaved ? 'text-amber-500 fill-amber-500' : 'text-[#64748B] hover:text-[#111827]'}`}
              title={isSaved ? 'Saved' : 'Save Job'}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#64748B] hover:text-[#111827] h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onApply(job)}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Direct Apply</span>
            </Button>
            {job.external_url && (
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#7138E8] px-3 py-2 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl transition-colors bg-white"
              >
                <span>Apply on Employer Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLinkedIn}
              className="text-xs font-semibold text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 rounded-xl flex items-center gap-1.5"
              title="Share opening on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LinkedIn</span>
            </Button>
            {onLaunchMatch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLaunchMatch(job)}
                className="text-xs font-semibold text-[#7138E8] border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Fit Analysis</span>
              </Button>
            )}
            {onLaunchInterviewPrep && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLaunchInterviewPrep(job)}
                className="text-xs font-semibold text-[#2563EB] border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Interview Prep</span>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-[#111827] text-sm">
          {/* Vacancy Core Overview */}
          <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Work Mode</span>
              <span className="font-semibold text-[#111827] capitalize">{job.work_mode || (job.is_remote ? 'Remote' : 'On-Site')}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Employment</span>
              <span className="font-semibold text-[#111827]">{job.employment_type || 'Full-Time'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Department</span>
              <span className="font-semibold text-[#111827]">{job.department || job.industry || 'Engineering'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748B] block">Application Closes</span>
              <span className="font-semibold text-[#111827]">
                {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'Active Ongoing'}
              </span>
            </div>
          </div>

          {/* Applicant Location & Visa Eligibility */}
          {job.applicant_location_requirements && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-bold block text-[#2563EB]">Applicant Eligibility & Visa Policy:</span>
              <span className="text-slate-700 leading-relaxed">{job.applicant_location_requirements}</span>
            </div>
          )}

          {/* Required Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Required Core Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_required.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-[#2563EB]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Role Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Role Overview</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
              {job.job_summary || 'Detailed role requirements and qualifications are provided on the employer application page.'}
            </p>
          </div>

          {/* Key Responsibilities (Only shown when available) */}
          {job.key_responsibilities && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Key Responsibilities</h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                {job.key_responsibilities}
              </p>
            </div>
          )}

          {/* Verification & Candidate Security */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>TalentXcel Verified Vacancy Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 leading-normal">
              This job posting has been verified against active recruitment records. Applications submitted through JobMatch OS are routed directly to authentic hiring coordinators without intermediary spam or ghost listings.
            </p>
          </div>

          {/* Technical Schema Inspector (Transparency) */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => setShowStructuredData(!showStructuredData)}
              className="text-[11px] font-bold text-[#64748B] hover:text-[#2563EB] flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showStructuredData ? 'Hide' : 'Inspect'} Structured Schema (JSON-LD)</span>
            </button>
            {showStructuredData && (
              <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] overflow-x-auto font-mono max-h-48">
                {JSON.stringify(schemaJson, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F4F7FC]/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#64748B]">
            <span className="font-bold text-[#111827]">{job.company_name}</span> • {job.location || 'India'}
          </div>
          <Button
            onClick={() => onApply(job)}
            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
          >
            Apply Now →
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : drawerContent;
};
