// src/components/navigation/SubdomainMeshFooter.tsx
// High-Authority Cross-Subdomain Internal Link Mesh
// Invariant: Emits static, crawlable <a href="..."> links to pass Googlebot crawl equity from talentxcel.in to all 9 subdomains.

import React from 'react';

export const SubdomainMeshFooter: React.FC = () => {
  return (
    <div className="w-full bg-[#050811] border-t border-slate-800/80 text-slate-300 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">
              TalentXcel Global Career & Employment Ecosystem
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore specialized search universes across jobs, compensation intelligence, ATS resume tools, higher education, and verified credentials.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-3 py-1 rounded-full w-fit">
            9 Dedicated Product Universes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-xs">
          {/* Jobs Domain */}
          <div className="space-y-2">
            <strong className="text-slate-100 font-bold block mb-1">
              <a href="https://jobs.talentxcel.in" className="hover:text-blue-400 transition-colors">
                Jobs Universe &rarr;
              </a>
            </strong>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://jobs.talentxcel.in/jobs" className="hover:text-white transition-colors">
                  Live Job Vacancies
                </a>
              </li>
              <li>
                <a href="https://jobs.talentxcel.in/jobs/software-engineer/bangalore" className="hover:text-white transition-colors">
                  Software Engineer in Bangalore
                </a>
              </li>
              <li>
                <a href="https://jobs.talentxcel.in/jobs/freshers" className="hover:text-white transition-colors">
                  Fresher Jobs in India
                </a>
              </li>
              <li>
                <a href="https://jobs.talentxcel.in/jobs/data-analyst/hyderabad" className="hover:text-white transition-colors">
                  Data Analyst in Hyderabad
                </a>
              </li>
            </ul>
          </div>

          {/* Salary Domain */}
          <div className="space-y-2">
            <strong className="text-slate-100 font-bold block mb-1">
              <a href="https://salary.talentxcel.in" className="hover:text-blue-400 transition-colors">
                Salary Intelligence &rarr;
              </a>
            </strong>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://salary.talentxcel.in/salary" className="hover:text-white transition-colors">
                  Salary Guides & Percentiles
                </a>
              </li>
              <li>
                <a href="https://salary.talentxcel.in/salary/software-engineer/bangalore" className="hover:text-white transition-colors">
                  Software Engineer Pay in Bangalore
                </a>
              </li>
              <li>
                <a href="https://salary.talentxcel.in/salary/devops-engineer/pune" className="hover:text-white transition-colors">
                  DevOps Engineer Pay in Pune
                </a>
              </li>
              <li>
                <a href="https://salary.talentxcel.in/tools/salary-analyzer" className="hover:text-white transition-colors">
                  Salary Benchmark Tool
                </a>
              </li>
            </ul>
          </div>

          {/* Resume & ATS */}
          <div className="space-y-2">
            <strong className="text-slate-100 font-bold block mb-1">
              <a href="https://resume.talentxcel.in" className="hover:text-blue-400 transition-colors">
                ATS Resume Tools &rarr;
              </a>
            </strong>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://resume.talentxcel.in/resume/ats-check" className="hover:text-white transition-colors">
                  Free ATS Resume Scanner
                </a>
              </li>
              <li>
                <a href="https://resume.talentxcel.in/resume/software-engineer/ats-keywords" className="hover:text-white transition-colors">
                  Software Engineer ATS Keywords
                </a>
              </li>
              <li>
                <a href="https://resume.talentxcel.in/resume/templates" className="hover:text-white transition-colors">
                  Recruiter-Tested Templates
                </a>
              </li>
              <li>
                <a href="https://resume.talentxcel.in/resume/interview-prep" className="hover:text-white transition-colors">
                  Interview Preparation Suite
                </a>
              </li>
            </ul>
          </div>

          {/* Colleges & Education */}
          <div className="space-y-2">
            <strong className="text-slate-100 font-bold block mb-1">
              <a href="https://colleges.talentxcel.in" className="hover:text-blue-400 transition-colors">
                Higher Education &rarr;
              </a>
            </strong>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://colleges.talentxcel.in/colleges" className="hover:text-white transition-colors">
                  10,250+ College Directory
                </a>
              </li>
              <li>
                <a href="https://colleges.talentxcel.in/colleges/banaras-hindu-university-bhu" className="hover:text-white transition-colors">
                  BHU Varanasi Cutoffs & Fees
                </a>
              </li>
              <li>
                <a href="https://colleges.talentxcel.in/colleges/global-programs" className="hover:text-white transition-colors">
                  Global Degree Programs
                </a>
              </li>
              <li>
                <a href="https://learning.talentxcel.in" className="hover:text-white transition-colors">
                  Learning & Skill Pathways
                </a>
              </li>
            </ul>
          </div>

          {/* Govt & Employer OS */}
          <div className="space-y-2">
            <strong className="text-slate-100 font-bold block mb-1">
              <a href="https://employers.talentxcel.in" className="hover:text-blue-400 transition-colors">
                Employers & Government &rarr;
              </a>
            </strong>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://employers.talentxcel.in/recruiters" className="hover:text-white transition-colors">
                  TalentXcel Recruiter OS
                </a>
              </li>
              <li>
                <a href="https://government.talentxcel.in/government-jobs" className="hover:text-white transition-colors">
                  Government Recruitment Notices
                </a>
              </li>
              <li>
                <a href="https://government.talentxcel.in/government-jobs/exams/upsc-2026" className="hover:text-white transition-colors">
                  UPSC 2026 Examination Notice
                </a>
              </li>
              <li>
                <a href="https://passport.talentxcel.in/passport" className="hover:text-white transition-colors">
                  Verified Career Passport
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>&copy; 2026 TalentXcel Global Professional Network. All subdomains actively indexed.</span>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/directory" className="text-blue-400 hover:text-blue-300 underline font-semibold">
              All-India College &amp; Job Directory &rarr;
            </a>
            <a href="/benchmarks/india-tech-salary-report-2026" className="text-emerald-400 hover:text-emerald-300 underline font-semibold">
              2026 Tech Salary Report
            </a>
            <a href="/benchmarks/tier-2-city-jobs-index-2026" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">
              Tier-2 Jobs Index
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
