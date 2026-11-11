// src/components/products/CareerPathfinderProduct.tsx
// Independent Standalone Product for careers.talentxcel.in (Career Pathfinder)

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  Award, 
  Layers, 
  DollarSign, 
  Clock, 
  BookOpen, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TransitionPath {
  currentRole: string;
  targetRole: string;
  timeEstimateMonths: number;
  currentAvgCtcLakhs: number;
  targetAvgCtcLakhs: number;
  difficulty: 'Moderate' | 'Demanding' | 'High Impact';
  coreSkillGaps: string[];
  phases: {
    title: string;
    weeks: string;
    focus: string;
    milestones: string[];
  }[];
}

const PRESET_TRANSITIONS: Record<string, TransitionPath> = {
  'qa_to_sde': {
    currentRole: 'Manual / QA Tester',
    targetRole: 'Full-Stack Software Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.8,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Moderate',
    coreSkillGaps: ['Data Structures & Algorithms', 'React & Next.js Architecture', 'PostgreSQL & ORMs', 'System Design Basics'],
    phases: [
      {
        title: 'Phase 1: Deep Core Programming & DSA',
        weeks: 'Weeks 1–4',
        focus: 'TypeScript syntax, memory model, Big-O analysis, HashMaps, Two-pointer algorithms.',
        milestones: ['Solve 50 LeetCode Mediums', 'Build typed REST API in Express & Prisma', 'Implement JWT auth & rate limiting']
      },
      {
        title: 'Phase 2: Production Full-Stack Engineering',
        weeks: 'Weeks 5–10',
        focus: 'React Server Components, Next.js App Router, caching strategies, Docker deployment.',
        milestones: ['Deploy full-stack SaaS application with live payments', 'Integrate CI/CD pipeline on GitHub Actions', 'Containerize with multi-stage Dockerfile']
      },
      {
        title: 'Phase 3: System Design & Interview Outreach',
        weeks: 'Weeks 11–16',
        focus: 'High-level architecture, database indexing, caching (Redis), mock behavioral & coding screens.',
        milestones: ['Design scalable URL shortener with Redis caching', 'Tailor resume on ResumeStudio with quantified impact', 'Apply to 30 curated openings on JobMatch OS']
      }
    ]
  },
  'support_to_pm': {
    currentRole: 'Customer Support / Operations',
    targetRole: 'Associate Product Manager (APM)',
    timeEstimateMonths: 3,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 14.0,
    difficulty: 'High Impact',
    coreSkillGaps: ['Product Analytics (Mixpanel/PostHog)', 'PRD Writing & Wireframing', 'SQL for Product Metrics', 'A/B Testing & Cohort Retention'],
    phases: [
      {
        title: 'Phase 1: Data Fluency & User Telemetry',
        weeks: 'Weeks 1–3',
        focus: 'SQL joins, aggregation, cohort retention analysis, funnels, North Star metric mapping.',
        milestones: ['Write SQL queries to calculate DAU/MAU and LTV', 'Map complete user conversion drop-off funnel', 'Deconstruct 3 competitor onboarding flows']
      },
      {
        title: 'Phase 2: Spec Writing & Product Artifacts',
        weeks: 'Weeks 4–8',
        focus: 'PRDs, user story mapping, Figma wireframing, prioritization frameworks (RICE).',
        milestones: ['Publish 2 public PRDs for high-scale mobile apps', 'Create interactive Figma prototype with error states', 'Calculate RICE score for 10 roadmap candidates']
      },
      {
        title: 'Phase 3: Execution & Strategy Case Interviews',
        weeks: 'Weeks 9–12',
        focus: 'Product sense cases, execution teardowns, root cause analysis, mock hiring panel.',
        milestones: ['Execute 5 product teardowns on LinkedIn', 'Practice 10 product design interview loops', 'Direct outreach to 25 VP Product hiring managers']
      }
    ]
  },
  'dev_to_devops': {
    currentRole: 'Backend / Frontend Developer',
    targetRole: 'DevOps & Cloud Platform Engineer',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 8.0,
    targetAvgCtcLakhs: 18.5,
    difficulty: 'Demanding',
    coreSkillGaps: ['Kubernetes (EKS/GKE)', 'Terraform Infrastructure as Code', 'Observability (Prometheus/Grafana)', 'Linux Kernel & Networking'],
    phases: [
      {
        title: 'Phase 1: Linux Deep Dive & Container Orchestration',
        weeks: 'Weeks 1–4',
        focus: 'Linux namespaces, cgroups, systemd, multi-stage Docker builds, Kubernetes pods & ingress.',
        milestones: ['Setup multi-node local k3s cluster', 'Deploy HA PostgreSQL with persistent volumes', 'Configure Cert-Manager & automated TLS']
      },
      {
        title: 'Phase 2: Infrastructure as Code & GitOps',
        weeks: 'Weeks 5–10',
        focus: 'Terraform modular architecture, AWS VPC provisioning, ArgoCD GitOps pipelines.',
        milestones: ['Write Terraform module deploying complete AWS VPC & EKS', 'Implement ArgoCD continuous delivery synced to Git repo', 'Configure AWS IAM roles for service accounts (IRSA)']
      },
      {
        title: 'Phase 3: SRE Observability & Reliability',
        weeks: 'Weeks 11–16',
        focus: 'SLI/SLO formulation, Prometheus alerting, distributed tracing (OpenTelemetry), disaster recovery.',
        milestones: ['Deploy Grafana dashboards monitoring p99 latencies', 'Conduct chaos testing simulating node dropouts', 'Document complete production incident runbook']
      }
    ]
  }
};

export const CareerPathfinderProduct: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState<string>('qa_to_sde');
  const [customCurrent, setCustomCurrent] = useState('');
  const [customTarget, setCustomTarget] = useState('');

  const activeTransition = PRESET_TRANSITIONS[selectedKey];
  const ctcUpsidePercent = Math.round(
    ((activeTransition.targetAvgCtcLakhs - activeTransition.currentAvgCtcLakhs) / activeTransition.currentAvgCtcLakhs) * 100
  );

  const handleSaveRoadmap = () => {
    toast.success('Roadmap saved! Create your account to track your weekly milestones.');
    navigate(`/auth/register?intent=save_roadmap&role=${encodeURIComponent(activeTransition.targetRole)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      <Helmet>
        <title>Career Pathfinder — AI Transition Roadmaps & Skill Gap Diagnostics | TalentXcel</title>
        <meta 
          name="description" 
          content="Map your exact career transition with verified milestone roadmaps, skill deficit diagnostics, and Indian compensation benchmarks." 
        />
        <link rel="canonical" href="https://careers.talentxcel.in/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            "name": "TalentXcel Career Pathfinder",
            "url": "https://careers.talentxcel.in/",
            "description": "Interactive career roadmap engine mapping transitions, skill gaps, and salary upsides."
          })}
        </script>
      </Helmet>

      {/* SUB-HEADER */}
      <div className="border-b border-indigo-900/40 bg-indigo-950/30 backdrop-blur px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] uppercase font-bold tracking-wider">
              Pathfinder OS
            </Badge>
            <span className="text-slate-400 hidden sm:inline">• Automated career roadmaps & skill-gap mitigation blueprints</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate('/auth/register?intent=pathfinder')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg px-3 py-1 h-7"
            >
              Get Free Career Plan →
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Compass className="h-4 w-4" />
            <span>Interactive Career Navigation System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Engineer Your Next Role. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
              Step-by-Step Transition Blueprints.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop wondering what skills you need. Select your current role and your desired target to generate a structured 12–16 week roadmap with real projects, compensation benchmarks, and direct job bridges.
          </p>
        </div>

        {/* INTERACTIVE ROADMAP SELECTOR */}
        <div className="mt-10 max-w-5xl mx-auto">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl backdrop-blur">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    Career Transition Navigator
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Select a high-demand transition pathway to inspect the complete execution roadmap
                  </CardDescription>
                </div>

                {/* Transition Preset Selector */}
                <div className="flex items-center gap-2">
                  <Select value={selectedKey} onValueChange={setSelectedKey}>
                    <SelectTrigger className="w-[280px] bg-slate-950 border-slate-800 text-xs font-semibold text-white">
                      <SelectValue placeholder="Select career transition" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 text-xs">
                      <SelectItem value="qa_to_sde">QA Tester → Full-Stack SDE</SelectItem>
                      <SelectItem value="support_to_pm">Support/Ops → Product Manager</SelectItem>
                      <SelectItem value="dev_to_devops">Developer → DevOps / Platform SRE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-8">
              {/* Summary KPIs banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Current Role</p>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{activeTransition.currentRole}</p>
                  <p className="text-xs text-slate-500 mt-0.5">₹{activeTransition.currentAvgCtcLakhs}L Avg CTC</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-indigo-400">Target Role</p>
                  <p className="text-sm font-bold text-white mt-0.5">{activeTransition.targetRole}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">₹{activeTransition.targetAvgCtcLakhs}L Avg CTC</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Estimated Timeline</p>
                  <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-sky-400" />
                    {activeTransition.timeEstimateMonths} Months
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">10–12 hrs/week effort</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Compensation Upside</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">+{ctcUpsidePercent}% Upside</p>
                  <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-800 py-0 mt-0.5">
                    {activeTransition.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Core Skill Gap Deficits */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-400" />
                  Primary Skill Gaps to Bridge
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeTransition.coreSkillGaps.map((gap, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-rose-900/40 text-rose-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step 3-Phase Roadmap */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Milestone Execution Blueprint
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeTransition.phases.map((phase, idx) => (
                    <Card key={idx} className="bg-slate-950/70 border-slate-800 text-slate-100 flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {phase.weeks}
                          </span>
                          <span className="h-5 w-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                            {idx + 1}
                          </span>
                        </div>
                        <CardTitle className="text-sm font-bold text-white leading-snug">
                          {phase.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 pt-1 leading-relaxed">
                          {phase.focus}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <p className="text-[11px] font-bold text-slate-300">Key Deliverables:</p>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                          {phase.milestones.map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Conversion CTA Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base font-bold text-white">Save This Roadmap to Your Career Profile</h4>
                  <p className="text-xs text-slate-300">
                    Track weekly progress, access curated resources on SkillPods, and receive matching job notifications.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={handleSaveRoadmap}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    <span>Save My Roadmap</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SIBLING DOMAINS FOOTER */}
      <section className="py-8 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TalentXcel Career Pathfinder. Part of the TalentXcel Career Ecosystem.</p>
          <div className="flex flex-wrap gap-4 font-semibold text-slate-300">
            <a href="https://jobs.talentxcel.in" className="hover:text-white">JobMatch OS</a>
            <a href="https://resume.talentxcel.in" className="hover:text-white">ResumeStudio</a>
            <a href="https://salary.talentxcel.in" className="hover:text-white">PayScale</a>
            <a href="https://learning.talentxcel.in" className="hover:text-white">SkillPods</a>
          </div>
        </div>
      </section>
    </div>
  );
};
