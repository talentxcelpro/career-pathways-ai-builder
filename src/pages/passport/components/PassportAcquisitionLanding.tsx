// src/pages/passport/components/PassportAcquisitionLanding.tsx
// Independent Standalone Product for passport.talentxcel.in (Career Passport)
// Visual design strictly matching the user mockup + Single Unified Navbar + Cohesive Pixel-Perfect Spacing

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Share2, 
  CheckCircle2, 
  Lock, 
  Globe, 
  ArrowRight, 
  Users, 
  Award, 
  Building2, 
  Zap, 
  FileCheck,
  Star,
  Play,
  Briefcase,
  Layers,
  GraduationCap,
  Trophy,
  Check,
  Copy,
  Gauge,
  UserCheck,
  FileBadge,
  User
} from 'lucide-react';
import { CareerPassportHeader } from './CareerPassportHeader';
import { CareerPassportPricingSection } from './CareerPassportPricingSection';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import universityLearningImg from '@/assets/university-learning.jpg';
import employerHeroImg from '@/assets/employer-hero.jpg';
import { toast } from 'sonner';

export const PassportAcquisitionLanding: React.FC = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const talentId = 'TXP-8F3D2A9E';

  const handleCopyId = () => {
    navigator.clipboard.writeText(talentId);
    setCopiedId(true);
    toast.success('Talent ID copied to clipboard: ' + talentId);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <SEOHead 
        title="Career Passport | Your Verified, Portable Career Identity | TalentXcel" 
        description="A government-grade, tamper-evident professional identity that securely records and verifies your education, skills, work experience and achievements." 
        canonical="https://passport.talentxcel.in/" 
        type="website" 
      />

      {/* Single Unified Clean Navigation Header (Dual Navbar Removed) */}
      <CareerPassportHeader />

      <main className="flex-1">

        {/* ─────────────────────────────────────────────────────────────
            1. HERO SECTION (Tightly spaced, pixel-perfect match)
           ───────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] px-4 pt-8 pb-10 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Subtitle, CTAs & 4 Trust Pills */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              {/* Top Badge (Exact from Mockup) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Trusted Digital Career Identity</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#111827] tracking-tight leading-[1.12]">
                Your Career Identity. <br />
                <span className="bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#7138E8] bg-clip-text text-transparent">
                  Verified. Portable. Global.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed font-normal">
                A government-grade, tamper-evident professional identity that securely records and verifies your education, skills, work experience and achievements — trusted by employers, institutions and partners worldwide.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth/register?intent=passport')}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <span>Create Free Career Passport</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#111827] font-bold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <span>How It Works</span>
                  <Play className="h-3 w-3 fill-[#2563EB] text-[#2563EB]" />
                </a>
              </div>

              {/* 4 Trust Micro-Pills (Single neat row) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 border-t border-[#E2E8F0] text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#111827] block text-xs">100% Secure</span>
                    <span className="text-[#64748B] text-[10px]">Encrypted & tamper-evident</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#111827] block text-xs">Privacy-First</span>
                    <span className="text-[#64748B] text-[10px]">You control your data</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-[#7138E8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#111827] block text-xs">Verified Records</span>
                    <span className="text-[#64748B] text-[10px]">Education, skills & work</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#111827] block text-xs">Globally Recognized</span>
                    <span className="text-[#64748B] text-[10px]">Accepted by employers</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Glowing 3D Glassmorphism Career Passport Card with Stacked Side Tabs */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md flex items-center gap-2.5">
                
                {/* 3D Glowing Neon Backdrop */}
                <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-500 opacity-30 blur-xl pointer-events-none" />

                {/* Main Card (Compact, proportional & matching Mockup) */}
                <div className="relative flex-1 rounded-3xl bg-gradient-to-b from-white via-white to-blue-50/50 border border-blue-200/90 p-5 shadow-xl shadow-blue-900/10 space-y-4 text-left">
                  
                  {/* Passport Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#7138E8] flex items-center justify-center text-white font-black text-xs shadow-xs">
                        TX
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-[#2563EB] block">
                          TalentXcel
                        </span>
                        <h4 className="text-xs font-black text-[#111827]">
                          Career Passport
                        </h4>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-[#2563EB] border border-blue-200 text-[9px] font-black py-0 px-2">
                      TX
                    </Badge>
                  </div>

                  {/* Profile Strip with Avatar & Verification Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white shadow-xs flex items-center justify-center text-slate-400">
                          <User className="w-7 h-7" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2563EB] border border-white flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                          Talent ID
                        </span>
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-[#111827]">
                          <span>{talentId}</span>
                          <button
                            type="button"
                            onClick={handleCopyId}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy Talent ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Graphic Container */}
                    <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 text-center">
                      <QrCode className="w-9 h-9 text-slate-900" />
                    </div>
                  </div>

                  {/* Verification Status & Tier */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-purple-50/90 border border-blue-100">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[#64748B] font-bold block">
                        Verification Status
                      </span>
                      <div className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[#64748B] font-bold block">
                        Passport Tier
                      </span>
                      <div className="text-xs font-black text-[#7138E8] flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-[#7138E8]" />
                        <span>Diamond</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Verification Status */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Cryptographically Sealed
                    </span>
                    <span className="font-bold text-[#2563EB]">
                      Status: Active
                    </span>
                  </div>

                </div>

                {/* Right Stacked Category Tabs (Identity & Profile, Credentials, Skills, Work History, Projects) */}
                <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700 flex items-center gap-2 hover:border-[#2563EB] transition-colors">
                    <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="whitespace-nowrap">Identity & Profile</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700 flex items-center gap-2 hover:border-[#2563EB] transition-colors">
                    <FileBadge className="w-3.5 h-3.5 text-[#7138E8]" />
                    <span className="whitespace-nowrap">Credentials & Certificates</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-blue-50 border-2 border-[#2563EB] shadow-xs text-[11px] font-bold text-[#2563EB] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="whitespace-nowrap">Skills & Competencies</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700 flex items-center gap-2 hover:border-[#2563EB] transition-colors">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">Work History</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-[11px] font-bold text-slate-700 flex items-center gap-2 hover:border-[#2563EB] transition-colors">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="whitespace-nowrap">Projects & Achievements</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            2. BUILT ON TRUSTED VERIFICATION INFRASTRUCTURE (Tight Integrated Container)
           ───────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-8">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 border border-blue-100/90 p-4 sm:p-5 shadow-xs text-center space-y-3.5">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Built on Trusted Verification Infrastructure
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-left">
              
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Education</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Employment</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Skill</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Certification</div>
                  <div className="text-[10px] text-slate-500">Validation</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Identity</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Financial Readiness</div>
                  <div className="text-[9px] text-slate-500">(CIBIL-style Insights)</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. BUILT FOR THE MODERN TALENT ECONOMY (3 Customer Segments)
           ───────────────────────────────────────────────────────────── */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                Built for the <br className="hidden sm:inline" />Modern Talent Economy
              </h2>
            </div>
            <p className="text-xs text-[#64748B] max-w-md">
              A complete, verified and portable career credential that works across opportunities — jobs, learning, certifications, hiring and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: For Professionals */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-36 sm:h-40 bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
                  <img 
                    src="/passport-professionals-woman.jpg" 
                    alt="For Professionals" 
                    className="w-full h-full object-cover object-top rounded-xl"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Professionals</h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Create a verified career identity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Showcase real skills & experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Share instantly with a QR or link</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button 
                  onClick={() => navigate('/auth/register?intent=passport')}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  Get Your Passport →
                </Button>
              </div>
            </div>

            {/* Card 2: For Employers & Recruiters */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-36 sm:h-40 bg-gradient-to-tr from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                  <img 
                    src="/passport-employers-man.jpg" 
                    alt="For Employers" 
                    className="w-full h-full object-cover object-top rounded-xl"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Employers & Recruiters</h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verify talent in seconds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Reduce hiring risk & fraud</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Access skilled, trusted talent</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button 
                  onClick={() => navigate('/auth/register?intent=enterprise')}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  Request Enterprise Demo →
                </Button>
              </div>
            </div>

            {/* Card 3: For Institutions & Partners */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-36 sm:h-40 bg-gradient-to-tr from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
                  <img 
                    src="/passport-institutions-building.jpg" 
                    alt="For Institutions & Partners" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#7138E8] flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Institutions & Partners</h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Issue verifiable digital credentials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Build trusted talent pipelines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Gain global visibility & recognition</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button 
                  onClick={() => navigate('/auth/register?intent=partner')}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  Partner With Us →
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. KEY CAPABILITIES (More Than a Digital Resume)
           ───────────────────────────────────────────────────────────── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="text-left space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold uppercase tracking-wider border border-blue-200">
                Key Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                More Than a Digital Resume
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Realistic Laptop & Mobile Mockup matching screenshot */}
              <div className="lg:col-span-6 flex items-center justify-center p-2 sm:p-4">
                <div className="relative w-full max-w-lg">
                  {/* Laptop Mockup */}
                  <div className="rounded-2xl border-4 border-slate-800 bg-slate-900 p-2 shadow-2xl">
                    <div className="rounded-xl bg-white p-3 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px] font-bold text-slate-400 ml-1">talentxcel.in/@passport</span>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-bold">Verified</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">My Career Passport</div>
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                        <div className="p-2 rounded-lg bg-slate-50 text-center font-bold">
                          <span className="block text-slate-400 text-[8px]">CREDENTIALS</span>
                          <span className="text-sm font-black text-slate-900">12</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 text-center font-bold">
                          <span className="block text-slate-400 text-[8px]">EXPERIENCE</span>
                          <span className="text-sm font-black text-slate-900">5</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 text-center font-bold">
                          <span className="block text-slate-400 text-[8px]">SKILLS</span>
                          <span className="text-sm font-black text-slate-900">28</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Verification Summary
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                          <div className="p-1 rounded bg-emerald-50 text-emerald-800 text-center font-bold">
                            Education: ✓ Verified
                          </div>
                          <div className="p-1 rounded bg-emerald-50 text-emerald-800 text-center font-bold">
                            Employment: ✓ Verified
                          </div>
                          <div className="p-1 rounded bg-emerald-50 text-emerald-800 text-center font-bold">
                            Certificates: ✓ Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Mobile Phone Mockup */}
                  <div className="absolute -bottom-5 -right-2 w-36 sm:w-40 rounded-3xl border-4 border-slate-900 bg-white p-2.5 shadow-2xl space-y-1.5 text-center">
                    <div className="w-8 h-1 rounded-full bg-slate-300 mx-auto mb-1" />
                    <div className="text-[9px] font-black uppercase text-[#2563EB]">TX Career Passport</div>
                    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <QrCode className="w-14 h-14 mx-auto text-slate-900" />
                    </div>
                    <Badge className="bg-emerald-600 text-white text-[8px] font-bold w-full justify-center py-0.5">
                      ✓ Verified
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right Column: 6 Capability Cards */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Verified Identity</h4>
                  <p className="text-[11px] text-slate-500">A trusted professional profile</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Credential Wallet</h4>
                  <p className="text-[11px] text-slate-500">All certificates in one place</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">QR Verification</h4>
                  <p className="text-[11px] text-slate-500">Instant, tamper-evident check</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Skill Intelligence</h4>
                  <p className="text-[11px] text-slate-500">Validated, up-to-date skills</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Portable & Shareable</h4>
                  <p className="text-[11px] text-slate-500">Use anywhere, anytime</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-[#2563EB] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Employer Ready</h4>
                  <p className="text-[11px] text-slate-500">Built for modern hiring</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. PRICING & MONETISATION SECTION (Anchored by #pricing)
           ───────────────────────────────────────────────────────────── */}
        <div id="pricing">
          <CareerPassportPricingSection />
        </div>

      </main>

      {/* Shared Global Product Footer */}
      <ProductFooter currentProduct="Career Passport" />

    </div>
  );
};

export default PassportAcquisitionLanding;
