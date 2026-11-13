// src/components/products/common/ProductFooter.tsx
// Master Global Design System Footer for all 9 TalentXcel Products

import React from 'react';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { ShieldCheck, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';

interface ProductFooterProps {
  currentProduct: string;
}

export const ProductFooter: React.FC<ProductFooterProps> = ({ currentProduct }) => {
  const products = [
    { name: 'JobMatch OS', desc: '1-Click Verified Jobs Directory', url: 'https://jobs.talentxcel.in' },
    { name: 'ResumeStudio', desc: 'Instant ATS Scoring & Builder', url: 'https://resume.talentxcel.in' },
    { name: 'PayScale', desc: 'In-Hand CTC Salary Calculator', url: 'https://salary.talentxcel.in' },
    { name: 'CampusOS', desc: 'TPO Cohorts & Placement Readiness', url: 'https://colleges.talentxcel.in' },
    { name: 'Career Passport', desc: 'Cryptographic Talent Credential', url: 'https://passport.talentxcel.in' },
    { name: 'SarkariHub', desc: 'Verified PSU & Govt Gazettes', url: 'https://government.talentxcel.in' },
    { name: 'Career Pathfinder', desc: 'AI Roadmaps & Transition Blueprints', url: 'https://careers.talentxcel.in' },
    { name: 'SkillPods', desc: 'Practical Technical Diagnostics', url: 'https://learning.talentxcel.in' },
    { name: 'Recruiter Workspace', desc: 'Verified Talent Sourcing & Hiring', url: 'https://employers.talentxcel.in' },
  ];

  return (
    <footer className="bg-[#F4F7FC] border-t border-[#E2E8F0] pt-14 pb-10 text-xs text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">100% Verified Data</p>
              <p className="text-[11px] text-[#64748B]">Zero phantom employers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0 border border-purple-100">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">Privacy-First OS</p>
              <p className="text-[11px] text-[#64748B]">Candidate owns all data</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#111827]">Zero Paywall Wedge</p>
              <p className="text-[11px] text-[#64748B]">Full utility before signup</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <span className="font-black text-xs">IN</span>
            </div>
            <div>
              <p className="font-bold text-[#111827]">Indian Statutory Engine</p>
              <p className="text-[11px] text-[#64748B]">Sec 115BAC & EPF compliance</p>
            </div>
          </div>
        </div>

        {/* 9 Product Ecosystem Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <h4 className="text-sm font-bold text-[#111827]">
              The TalentXcel Connected Ecosystem (Nine Specialized Products)
            </h4>
            <span className="text-[11px] text-[#64748B]">
              Active Product: <strong className="text-[#2563EB]">{currentProduct}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {products.map((p, idx) => (
              <a
                key={idx}
                href={p.url}
                className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                    <span>{p.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#2563EB]" />
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{p.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0] text-[11px]">
          <div className="flex items-center gap-3">
            <TalentXcelLogo iconSize={20} textSize="text-xs font-bold" theme="light" />
            <span>&copy; {new Date().getFullYear()} TalentXcel Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 font-medium text-[#64748B]">
            <a href="https://talentxcel.in/privacy" className="hover:text-[#111827]">Privacy Policy</a>
            <a href="https://talentxcel.in/terms" className="hover:text-[#111827]">Terms of Service</a>
            <a href="https://talentxcel.in/contact" className="hover:text-[#111827]">Contact Support</a>
            <a href="https://talentxcel.in/network" className="hover:text-[#2563EB] font-bold text-[#2563EB]">Open Professional Network</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
