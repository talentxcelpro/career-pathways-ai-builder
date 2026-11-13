// src/components/products/jobmatch/PlatformEcosystemSidebar.tsx
// Comprehensive Platform Navigation Sidebar & Drawer for TalentXcel Ecosystem
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Briefcase, 
  Users, 
  Compass, 
  GraduationCap, 
  BadgeDollarSign, 
  Award, 
  Zap, 
  FileText, 
  Sparkles, 
  CreditCard, 
  Scale, 
  Building2, 
  Layers, 
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { Badge } from '@/components/ui/badge';

export interface PlatformItem {
  id: string;
  name: string;
  tagline: string;
  subdomain: string;
  localPortUrl: string;
  productionUrl: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  category: 'employment' | 'career' | 'institutional' | 'verticals';
  isActive?: boolean;
}

export const PLATFORMS_INVENTORY: PlatformItem[] = [
  // 1. Employment & Network
  {
    id: 'jobs',
    name: 'JobMatch OS',
    tagline: '2,200+ verified active vacancies with 1-Click apply',
    subdomain: 'jobs.talentxcel.in',
    localPortUrl: 'http://jobs.localhost:8080',
    productionUrl: 'https://jobs.talentxcel.in',
    icon: Briefcase,
    iconColor: 'text-[#2563EB]',
    iconBg: 'bg-blue-50 border-blue-200',
    category: 'employment',
    isActive: true
  },
  {
    id: 'network',
    name: 'Professional Network',
    tagline: 'Professional feed, social momentum & creator studio',
    subdomain: 'talentxcel.in/network',
    localPortUrl: 'http://localhost:8080/network',
    productionUrl: 'https://talentxcel.in/network',
    icon: Users,
    iconColor: 'text-[#7138E8]',
    iconBg: 'bg-purple-50 border-purple-200',
    category: 'employment'
  },
  {
    id: 'passport',
    name: 'Career Passport',
    tagline: 'Universal verified candidate profile & TalentScore',
    subdomain: 'passport.talentxcel.in',
    localPortUrl: 'http://passport.localhost:8080',
    productionUrl: 'https://passport.talentxcel.in',
    icon: CreditCard,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
    category: 'employment'
  },

  // 2. Career Growth & Intelligence
  {
    id: 'career',
    name: 'Career Pathfinder',
    tagline: 'AI skill trajectories and role progression maps',
    subdomain: 'career.talentxcel.in',
    localPortUrl: 'http://career.localhost:8080',
    productionUrl: 'https://career.talentxcel.in',
    icon: Compass,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    category: 'career'
  },
  {
    id: 'salary',
    name: 'PayScale Engine',
    tagline: 'Real-time Indian and global compensation benchmarks',
    subdomain: 'salary.talentxcel.in',
    localPortUrl: 'http://salary.localhost:8080',
    productionUrl: 'https://salary.talentxcel.in',
    icon: BadgeDollarSign,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
    category: 'career'
  },
  {
    id: 'resume',
    name: 'Resume Studio',
    tagline: 'AI-assisted ATS resume builder and live score audit',
    subdomain: 'resume.talentxcel.in',
    localPortUrl: 'http://resume.localhost:8080',
    productionUrl: 'https://resume.talentxcel.in',
    icon: FileText,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-200',
    category: 'career'
  },
  {
    id: 'learning',
    name: 'SkillPods OS',
    tagline: 'High-income skills assessment and micro-credentials',
    subdomain: 'learning.talentxcel.in',
    localPortUrl: 'http://learning.localhost:8080',
    productionUrl: 'https://learning.talentxcel.in',
    icon: Zap,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-200',
    category: 'career'
  },

  // 3. Institutional & Public Sector
  {
    id: 'colleges',
    name: 'Campus OS',
    tagline: '10,250+ NIRF colleges, placement records & cutoffs',
    subdomain: 'colleges.talentxcel.in',
    localPortUrl: 'http://colleges.localhost:8080',
    productionUrl: 'https://colleges.talentxcel.in',
    icon: GraduationCap,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-50 border-blue-200',
    category: 'institutional'
  },
  {
    id: 'government',
    name: 'Sarkari Hub',
    tagline: 'UPSC, SSC, PSU & defense vacancies with syllabus',
    subdomain: 'government.talentxcel.in',
    localPortUrl: 'http://government.localhost:8080',
    productionUrl: 'https://government.talentxcel.in',
    icon: Award,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 border-orange-200',
    category: 'institutional'
  },

  // 4. Enterprise & Professional Verticals
  {
    id: 'recruiters',
    name: 'Recruiter Engine',
    tagline: 'Search 676 verified profiles and manage hiring pipelines',
    subdomain: 'recruiters.talentxcel.in',
    localPortUrl: 'http://recruiters.localhost:8080',
    productionUrl: 'https://recruiters.talentxcel.in',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-200',
    category: 'verticals'
  },
  {
    id: 'ca',
    name: 'CAConnect Practice OS',
    tagline: 'GST, tax filing, audit advisory & CA talent marketplace',
    subdomain: 'ca.talentxcel.in',
    localPortUrl: 'http://ca.localhost:8080',
    productionUrl: 'https://ca.talentxcel.in',
    icon: Building2,
    iconColor: 'text-cyan-700',
    iconBg: 'bg-cyan-50 border-cyan-200',
    category: 'verticals'
  },
  {
    id: 'legal',
    name: 'LegalPulse Practice OS',
    tagline: 'Corporate compliance, contracts & legal council network',
    subdomain: 'legal.talentxcel.in',
    localPortUrl: 'http://legal.localhost:8080',
    productionUrl: 'https://legal.talentxcel.in',
    icon: Scale,
    iconColor: 'text-slate-800',
    iconBg: 'bg-slate-100 border-slate-300',
    category: 'verticals'
  },
  {
    id: 'services',
    name: 'BizServices Commerce',
    tagline: 'Multi-vertical enterprise commerce and digital services',
    subdomain: 'services.talentxcel.in',
    localPortUrl: 'http://services.localhost:8080',
    productionUrl: 'https://services.talentxcel.in',
    icon: Layers,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border-emerald-200',
    category: 'verticals'
  }
];

interface PlatformEcosystemSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlatformEcosystemSidebar: React.FC<PlatformEcosystemSidebarProps> = ({
  open,
  onOpenChange
}) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');

  const getDestinationUrl = (p: PlatformItem) => {
    return isLocalhost ? p.localPortUrl : p.productionUrl;
  };

  const sections = [
    { key: 'employment', title: 'Core Employment & Network' },
    { key: 'career', title: 'Career Growth & Intelligence' },
    { key: 'institutional', title: 'Colleges & Public Sector' },
    { key: 'verticals', title: 'Recruiters & Professional Verticals' }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="p-0 w-[92%] sm:w-[420px] max-w-full overflow-y-auto bg-white text-[#111827] border-r border-[#E2E8F0] shadow-2xl z-[100]"
      >
        <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-r from-blue-50/60 via-white to-purple-50/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <TalentXcelLogo />
              <Badge className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-[10px] font-black uppercase px-2 py-0.5">
                12 Products
              </Badge>
            </div>
          </div>
          <h3 className="text-base font-black text-[#111827] mt-3 tracking-tight">
            TalentXcel Platform Ecosystem
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
            Switch seamlessly to any independent business or service in the TalentXcel Operating System.
          </p>
        </div>

        <div className="p-4 space-y-6">
          {sections.map(section => {
            const items = PLATFORMS_INVENTORY.filter(p => p.category === section.key);
            return (
              <div key={section.key} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                    {section.title}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-bold">
                    {items.length} apps
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map(item => {
                    const Icon = item.icon;
                    const destUrl = getDestinationUrl(item);

                    return (
                      <a
                        key={item.id}
                        href={destUrl}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all text-left group ${
                          item.isActive 
                            ? 'bg-blue-50/60 border-blue-200/90 shadow-2xs' 
                            : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#2563EB]/40'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border shadow-2xs shrink-0 mt-0.5 ${item.iconBg}`}>
                          <Icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${item.isActive ? 'text-[#2563EB]' : 'text-[#111827] group-hover:text-[#2563EB]'} transition-colors`}>
                              {item.name}
                            </span>
                            {item.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-[#2563EB] text-white px-1.5 py-0.5 rounded-md">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Current
                              </span>
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] leading-snug line-clamp-1 mt-0.5">
                            {item.tagline}
                          </p>
                          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">
                            {item.subdomain}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] text-center">
          <p className="text-[11px] text-[#64748B] font-semibold">
            One Account. Infinite Career & Enterprise Services.
          </p>
          <a
            href={isLocalhost ? 'http://localhost:8080/network' : 'https://talentxcel.in/network'}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#7138E8] transition-colors"
          >
            <span>Visit TalentXcel Professional Network</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};
