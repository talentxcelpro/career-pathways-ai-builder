import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Star
} from 'lucide-react';
import { PLATFORM_METRICS } from '@/config/platformMetrics';

export const PassportAcquisitionLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <SEOHead 
        title="Career Passport | Your Universal Proof of Talent | TalentXcel" 
        description="Build your verified Career Passport. Showcase cryptographically verified skills, proof-of-work, and credentials to global employers." 
        canonical="https://passport.talentxcel.in/" 
        type="website" 
      />

      {/* SUB-HEADER BANNER */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold tracking-wider">
              Career Passport Protocol
            </Badge>
            <span className="text-slate-400 hidden sm:inline">• Universal, portable career credential for top global talent</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-slate-300 hover:text-white font-medium">
              Log In
            </Link>
            <Button
              size="sm"
              onClick={() => navigate('/auth/register?intent=passport')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg px-3 py-1 h-7"
            >
              Claim Free Passport →
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-400 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifiable Cryptographic Proof of Talent</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              One Verified Identity. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Every Career Opportunity.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Traditional resumes are unverified claims easily discarded by filters. The TalentXcel 
              Career Passport binds your work history, verified skills, and certifications into a 
              single portable, tamper-evident digital credential recognized by global employers.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/auth/register?intent=passport')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-base px-8 py-6 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Claim Your Free Career Passport
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth/login')}
                className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-base px-6 py-6 rounded-xl"
              >
                Sign In to Your Passport
              </Button>
            </div>

            {/* Quick Proof Points */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  100% Free
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">Zero fees for candidates</p>
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-blue-400" />
                  Privacy-First
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">You own your data & contact</p>
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-purple-400" />
                  Instant Sharing
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">QR, vCard, and direct links</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Passport Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-xl"></div>

              {/* Passport Card */}
              <div className="relative rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-md">
                      TX
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-widest text-blue-400">Career Passport</p>
                      <h3 className="text-base font-bold text-white">Verified Candidate Profile</h3>
                    </div>
                  </div>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {/* Score & Tier Banner */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Talent Score</span>
                    <p className="text-xl font-black text-white flex items-center gap-1.5">
                      895 <span className="text-[10px] text-emerald-400 font-bold">/ 1000</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Passport Tier</span>
                    <p className="text-xl font-black text-purple-400 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-purple-400" />
                      Diamond
                    </p>
                  </div>
                </div>

                {/* Verified Competencies */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Competencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Full-Stack Architecture', 'TypeScript', 'Cloud Systems', 'AI Workflows', 'Performance Tuning'].map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-200 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Share Feature Row */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <QrCode className="h-4 w-4 text-blue-400" />
                    QR Verification Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-indigo-400" />
                    talentxcel.in/@yourname
                  </span>
                </div>

                <Button 
                  onClick={() => navigate('/auth/register?intent=passport')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Create Your Passport in 60 Seconds
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 PILLARS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs">
            Architectural Superiority
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Why Professionals Choose Career Passport
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to overcome ATS algorithmic bias, eliminate resume fraud, and present your true engineering and leadership value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Proof Over Promises</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resumes make claims; Career Passports prove them. Verified project links, git contributions, test benchmarks, and institutional credentials in one tamper-evident record.
            </p>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Instant Universal Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share your custom QR code at conferences, link your passport in job applications, export your vCard, or embed a live verification badge on your portfolio.
            </p>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-white">100% Privacy & Ownership</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your contact details remain strictly confidential. Verified employers can send connection requests and inquiries through the platform without scraping your personal phone or email.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA STRIP */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-black text-white">
          Join {PLATFORM_METRICS.totalProfessionalsDisplay} Professionals Building Their Verified Career Future
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Set up takes under 2 minutes. Import your existing resume, verify your credentials, and unlock direct recruiter discovery.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            onClick={() => navigate('/auth/register?intent=passport')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-base px-8 py-6 rounded-xl shadow-xl shadow-blue-600/30"
          >
            Create Your Free Career Passport Now →
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PassportAcquisitionLanding;
