// src/components/navigation/RelatedSubdomainLinks.tsx
// Invariant: Emits static, crawlable cross-subdomain links with exact-match anchor text
// directly in page bodies for immediate Googlebot crawl discovery.

import React from 'react';
import { ExternalLink, TrendingUp, DollarSign, FileText, Compass, GraduationCap, Briefcase } from 'lucide-react';

interface RelatedSubdomainLinksProps {
  role?: string;
  city?: string;
  location?: string;
  className?: string;
}

export const RelatedSubdomainLinks: React.FC<RelatedSubdomainLinksProps> = ({
  role = 'Software Engineer',
  city = '',
  location = '',
  className = '',
}) => {
  const targetCity = city || location || 'India';
  const roleSlug = role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const citySlug = targetCity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const links = [
    {
      title: `Live ${role} Vacancies in ${targetCity}`,
      url: `https://jobs.talentxcel.in/jobs/${roleSlug}/${citySlug}`,
      desc: `Explore verified openings with direct employer applications and transparent compensation in ${targetCity}.`,
      icon: Briefcase,
      badge: 'Jobs Universe',
    },
    {
      title: `${role} Salary & Percentile Curve in ${targetCity}`,
      url: `https://salary.talentxcel.in/salary/${roleSlug}/${citySlug}`,
      desc: `Benchmark entry, median, and 90th percentile salary breakdowns for ${role} professionals in ${targetCity}.`,
      icon: DollarSign,
      badge: 'Salary Intelligence',
    },
    {
      title: `Free ATS Resume Check for ${role}`,
      url: `https://resume.talentxcel.in/resume/ats-check?role=${encodeURIComponent(roleSlug)}`,
      desc: `Scan your resume against recruiter keyword models and ATS parsing criteria for ${role} roles.`,
      icon: FileText,
      badge: 'ATS Scanner',
    },
    {
      title: `${role} Career Progression Roadmap`,
      url: `https://careers.talentxcel.in/career-map/${roleSlug}`,
      desc: `Visual 5-stage progression roadmap from entry-level to staff leadership, required skills, and timeline.`,
      icon: Compass,
      badge: 'Career Pathways',
    },
    {
      title: `Top Higher Education Colleges in ${targetCity}`,
      url: `https://colleges.talentxcel.in/colleges`,
      desc: `Accredited universities, engineering colleges, cutoff trends, and placement CTC statistics in ${targetCity}.`,
      icon: GraduationCap,
      badge: 'Colleges Hub',
    },
  ];

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Explore Related Intelligence Across TalentXcel</span>
          </h3>
          <p className="text-xs text-slate-400">
            Deep-dive into verified cross-domain resources for {role} in {targetCity}.
          </p>
        </div>
        <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 rounded-full w-fit">
          Verified Cross-Domain
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.title}
              href={link.url}
              className="p-3.5 rounded-xl border border-slate-800 hover:border-blue-500/50 bg-slate-950/50 hover:bg-slate-900 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {link.badge}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {link.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {link.desc}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-400 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Explore on {link.badge} &rarr;
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
