// src/components/products/payscale/CareerSalaryGrowthNavigator.tsx
// Module 11: Career Salary Growth Navigator (Bridge between PayScale, TalentXcel Jobs & SkillPods)
// Interactive Transition Intelligence: Current Role (e.g. QA Tester ₹8L) -> Target Role (Automation Test Engineer ₹13L, +62.5% jump)

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck, 
  ExternalLink,
  Target,
  Layers,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calculateIndianSalaryBreakdown } from '@/services/salary/indianTaxAndPayrollEngine';
import { toast } from 'sonner';

interface PresetPathway {
  id: string;
  currentRole: string;
  currentCtc: number;
  targetRole: string;
  targetCtc: number;
  timelineMonths: number;
  location: string;
  skillsNeeded: string[];
  recommendedSkillPods: { title: string; duration: string; url: string }[];
  matchedJobsKeywords: string;
}

const PRESET_PATHWAYS: PresetPathway[] = [
  {
    id: 'qa_to_automation',
    currentRole: 'Manual / QA Tester',
    currentCtc: 8.0,
    targetRole: 'Automation Test Engineer (Playwright/Cypress)',
    targetCtc: 13.0,
    timelineMonths: 4,
    location: 'Noida / NCR',
    skillsNeeded: ['TypeScript & Playwright Framework', 'CI/CD Pipeline Integration (GitHub Actions)', 'API Testing with Postman & REST Assured', 'Docker Test Containers'],
    recommendedSkillPods: [
      { title: 'Modern Test Automation with Playwright & TypeScript', duration: '6 Weeks', url: 'https://learning.talentxcel.in' },
      { title: 'CI/CD Automated Test Harnesses on Docker', duration: '4 Weeks', url: 'https://learning.talentxcel.in' }
    ],
    matchedJobsKeywords: 'Automation Test Engineer'
  },
  {
    id: 'frontend_to_fullstack',
    currentRole: 'Frontend Developer (React)',
    currentCtc: 9.5,
    targetRole: 'Senior Full-Stack Engineer',
    targetCtc: 16.5,
    timelineMonths: 4.5,
    location: 'Bengaluru',
    skillsNeeded: ['Next.js 15 Server Components & Server Actions', 'PostgreSQL & Prisma ORM Schema Design', 'Microservices Architecture & Docker', 'Redis Caching & Queue Management'],
    recommendedSkillPods: [
      { title: 'Production Full-Stack Architecture on Next.js & Node', duration: '8 Weeks', url: 'https://learning.talentxcel.in' },
      { title: 'High-Scale Relational Database Design with PostgreSQL', duration: '4 Weeks', url: 'https://learning.talentxcel.in' }
    ],
    matchedJobsKeywords: 'Full-Stack Software Engineer'
  },
  {
    id: 'hr_to_vp_people',
    currentRole: 'HR Manager',
    currentCtc: 10.0,
    targetRole: 'Head of People / VP HR',
    targetCtc: 24.0,
    timelineMonths: 6,
    location: 'Mumbai / Delhi',
    skillsNeeded: ['Strategic Workforce Planning & Headcount Modeling', 'ESOP Pool Architecture & Grant Policies', 'Performance Review & Merit Matrix Design', 'Executive Leadership & Board Reporting'],
    recommendedSkillPods: [
      { title: 'Strategic HR Leadership & Total Rewards Management', duration: '8 Weeks', url: 'https://learning.talentxcel.in' },
      { title: 'Executive Compensation & ESOP Strategy Masterclass', duration: '4 Weeks', url: 'https://learning.talentxcel.in' }
    ],
    matchedJobsKeywords: 'Head of People'
  },
  {
    id: 'backend_to_genai',
    currentRole: 'Backend Developer (Python/Java)',
    currentCtc: 12.0,
    targetRole: 'Generative AI & LLM Systems Engineer',
    targetCtc: 25.0,
    timelineMonths: 5,
    location: 'Bengaluru / Remote',
    skillsNeeded: ['LangChain, LlamaIndex & RAG Architectures', 'Vector Databases (Pinecone, pgvector)', 'Quantization, LoRA & Model Fine-Tuning', 'AI Agent Workflows & Tool Calling'],
    recommendedSkillPods: [
      { title: 'Production Enterprise RAG Systems with Vector DBs', duration: '6 Weeks', url: 'https://learning.talentxcel.in' },
      { title: 'Building Autonomous AI Agents with Tool Use', duration: '6 Weeks', url: 'https://learning.talentxcel.in' }
    ],
    matchedJobsKeywords: 'Generative AI Engineer'
  }
];

export const CareerSalaryGrowthNavigator: React.FC = () => {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('qa_to_automation');
  const [customCurrentRole, setCustomCurrentRole] = useState<string>('Manual / QA Tester');
  const [customCurrentCtc, setCustomCurrentCtc] = useState<number>(8.0);
  const [customTargetRole, setCustomTargetRole] = useState<string>('Automation Test Engineer');
  const [customTargetCtc, setCustomTargetCtc] = useState<number>(13.0);
  const [customLocation, setCustomLocation] = useState<string>('Noida / NCR');

  const activePathway = useMemo(() => {
    return PRESET_PATHWAYS.find(p => p.id === selectedPathwayId) || PRESET_PATHWAYS[0];
  }, [selectedPathwayId]);

  // When changing preset, update inputs
  const handleSelectPreset = (p: PresetPathway) => {
    setSelectedPathwayId(p.id);
    setCustomCurrentRole(p.currentRole);
    setCustomCurrentCtc(p.currentCtc);
    setCustomTargetRole(p.targetRole);
    setCustomTargetCtc(p.targetCtc);
    setCustomLocation(p.location);
  };

  const percentageHike = Math.round(((customTargetCtc - customCurrentCtc) / customCurrentCtc) * 100);

  // Compute In-Hand Scenarios (Current vs Target steps: e.g. at 10L, 12L, 13L)
  const breakdownCurrent = useMemo(() => {
    return calculateIndianSalaryBreakdown({ annualCtc: customCurrentCtc * 100000 });
  }, [customCurrentCtc]);

  const breakdownTarget = useMemo(() => {
    return calculateIndianSalaryBreakdown({ annualCtc: customTargetCtc * 100000 });
  }, [customTargetCtc]);

  const monthlyDelta = breakdownTarget.monthly.netInHand - breakdownCurrent.monthly.netInHand;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>Salary Growth Navigator • Career Leap Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Map Skills to Substantial Compensation Upside
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The bridge between Salary Intelligence, TalentXcel Jobs, and SkillPods learning. See your target take-home salary, acquire the missing skills, and unlock verified vacancies.
          </p>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Popular Transitions:</span>
        {PRESET_PATHWAYS.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => handleSelectPreset(path)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedPathwayId === path.id
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {path.currentRole} → {path.targetRole.split('(')[0]} (+{Math.round(((path.targetCtc - path.currentCtc)/path.currentCtc)*100)}%)
          </button>
        ))}
      </div>

      {/* Interactive Current vs Target Inputs */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Current Role & CTC
          </label>
          <Input
            value={customCurrentRole}
            onChange={(e) => setCustomCurrentRole(e.target.value)}
            className="h-9 text-xs font-semibold mb-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">CTC:</span>
            <Input
              type="number"
              step={0.5}
              value={customCurrentCtc}
              onChange={(e) => setCustomCurrentCtc(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-black text-slate-900"
            />
            <span className="text-xs font-bold text-slate-500">LPA</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Role & CTC
          </label>
          <Input
            value={customTargetRole}
            onChange={(e) => setCustomTargetRole(e.target.value)}
            className="h-9 text-xs font-semibold mb-2"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">CTC:</span>
            <Input
              type="number"
              step={0.5}
              value={customTargetCtc}
              onChange={(e) => setCustomTargetCtc(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs font-black text-[#2563EB]"
            />
            <span className="text-xs font-bold text-slate-500">LPA</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Location / Market
          </label>
          <Input
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="h-9 text-xs font-semibold"
            placeholder="e.g. Noida, Bangalore"
          />
        </div>

        <div>
          <Button
            onClick={() => toast.success(`Salary Growth Blueprint generated for ${customTargetRole}!`)}
            className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
          >
            Generate Growth Report
          </Button>
        </div>
      </div>

      {/* ILLUSTRATIVE PAYSCALE REPORT (Matching User Spec) */}
      <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
              Illustrative PayScale Intelligence Report
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {customCurrentRole} → {customTargetRole}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Location: {customLocation} • Target Timeline: ~4 Months</p>
          </div>

          <div className="text-right bg-emerald-50 border border-emerald-300 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Potential Salary Jump</span>
            <div className="text-3xl font-black text-emerald-700">+{percentageHike}%</div>
            <div className="text-[11px] font-bold text-emerald-900 mt-0.5">+₹{(customTargetCtc - customCurrentCtc).toFixed(1)} LPA Increment</div>
          </div>
        </div>

        {/* Take-Home Comparison Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current In-Hand</span>
            <div className="text-xl font-black text-slate-900 mt-1">₹{(breakdownCurrent?.monthly?.netInHand ?? 0).toLocaleString('en-IN')} /mo</div>
            <div className="text-[11px] text-slate-500 mt-1">At ₹{customCurrentCtc} LPA CTC (Annual In-Hand: ₹{(breakdownCurrent?.annual?.netInHand ?? 0).toLocaleString('en-IN')})</div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border-2 border-[#2563EB]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">Target In-Hand</span>
            <div className="text-xl font-black text-[#2563EB] mt-1">₹{(breakdownTarget?.monthly?.netInHand ?? 0).toLocaleString('en-IN')} /mo</div>
            <div className="text-[11px] text-slate-600 mt-1">At ₹{customTargetCtc} LPA CTC (Annual In-Hand: ₹{(breakdownTarget?.annual?.netInHand ?? 0).toLocaleString('en-IN')})</div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Monthly Pocket Delta</span>
            <div className="text-xl font-black text-emerald-700 mt-1">+₹{(monthlyDelta ?? 0).toLocaleString('en-IN')} /mo</div>
            <div className="text-[11px] text-emerald-900 mt-1">Extra liquid cash in your bank account every month</div>
          </div>
        </div>

        {/* Skills Needed to Qualify */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Core Skills Needed to Qualify for {customTargetRole}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {activePathway.skillsNeeded.map((skill, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Bridges to Ecosystem (SkillPods & TalentXcel Jobs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Bridge 1: SkillPods */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#7138E8]" />
              <h4 className="text-xs font-black text-slate-900">Recommended Learning on SkillPods</h4>
            </div>
            <p className="text-[11px] text-slate-600">
              Structured self-paced modules with hands-on capstones to bridge this skill gap.
            </p>
            <div className="space-y-2">
              {activePathway.recommendedSkillPods.map((sp, idx) => (
                <a
                  key={idx}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 hover:border-[#7138E8] transition-colors text-xs font-bold text-slate-900"
                >
                  <span className="truncate">{sp.title} ({sp.duration})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7138E8] shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Bridge 2: TalentXcel Jobs */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-50 to-sky-50 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#2563EB]" />
              <h4 className="text-xs font-black text-slate-900">Matching Vacancies on TalentXcel Jobs</h4>
            </div>
            <p className="text-[11px] text-slate-600">
              Verified openings offering ₹{customTargetCtc} LPA+ with transparent interview loops.
            </p>
            <div className="space-y-2">
              <a
                href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? `http://jobs.localhost:8080/?q=${encodeURIComponent(activePathway.matchedJobsKeywords)}` : `https://jobs.talentxcel.in/?q=${encodeURIComponent(activePathway.matchedJobsKeywords)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-100 hover:border-[#2563EB] transition-colors text-xs font-bold text-slate-900"
              >
                <span>View {activePathway.matchedJobsKeywords} Openings (2,250+ Verified)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-2" />
              </a>
              <a
                href="https://passport.talentxcel.in"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-100 hover:border-[#2563EB] transition-colors text-xs font-bold text-slate-900"
              >
                <span>Generate Verified Skill Passport Badge</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
