// src/pages/passport/components/PassportAcquisitionLanding.tsx
// Independent Standalone Product for passport.talentxcel.in (Career Passport)
// Flagship Enterprise-Grade UI with Apple/Stripe-level Typography & In-Sync Real Imagery

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
  Fingerprint,
  CheckCheck
} from 'lucide-react';
import { CareerPassportHeader } from './CareerPassportHeader';
import { CareerPassportPricingSection } from './CareerPassportPricingSection';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { toast } from 'sonner';

export const PassportAcquisitionLanding: React.FC = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('skills');
  const talentId = 'TXP-8F3D2A9E';

  const handleCopyId = () => {
    navigator.clipboard.writeText(talentId);
    setCopiedId(true);
    toast.success('Talent ID copied to clipboard: ' + talentId);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <SEOHead 
        title="Career Passport | Your Verified, Portable Career Identity | TalentXcel" 
        description="A government-grade, tamper-evident professional identity that securely records and cryptographically verifies your education, skills, work experience and achievements." 
        canonical="https://passport.talentxcel.in/" 
        type="website" 
      />

      {/* Single Unified Clean Navigation Header */}
      <CareerPassportHeader />

      <main className="flex-1">

        {/* ─────────────────────────────────────────────────────────────
            1. HERO SECTION (High-Impact Typography & Interactive Card)
           ───────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-b from-white via-white to-[#F8FAFC] px-4 pt-8 pb-12 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Subtitle, CTAs & 4 Trust Pills */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Top Badge: Claim your passport (Exact user request) */}
              <button
                type="button"
                onClick={() => navigate('/auth/register?intent=passport')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 text-blue-700 text-xs font-bold shadow-2xs backdrop-blur-xs transition-all cursor-pointer group"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="tracking-tight font-extrabold">Claim your passport</span>
                <ArrowRight className="h-3 w-3 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Main Headline with Editorial Typography */}
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-slate-900 tracking-[-0.035em] leading-[1.1]">
                Your Career Identity. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-2xs">
                  Verified. Portable. Global.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-normal">
                A government-grade, tamper-evident professional identity that securely records and cryptographically certifies your education, skills, work experience, and achievements — trusted by Fortune 500 employers, universities, and partners worldwide.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth/register?intent=passport')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-5 rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Create Free Career Passport</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                  <span>How It Works</span>
                </a>
              </div>

              {/* 4 Trust Micro-Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 border-t border-slate-200/80 text-xs">
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">100% Secure</span>
                    <span className="text-slate-500 text-[10px] leading-tight block">Encrypted & tamper-evident</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-md bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Privacy-First</span>
                    <span className="text-slate-500 text-[10px] leading-tight block">You control your data</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-md bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Verified Records</span>
                    <span className="text-slate-500 text-[10px] leading-tight block">Education, skills & work</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Globally Trusted</span>
                    <span className="text-slate-500 text-[10px] leading-tight block">Accepted by employers</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Compact, Perfectly Proportioned Career Passport ID Card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md flex items-center gap-2.5">
                
                {/* Specular Neon Glow */}
                <div className="absolute -inset-1.5 rounded-[32px] bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-20 blur-xl pointer-events-none" />

                {/* Main Glassmorphic Passport ID Card */}
                <div className="relative flex-1 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xl shadow-blue-900/10 space-y-3.5 text-left min-w-0">
                  
                  {/* Passport Brand Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                        TX
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 block">
                          TalentXcel
                        </span>
                        <h4 className="text-xs font-black text-slate-900">
                          Career Passport
                        </h4>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold py-0 px-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SEALED
                    </Badge>
                  </div>

                  {/* Profile Strip with Clean 48x48 Avatar Thumbnail & Talent ID */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" 
                          alt="Sarah Jenkins" 
                          className="rounded-xl object-cover border border-slate-200 shadow-2xs"
                          style={{ width: 44, height: 44 }}
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 border border-white flex items-center justify-center shadow-2xs">
                          <Check className="w-2 h-2 text-white stroke-[3]" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                          TALENT ID
                        </span>
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-900">
                          <span>{talentId}</span>
                          <button
                            type="button"
                            onClick={handleCopyId}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy Talent ID"
                          >
                            {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs shrink-0 text-center">
                      <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                  </div>

                  {/* Verification Status & Tier Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-100">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">
                        VERIFICATION STATUS
                      </span>
                      <div className="text-xs font-black text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">
                        PASSPORT TIER
                      </span>
                      <div className="text-xs font-black text-purple-700 flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-purple-600 text-purple-600" />
                        <span>Diamond</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Cryptographic Status */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Cryptographically Sealed
                    </span>
                    <span className="font-bold text-blue-600">
                      Status: Active
                    </span>
                  </div>

                </div>

                {/* Right Stacked Category Tabs (Neatly placed next to card) */}
                <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
                  <div 
                    onClick={() => setActiveCategoryTab('identity')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      activeCategoryTab === 'identity' 
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="whitespace-nowrap">Identity & Profile</span>
                  </div>

                  <div 
                    onClick={() => setActiveCategoryTab('credentials')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      activeCategoryTab === 'credentials' 
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <FileBadge className="w-3.5 h-3.5 text-purple-600" />
                    <span className="whitespace-nowrap">Credentials & Certificates</span>
                  </div>

                  <div 
                    onClick={() => setActiveCategoryTab('skills')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      activeCategoryTab === 'skills' 
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span className="whitespace-nowrap">Skills & Competencies</span>
                  </div>

                  <div 
                    onClick={() => setActiveCategoryTab('work')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      activeCategoryTab === 'work' 
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">Work History</span>
                  </div>

                  <div 
                    onClick={() => setActiveCategoryTab('projects')}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      activeCategoryTab === 'projects' 
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span className="whitespace-nowrap">Projects & Achievements</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            2. BUILT ON TRUSTED VERIFICATION INFRASTRUCTURE
           ───────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-10">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 border border-blue-100/90 p-4 sm:p-5 shadow-xs text-center space-y-3.5">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Built on Trusted Verification Infrastructure
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-left">
              
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Education</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-indigo-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Employment</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Skill</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-emerald-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Certification</div>
                  <div className="text-[10px] text-slate-500">Validation</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-sky-300 transition-all">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Identity</div>
                  <div className="text-[10px] text-slate-500">Verification</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-amber-300 transition-all">
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
            3. BUILT FOR THE MODERN TALENT ECONOMY (Real, In-Sync Images)
           ───────────────────────────────────────────────────────────── */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Built for the <br className="hidden sm:inline" />Modern Talent Economy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md font-normal leading-relaxed">
              A complete, verified and portable career credential that works across opportunities — jobs, learning, certifications, hiring and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* ── CARD 1: FOR PROFESSIONALS ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group">
              <div>
                {/* Real, Properly Framed High-Res Photo (Full Head & Torso, Never Cut Off) */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" 
                    alt="Professional Sovereign Identity" 
                    className="w-full h-full object-cover object-[center_15%] group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Subtle Gradient at Top for Clean Pill Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20" />
                  
                  {/* Crisp Pill Badge (Positioned at top so face is 100% visible) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white font-extrabold text-[10px] shadow-sm backdrop-blur-xs">
                      Career Sovereignty
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-white font-bold text-[9px] backdrop-blur-xs">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Professionals</h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  Get Your Passport →
                </Button>
              </div>
            </div>

            {/* ── CARD 2: FOR EMPLOYERS & RECRUITERS ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group">
              <div>
                {/* Real, In-Sync High-Res Photo (Hiring Team with Laptop) */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" 
                    alt="Employers & Recruiters" 
                    className="w-full h-full object-cover object-[center_30%] group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Subtle Gradient at Top for Clean Pill Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20" />
                  
                  {/* Crisp Pill Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 text-white font-extrabold text-[10px] shadow-sm backdrop-blur-xs">
                      Zero-Fraud Hiring
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-white font-bold text-[9px] backdrop-blur-xs">
                      ⚡ 0.4s Verification
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Employers & Recruiters</h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  Request Enterprise Demo →
                </Button>
              </div>
            </div>

            {/* ── CARD 3: FOR INSTITUTIONS & PARTNERS ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group">
              <div>
                {/* Real, In-Sync High-Res Photo (Diverse University Graduates Celebrating) */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
                    alt="Institutions & Partners" 
                    className="w-full h-full object-cover object-[center_35%] group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Subtle Gradient at Top for Clean Pill Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20" />
                  
                  {/* Crisp Pill Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-purple-600/90 text-white font-extrabold text-[10px] shadow-sm backdrop-blur-xs">
                      Accredited Issuance
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-white font-bold text-[9px] backdrop-blur-xs">
                      W3C Verified
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3.5 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">For Institutions & Partners</h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
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
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="text-left space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-200">
                Key Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
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
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img 
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80" 
                            alt="My Career Passport" 
                            className="w-full h-full object-cover"
                          />
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
                    <div className="text-[9px] font-black uppercase text-blue-600">TX Career Passport</div>
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
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-blue-600 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Verified Identity</h4>
                  <p className="text-[11px] text-slate-500">A trusted professional profile</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-purple-600 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Credential Wallet</h4>
                  <p className="text-[11px] text-slate-500">All certificates in one place</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-indigo-600 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">QR Verification</h4>
                  <p className="text-[11px] text-slate-500">Instant, tamper-evident check</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-rose-600 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Skill Intelligence</h4>
                  <p className="text-[11px] text-slate-500">Validated, up-to-date skills</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-emerald-600 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Portable & Shareable</h4>
                  <p className="text-[11px] text-slate-500">Use anywhere, anytime</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-1 hover:border-amber-600 transition-colors">
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
