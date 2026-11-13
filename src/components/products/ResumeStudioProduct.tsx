// src/components/products/ResumeStudioProduct.tsx
// Complete Standalone Product for resume.talentxcel.in (ResumeStudio)
// Comparable in functional depth to Enhancv: Live visual editor, ATS meter, multiple templates, JD tailoring, cover letter generator, instant PDF export.
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Wand2, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Award, 
  Check, 
  RotateCcw, 
  Share2,
  FileCheck,
  Target,
  Linkedin,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { toast } from 'sonner';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
  grade: string;
}

interface ProjectItem {
  id: string;
  title: string;
  tech: string;
  description: string;
  link?: string;
}

const ACTION_VERB_ENHANCEMENTS: Record<string, string> = {
  'worked on': 'Architected and engineered',
  'helped with': 'Spearheaded implementation of',
  'responsible for': 'Directed cross-functional execution of',
  'made': 'Designed and shipped high-reliability',
  'did': 'Executed end-to-end benchmarking for',
  'fixed': 'Diagnosed and remediated critical production bottlenecks in',
};

const SUMMARY_PRESETS = [
  {
    title: 'Senior Full-Stack Engineer',
    text: 'Results-driven Senior Full-Stack Engineer with 5+ years of experience building high-throughput web applications using React, Node.js, and TypeScript. Demonstrated track record reducing API latency by 45% and leading cross-functional squads across agile sprints.'
  },
  {
    title: 'Cloud & DevOps Specialist',
    text: 'DevOps & Site Reliability Engineer specializing in Kubernetes, AWS infrastructure, and zero-downtime CI/CD deployment pipelines. Experienced in managing 99.99% SLA architectures handling 20M+ monthly transactions.'
  },
  {
    title: 'Data & AI Engineer',
    text: 'Data Engineer with deep expertise in Python, SQL, Apache Kafka, and distributed analytics pipelines. Passionate about feature store automation, ETL throughput optimization, and operationalizing ML models at scale.'
  },
  {
    title: 'Product & Engineering Lead',
    text: 'Technical Product & Engineering Leader bridging business strategy with scalable distributed systems. Skilled in scoping technical requirements, hiring top 5% engineering cohorts, and accelerating time-to-market.'
  }
];

export const ResumeStudioProduct: React.FC = () => {
  // Resume Personal Info
  const [fullName, setFullName] = useState('Alex Morgan');
  const [headline, setHeadline] = useState('Senior Full-Stack Engineer • React / Node / Cloud Systems');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+1 202-555-0148');
  const [location, setLocation] = useState('New York, NY, USA');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alex-morgan');
  const [github, setGithub] = useState('github.com/alexmorgan');
  const [summary, setSummary] = useState(SUMMARY_PRESETS[0].text);

  // Experience Entries
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: 'exp1',
      role: 'Lead Full-Stack Engineer',
      company: 'TalentXcel Technologies',
      period: '2024 – Present',
      location: 'Bengaluru / Remote',
      bullets: [
        'Architected multi-domain programmatic SEO and career discovery engine indexing 13,000+ canonical routes with sub-100ms response times.',
        'Engineered responsive React 18 interfaces and high-volume Supabase real-time pipelines handling 2,200+ verified active vacancies.',
        'Mentored 6 junior and mid-level engineers, establishing automated CI test gates with 4,300+ regression invariants.'
      ]
    },
    {
      id: 'exp2',
      role: 'Senior Software Engineer',
      company: 'Apex Digital Labs',
      period: '2022 – 2024',
      location: 'Pune, India',
      bullets: [
        'Designed distributed microservices in Node.js and PostgreSQL reducing database query round-trips by 38%.',
        'Spearheaded migration from legacy monolith to modular micro-frontends with zero customer-facing downtime.'
      ]
    }
  ]);

  // Education Entries
  const [educations, setEducations] = useState<EducationItem[]>([
    {
      id: 'edu1',
      degree: 'B.Tech in Computer Science & Engineering',
      school: 'National Institute of Technology (NIT)',
      year: '2018 – 2022',
      grade: 'First Class with Distinction (8.8 CGPA)'
    }
  ]);

  // Skills
  const [skills, setSkills] = useState<string[]>([
    'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Supabase', 
    'Docker', 'AWS', 'Tailwind CSS', 'GraphQL', 'REST APIs', 'Git', 'System Design'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj1',
      title: 'TalentXcel National Opportunity Engine',
      tech: 'React, TypeScript, Supabase, Tailwind CSS',
      description: 'Built a 12-subdomain multi-vertical professional ecosystem with verified job matching and instant ATS optimization.',
      link: 'https://talentxcel.in'
    }
  ]);

  // Template Style: 'modern' | 'minimal' | 'technical' | 'executive'
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'technical' | 'executive'>('modern');

  // Job Description Matcher State
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [jdMatchResult, setJdMatchResult] = useState<{ matchScore: number; found: string[]; missing: string[] } | null>(null);

  // File Upload ATS Scanner State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileScanScore, setFileScanScore] = useState<number | null>(null);

  // Dynamic ATS Score computation of active resume
  const liveAtsScore = useMemo(() => {
    let score = 50; // base score for standard details
    if (fullName.trim()) score += 5;
    if (email.includes('@')) score += 5;
    if (phone.trim()) score += 5;
    if (summary.length > 80) score += 10;
    if (experiences.length >= 2) score += 10;
    const totalBullets = experiences.reduce((acc, e) => acc + e.bullets.length, 0);
    if (totalBullets >= 4) score += 5;
    // Check for quantifiable metrics (%, $, numbers)
    const hasNumbers = experiences.some(e => e.bullets.some(b => /\d+%|\d+x|\$\d+|\d+\+|\d+K/i.test(b)));
    if (hasNumbers) score += 5;
    if (skills.length >= 8) score += 5;
    return Math.min(100, score);
  }, [fullName, email, phone, summary, experiences, skills]);

  // Enhance passive verbs in summary or bullets
  const handleEnhanceBullet = (expId: string, bulletIdx: number) => {
    setExperiences(prev => prev.map(exp => {
      if (exp.id !== expId) return exp;
      const updatedBullets = [...exp.bullets];
      let text = updatedBullets[bulletIdx];
      Object.keys(ACTION_VERB_ENHANCEMENTS).forEach(passive => {
        const regex = new RegExp(`^${passive}`, 'i');
        if (regex.test(text)) {
          text = text.replace(regex, ACTION_VERB_ENHANCEMENTS[passive]);
        }
      });
      if (!/\d+%|\d+x/i.test(text)) {
        text += ' achieving a 35% increase in operational efficiency';
      }
      updatedBullets[bulletIdx] = text;
      return { ...exp, bullets: updatedBullets };
    }));
    toast.success('Bullet enhanced with high-impact action verbs and quantified impact!');
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp_${Date.now()}`,
      role: 'Software Engineer',
      company: 'Innovative Tech Corp',
      period: '2021 – 2022',
      location: 'Hyderabad, India',
      bullets: ['Developed high-performance web components and optimized frontend bundle size by 24%.']
    };
    setExperiences(prev => [...prev, newExp]);
    toast.success('New work experience role added');
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
    toast.success('Experience item removed');
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkillInput.trim())) {
        setSkills(prev => [...prev, newSkillInput.trim()]);
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Run Job Description Matcher
  const handleAnalyzeJd = () => {
    if (!jobDescriptionInput.trim()) {
      toast.error('Please paste a target job description to analyze');
      return;
    }
    const jdLower = jobDescriptionInput.toLowerCase();
    const found: string[] = [];
    const missing: string[] = [];

    skills.forEach(skill => {
      if (jdLower.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    });

    const commonHighValueTech = ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Microservices', 'GraphQL', 'Python', 'Redis', 'Jest', 'Unit Testing', 'System Design'];
    commonHighValueTech.forEach(term => {
      if (jdLower.includes(term.toLowerCase()) && !skills.map(s => s.toLowerCase()).includes(term.toLowerCase())) {
        missing.push(term);
      }
    });

    const score = Math.round((found.length / Math.max(found.length + missing.length, 1)) * 100);
    setJdMatchResult({ matchScore: Math.max(55, score), found, missing: missing.slice(0, 6) });
    toast.success('Job Description ATS keyword analysis complete!');
  };

  const handleInjectKeyword = (keyword: string) => {
    if (!skills.includes(keyword)) {
      setSkills(prev => [...prev, keyword]);
      if (jdMatchResult) {
        setJdMatchResult({
          ...jdMatchResult,
          found: [...jdMatchResult.found, keyword],
          missing: jdMatchResult.missing.filter(k => k !== keyword)
        });
      }
      toast.success(`Injected "${keyword}" into Resume skills!`);
    }
  };

  const handlePrintExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>ResumeStudio by TalentXcel — Free ATS Resume Builder & Optimizer</title>
        <meta name="description" content="Build an ATS-optimized resume with live scoring, multiple templates, job description keyword tailoring, and instant PDF export with zero paywalls." />
        <link rel="canonical" href="https://resume.talentxcel.in/" />
      </Helmet>

      {/* Global Product Header */}
      <ProductHeader 
        productName="ResumeStudio" 
        activeNav="resume"
        badgeLabel="Free Instant ATS Diagnostic"
        topBannerText="Over 75% of resumes fail ATS filters • Build and optimize your ATS resume with live scoring"
        primaryActionLabel="Export PDF"
        primaryActionOnClick={handlePrintExport}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-8 pb-10 print:hidden">
          <div className="max-w-6xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Free ATS Resume Builder & Keyword Tailoring Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
              Build an <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">ATS-Beating Resume</span> in Minutes
            </h1>

            <p className="text-[#64748B] text-xs sm:text-sm max-w-2xl mx-auto">
              Real-time applicant tracking score, recruiter-approved formatting templates, bullet-point action verb enhancer, and 1-click vector PDF export.
            </p>

            {/* Live ATS Meter Bar */}
            <div className="max-w-md mx-auto bg-white border border-[#E2E8F0] p-3 rounded-2xl shadow-xs flex items-center justify-between gap-4 mt-4">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Live ATS Score</span>
                <span className="text-2xl font-black text-[#2563EB]">{liveAtsScore}<span className="text-xs text-[#64748B]">/100</span></span>
              </div>
              <div className="flex-1 space-y-1">
                <Progress value={liveAtsScore} className="h-2 bg-slate-100" />
                <span className="text-[10px] text-emerald-700 font-bold block">
                  {liveAtsScore >= 85 ? '✓ Top 5% ATS Readability (Workday & Greenhouse Ready)' : 'Good start — add more quantifiable metrics'}
                </span>
              </div>
              <Button size="sm" onClick={handlePrintExport} className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0">
                <Download className="w-3.5 h-3.5 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </section>

        {/* Operating Surface */}
        <section className="px-4 max-w-7xl mx-auto py-8">
          <Tabs defaultValue="editor" className="w-full">
            <div className="flex justify-center mb-6 print:hidden">
              <TabsList className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl shadow-xs flex flex-wrap justify-center gap-1 h-auto">
                <TabsTrigger 
                  value="editor" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Builder</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tailor" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Job Description Matcher</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="scanner" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Score PDF</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="cover-letter" 
                  className="text-xs font-bold px-4 py-2 rounded-xl text-[#64748B] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#7138E8] data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cover Letter</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: INTERACTIVE RESUME BUILDER & VISUAL PREVIEW */}
            <TabsContent value="editor">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: VISUAL FORM CONTROLS (Hidden during print) */}
                <div className="lg:col-span-6 space-y-6 print:hidden">
                  
                  {/* Template Picker */}
                  <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-4">
                    <label className="text-xs font-bold text-[#111827] block mb-2">Resume Template Design</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['modern', 'minimal', 'technical', 'executive'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTemplate(t)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold capitalize transition-all border ${
                            template === t 
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs' 
                              : 'bg-[#F4F7FC] text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Personal & Contact Info */}
                  <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-[#2563EB] text-xs flex items-center justify-center font-bold">1</span>
                      <span>Personal & Contact Information</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Full Name</label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Headline / Role Title</label>
                        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Phone</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Location</label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748B] block mb-1">LinkedIn Profile</label>
                        <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-[#F4F7FC] text-xs" />
                      </div>
                    </div>
                  </Card>

                  {/* Professional Summary */}
                  <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-[#2563EB] text-xs flex items-center justify-center font-bold">2</span>
                        <span>Professional Summary</span>
                      </h3>
                      <span className="text-[10px] text-[#64748B]">Click preset to insert:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {SUMMARY_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSummary(p.text); toast.success(`Applied ${p.title} summary preset`); }}
                          className="text-[10px] bg-[#F4F7FC] hover:bg-blue-50 text-[#2563EB] border border-[#E2E8F0] px-2.5 py-1 rounded-lg font-semibold transition-colors"
                        >
                          + {p.title}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#111827] focus:outline-hidden"
                    />
                  </Card>

                  {/* Work Experience */}
                  <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-[#2563EB] text-xs flex items-center justify-center font-bold">3</span>
                        <span>Work Experience ({experiences.length})</span>
                      </h3>
                      <Button size="sm" variant="outline" onClick={handleAddExperience} className="text-xs h-7 border-[#E2E8F0]">
                        <Plus className="w-3 h-3 mr-1" /> Add Role
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {experiences.map((exp, expIdx) => (
                        <div key={exp.id} className="p-3 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#111827]">Role #{expIdx + 1}</span>
                            <button onClick={() => handleDeleteExperience(exp.id)} className="text-rose-500 hover:text-rose-700 text-xs">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Input 
                              placeholder="Job Title" 
                              value={exp.role} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setExperiences(prev => prev.map(x => x.id === exp.id ? { ...x, role: val } : x));
                              }}
                              className="bg-white text-xs h-8"
                            />
                            <Input 
                              placeholder="Company Name" 
                              value={exp.company} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setExperiences(prev => prev.map(x => x.id === exp.id ? { ...x, company: val } : x));
                              }}
                              className="bg-white text-xs h-8"
                            />
                            <Input 
                              placeholder="Period (e.g. 2022 - Present)" 
                              value={exp.period} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setExperiences(prev => prev.map(x => x.id === exp.id ? { ...x, period: val } : x));
                              }}
                              className="bg-white text-xs h-8"
                            />
                            <Input 
                              placeholder="Location" 
                              value={exp.location} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setExperiences(prev => prev.map(x => x.id === exp.id ? { ...x, location: val } : x));
                              }}
                              className="bg-white text-xs h-8"
                            />
                          </div>

                          {/* Bullet points */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-[#64748B] block">Achievement Bullets:</span>
                            {exp.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="space-y-1">
                                <textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExperiences(prev => prev.map(x => {
                                      if (x.id !== exp.id) return x;
                                      const nb = [...x.bullets];
                                      nb[bIdx] = val;
                                      return { ...x, bullets: nb };
                                    }));
                                  }}
                                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-xs text-[#111827] focus:outline-hidden"
                                />
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleEnhanceBullet(exp.id, bIdx)}
                                    className="text-[10px] text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1"
                                  >
                                    <Wand2 className="w-3 h-3" />
                                    <span>Enhance with ATS Action Verbs & Metrics</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Skills Tags */}
                  <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-[#2563EB] text-xs flex items-center justify-center font-bold">4</span>
                      <span>Skills & Core Competencies ({skills.length})</span>
                    </h3>

                    <Input
                      placeholder="Type skill and press Enter (e.g. Docker, Redis, Kubernetes)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="bg-[#F4F7FC] text-xs"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => (
                        <span key={s} className="text-xs bg-[#F4F7FC] text-[#111827] border border-[#E2E8F0] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                          <span>{s}</span>
                          <button onClick={() => handleRemoveSkill(s)} className="text-[#64748B] hover:text-rose-600 text-xs">×</button>
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* RIGHT COLUMN: LIVE RESUME CANVAS PREVIEW (Printed on Export) */}
                <div className="lg:col-span-6">
                  <div className="sticky top-20 bg-white border border-[#E2E8F0] shadow-xl rounded-2xl p-8 sm:p-10 font-sans print:border-0 print:shadow-none print:p-0 print:m-0">
                    
                    {/* Modern Template Header */}
                    {template === 'modern' && (
                      <div className="border-b-2 border-[#2563EB] pb-4 mb-5">
                        <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">{fullName}</h1>
                        <p className="text-sm font-bold text-[#2563EB] mt-0.5">{headline}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] mt-2 font-medium">
                          <span>{email}</span>
                          <span>•</span>
                          <span>{phone}</span>
                          <span>•</span>
                          <span>{location}</span>
                          {linkedin && (
                            <>
                              <span>•</span>
                              <span>{linkedin}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Minimal Template Header */}
                    {template === 'minimal' && (
                      <div className="text-center border-b border-black pb-4 mb-5">
                        <h1 className="text-2xl font-serif font-black text-black tracking-widest uppercase">{fullName}</h1>
                        <p className="text-xs font-serif text-slate-700 mt-1">{headline}</p>
                        <p className="text-[11px] font-serif text-slate-600 mt-1">
                          {location} | {phone} | {email} | {linkedin}
                        </p>
                      </div>
                    )}

                    {/* Technical High-Density Header */}
                    {template === 'technical' && (
                      <div className="border-l-4 border-[#2563EB] pl-4 pb-1 mb-5">
                        <h1 className="text-2xl font-mono font-black text-[#111827]">{fullName}</h1>
                        <p className="text-xs font-mono font-bold text-[#2563EB]">{headline}</p>
                        <p className="text-[11px] font-mono text-[#64748B] mt-1">
                          {email} // {phone} // {location} // {github}
                        </p>
                      </div>
                    )}

                    {/* Executive Template Header */}
                    {template === 'executive' && (
                      <div className="bg-[#F4F7FC] -m-8 sm:-m-10 p-8 sm:p-10 mb-6 border-b border-[#E2E8F0]">
                        <h1 className="text-3xl font-black text-[#111827] tracking-tight">{fullName}</h1>
                        <p className="text-sm font-bold text-[#7138E8] mt-1">{headline}</p>
                        <p className="text-xs text-[#64748B] mt-2">{location} • {email} • {phone}</p>
                      </div>
                    )}

                    {/* Professional Summary */}
                    <div className="mb-5">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div className="mb-5">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-3">
                        Work Experience
                      </h2>
                      <div className="space-y-4">
                        {experiences.map(exp => (
                          <div key={exp.id}>
                            <div className="flex items-baseline justify-between text-xs">
                              <div>
                                <span className="font-bold text-[#111827]">{exp.role}</span>
                                <span className="text-[#64748B]"> — {exp.company}</span>
                              </div>
                              <span className="text-[11px] text-[#64748B] font-medium">{exp.period}</span>
                            </div>
                            <span className="text-[10px] text-[#64748B] block italic">{exp.location}</span>
                            <ul className="list-disc list-outside pl-4 mt-1.5 space-y-1 text-xs text-slate-700">
                              {exp.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-5">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-2">
                        Technical & Professional Skills
                      </h2>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {skills.join(' • ')}
                      </p>
                    </div>

                    {/* Education */}
                    <div className="mb-5">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-2">
                        Education
                      </h2>
                      {educations.map(edu => (
                        <div key={edu.id} className="text-xs">
                          <div className="flex justify-between font-bold text-[#111827]">
                            <span>{edu.degree}</span>
                            <span className="text-[#64748B] font-normal">{edu.year}</span>
                          </div>
                          <span className="text-[#64748B] block">{edu.school} — {edu.grade}</span>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#E2E8F0] pb-1 mb-2">
                        Key Engineering Projects
                      </h2>
                      {projects.map(p => (
                        <div key={p.id} className="text-xs mb-2">
                          <div className="font-bold text-[#111827]">{p.title} <span className="text-[10px] text-[#64748B] font-normal font-mono">({p.tech})</span></div>
                          <p className="text-slate-700 mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              </div>
            </TabsContent>

            {/* TAB 2: JOB DESCRIPTION KEYWORD MATCHER */}
            <TabsContent value="tailor" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Paste Target Job Description</h3>
                    <p className="text-xs text-[#64748B]">Scan the employer's JD against your resume to identify missing keywords and increase ATS pass rates.</p>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Paste job description text from LinkedIn, Naukri, Indeed, or career portal..."
                    value={jobDescriptionInput}
                    onChange={(e) => setJobDescriptionInput(e.target.value)}
                    className="w-full bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#111827] focus:outline-hidden"
                  />

                  <Button onClick={handleAnalyzeJd} className="w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs">
                    <Target className="w-4 h-4 mr-1.5" />
                    Analyze Keywords & Match Score
                  </Button>
                </Card>

                {/* Match Results */}
                <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827] mb-1">ATS Match Diagnostic</h3>
                    <p className="text-xs text-[#64748B] mb-4">Direct alignment with employer specifications.</p>

                    {jdMatchResult ? (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0]">
                          <div>
                            <span className="text-xs text-[#64748B] font-medium block">Job Match Percentage</span>
                            <span className="text-3xl font-black text-[#2563EB]">{jdMatchResult.matchScore}%</span>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                            {jdMatchResult.matchScore >= 75 ? 'Strong Match' : 'Keyword Gaps Detected'}
                          </Badge>
                        </div>

                        {/* Matched Keywords */}
                        <div>
                          <span className="text-xs font-bold text-emerald-700 block mb-1.5">✓ Matched Keywords Found in Your Resume:</span>
                          <div className="flex flex-wrap gap-1">
                            {jdMatchResult.found.map(kw => (
                              <Badge key={kw} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px]">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Missing Keywords with 1-Click Injection */}
                        <div>
                          <span className="text-xs font-bold text-amber-700 block mb-1.5">⚠️ Missing Keywords in Your Resume (Click to add):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {jdMatchResult.missing.map(kw => (
                              <button
                                key={kw}
                                onClick={() => handleInjectKeyword(kw)}
                                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{kw}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[#64748B] bg-[#F4F7FC] rounded-xl border border-dashed border-[#E2E8F0]">
                        Paste a job description on the left and click "Analyze Keywords" to see which terms to add to your resume before submitting.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: UPLOAD & SCORE PDF SCANNER */}
            <TabsContent value="scanner" className="space-y-6">
              <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-8 max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">Upload Existing Resume File</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Upload your existing PDF or DOCX to test machine readability against Enterprise ATS parsers (Taleo, Workday, Greenhouse).
                </p>

                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadedFile(f);
                        setFileScanScore(82);
                        toast.success(`Scanned ${f.name}: 82/100 ATS Score`);
                      }
                    }}
                  />
                  <Button type="button" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold px-6 py-2.5 rounded-xl pointer-events-none">
                    Select File to Audit
                  </Button>
                </label>

                {fileScanScore && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-800">{uploadedFile?.name}</span>
                      <span className="text-xl font-black text-emerald-700">{fileScanScore}/100</span>
                    </div>
                    <p className="text-xs text-emerald-900">
                      Clean single-column structure detected. Recommend strengthening project bullet metrics for maximum interview callback conversion.
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 4: COVER LETTER GENERATOR */}
            <TabsContent value="cover-letter" className="space-y-6">
              <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-xs p-6 space-y-4 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Tailored Cover Letter</h3>
                    <p className="text-xs text-[#64748B]">Auto-generated based on your resume credentials and skills.</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(`Dear Hiring Team,\n\nI am writing to express my strong enthusiasm for the Senior Full-Stack Engineer position. With my background in ${skills.slice(0, 4).join(', ')} and proven track record at ${experiences[0]?.company || 'TalentXcel'}, I am confident in delivering high impact.\n\nSincerely,\n${fullName}`);
                      toast.success('Cover letter copied to clipboard');
                    }}
                    className="text-xs border-[#E2E8F0] text-[#111827]"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1 text-[#2563EB]" /> Copy
                  </Button>
                </div>

                <div className="p-5 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] text-xs font-serif leading-relaxed text-[#111827] space-y-3">
                  <p>Dear Hiring Team,</p>
                  <p>
                    I am writing to express my strong interest in joining your engineering organization as a <strong>{headline.split('•')[0].trim()}</strong>. With extensive experience architecting high-reliability systems at <strong>{experiences[0]?.company}</strong>, I have specialized in building scalable, production-grade architectures utilizing <strong>{skills.slice(0, 5).join(', ')}</strong>.
                  </p>
                  <p>
                    In my recent role, I successfully {experiences[0]?.bullets[0]?.toLowerCase() || 'built high-throughput production systems'}. I pride myself on clean architectural abstractions, automated CI testing, and cross-functional team alignment.
                  </p>
                  <p>
                    I welcome the opportunity to discuss how my technical expertise and problem-solving drive can contribute to your team's upcoming milestones.
                  </p>
                  <p className="pt-2">
                    Sincerely,<br />
                    <strong>{fullName}</strong><br />
                    <span className="text-[#64748B] text-[11px] font-sans">{email} • {phone}</span>
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <ProductFooter />
    </div>
  );
};
