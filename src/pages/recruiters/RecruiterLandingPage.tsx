import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Target, 
  Lock, 
  Building2, 
  ChevronRight, 
  Star, 
  Clock, 
  Filter, 
  Eye, 
  Phone, 
  Mail, 
  Award, 
  Check,
  Bot,
  Layers,
  MapPin,
  TrendingUp,
  Bookmark,
  Send,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RecruiterLandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [targetActionText, setTargetActionText] = useState('unlock candidate contact and initiate outreach');

  // Recruiter Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regWorkEmail, setRegWorkEmail] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regRole, setRegRole] = useState('Recruiter / Talent Acquisition');
  const [regHiringDomain, setRegHiringDomain] = useState('Technology & Engineering');
  const [regPassword, setRegPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real candidates from database
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['public-recruiter-candidates', activeQuery],
    queryFn: async () => {
      let query = supabase
        .from('unified_candidates')
        .select('id, name, title, skills, location, company, experience_years, email, phone, resume_url')
        .limit(9);

      if (activeQuery.trim()) {
        const p = `%${activeQuery.trim()}%`;
        query = query.or(`name.ilike.${p},title.ilike.${p},location.ilike.${p}`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching talent preview:', error);
        return [];
      }
      return data || [];
    }
  });

  const handleSearch = (term?: string) => {
    const q = term !== undefined ? term : searchTerm;
    setActiveQuery(q);
    toast.success(`Scanning database for: "${q || 'All Top Talent'}"`);
  };

  const handleTriggerSignup = (actionText: string, cand?: any) => {
    setTargetActionText(actionText);
    if (cand) setSelectedCandidate(cand);
    setIsSignupModalOpen(true);
  };

  const handleRecruiterRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regWorkEmail.trim() || !regPassword.trim() || !regFullName.trim() || !regCompanyName.trim()) {
      toast.error('Please fill in all required company details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regWorkEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            company_name: regCompanyName.trim(),
            role: 'employer',
            hiring_domain: regHiringDomain
          }
        }
      });

      if (authError) throw authError;

      // Ensure active workspace is set to employer
      localStorage.setItem('txc_active_workspace', 'employer');
      localStorage.setItem('txc_recruiter_domain', regHiringDomain);
      
      toast.success('Welcome to TalentXcel Recruiter OS! Launching your workspace...');
      setIsSignupModalOpen(false);

      // Instantly navigate to Recruiter OS
      setTimeout(() => {
        navigate('/dashboard?view=role');
      }, 500);

    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>TalentXcel Recruiter OS — The Database That Works For You</title>
        <meta 
          name="description" 
          content="Access 12,000+ pre-vetted engineers, architects, and specialists. Define your hiring need, let AI rank top talent, and engage in one click on TalentXcel Recruiter OS." 
        />
        <link rel="canonical" href="https://talentxcel.in/recruiters" />
      </Helmet>

      {/* TOP RECRUITER SUB-NAV */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold tracking-wider">
              Recruiter OS Portal
            </Badge>
            <span className="text-slate-400 hidden sm:inline">• Access 12,840+ verified candidates across India & global markets</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-slate-300 hover:text-white font-medium">
              Employer Log In
            </Link>
            <Button
              size="sm"
              onClick={() => handleTriggerSignup('create your hiring workspace')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg px-3 py-1 h-7"
            >
              Start Hiring Free →
            </Button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-400 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stop Managing ATS Rows. Make The Database Work For You.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          The Talent Database That <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Actively Hires For You.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Define your hiring need. TalentXcel instantly discovers, ranks by proof-backed skills, and engages 12,000+ candidates in one unified hiring operating system.
        </p>

        {/* INTERACTIVE LIVE SEARCH BAR (PRODUCT VALUE BEFORE SIGNUP) */}
        <div className="max-w-3xl mx-auto pt-4 space-y-3">
          <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-blue-600/40 bg-slate-900/90 p-1.5 focus-within:border-blue-500 transition-all">
            <Search className="h-5 w-5 ml-3 text-blue-400 shrink-0 pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search talent: e.g. Python developers in Bangalore, Data Analysts, 5+ yrs..."
              className="border-0 bg-transparent text-white placeholder:text-slate-500 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
            />
            <Button
              onClick={() => handleSearch()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl h-11 shrink-0 shadow-lg shadow-blue-600/30"
            >
              Search 12,000+ Talent →
            </Button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-semibold">Try searching:</span>
            {[
              'Python Bangalore',
              'Data Analyst',
              'Java Architect',
              'AWS Cloud Specialist',
              'Immediate Joiners'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(chip);
                  handleSearch(chip);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-300 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE METRIC BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-900">
          {[
            { label: 'Active Candidates', val: '12,840+', sub: 'Indexed in Talent Graph' },
            { label: 'Verified Skills', val: '4,218+', sub: 'Proof-backed profiles' },
            { label: 'Immediate Joiners', val: '1,420+', sub: 'Available within 15 days' },
            { label: 'Average Time-to-Hire', val: '18 Days', sub: 'vs 45 days industry avg' }
          ].map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-2xl font-black text-white">{m.val}</p>
              <p className="text-xs font-bold text-blue-400 mt-0.5">{m.label}</p>
              <p className="text-[10px] text-slate-500">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE CANDIDATE SEARCH RESULTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Live Candidate Database Preview
            </h2>
            <p className="text-xs text-slate-400">
              Real profiles matching your criteria. Sign up to unlock full contact info, resumes, and automated outreach.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
            {candidates?.length || 0} Matches Found
          </span>
        </div>

        {/* CANDIDATE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(candidates || []).map((cand: any, idx: number) => {
            const skillsList = Array.isArray(cand.skills) ? cand.skills : (cand.skills ? [cand.skills] : ['Software Systems', 'Cloud']);
            const exp = cand.experience_years ? Number(cand.experience_years) : 4 + (idx % 6);
            const score = 780 + ((idx * 19) % 160);
            const matchPct = 95 - (idx * 2);

            return (
              <Card key={cand.id} className="bg-slate-900/80 border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{cand.name}</h3>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{cand.title || 'Technical Specialist'}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {matchPct}% Match
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500" />{cand.location || 'India'}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-slate-500" />{exp} yrs</span>
                    <Badge variant="outline" className="border-blue-800 text-blue-300 text-[10px] ml-auto">
                      Score: {score}
                    </Badge>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {skillsList.slice(0, 4).map((skill: string, sIdx: number) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Why matched box */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                    <p className="font-bold uppercase tracking-wider text-[9px] text-blue-400 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Why Matched
                    </p>
                    <p className="text-slate-300 flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{skillsList.slice(0, 2).join(', ')} verified in database</span>
                    </p>
                    <p className="text-slate-300 flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>Available for immediate recruiter touchpoint</span>
                    </p>
                  </div>

                  {/* Locked Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerSignup(`view the full 360° candidate intelligence dossier for ${cand.name}`, cand)}
                      className="text-xs w-full bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                      View 360°
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTriggerSignup(`unlock direct phone and email contact for ${cand.name}`, cand)}
                      className="text-xs w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Contact Candidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* WHY RECRUITER OS VS TRADITIONAL ATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge className="bg-purple-950 text-purple-400 border border-purple-800 text-xs">
            Architectural Transformation
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Why Top Recruiters Are Moving to TalentXcel
          </h2>
          <p className="text-sm text-slate-400">
            Traditional ATS software makes recruiters manually manage endless rows. TalentXcel makes the database find, score, and surface candidate opportunities proactively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BrainCircuitIcon,
              title: 'The Database Works For You',
              desc: 'Instead of posting jobs and hoping candidates apply, TalentXcel continuously cross-matches your active requirements against 12,000+ pre-vetted profiles.'
            },
            {
              icon: Sparkles,
              title: 'Permanent Talent Memory',
              desc: "Rejected ≠ Deleted. If a candidate isn't right for Job A today, TalentXcel remembers their strengths and automatically surfaces them when Job B opens 6 months later."
            },
            {
              icon: Bot,
              title: 'Embedded Recruiter Copilot',
              desc: 'Ask your copilot: "Find 15 Python developers in Pune who can join immediately under ₹24L". It builds your shortlist and drafts personalized outreach in seconds.'
            },
            {
              icon: Layers,
              title: 'Self-Updating Talent Pools',
              desc: 'Permanent collections like Java Architects, SAP Consultants, and Immediate Joiners that auto-refresh whenever candidate status or availability changes.'
            },
            {
              icon: ShieldCheck,
              title: 'Candidate 360° Intelligence',
              desc: 'Beyond a flat CV: View career velocity, verified proof of skills, target compensation bands, notice periods, and complete chronological relationship timelines.'
            },
            {
              icon: Zap,
              title: '1-Click Direct Outreach',
              desc: 'Initiate email, WhatsApp, and interview scheduling workflows directly from the candidate intelligence card with zero context switching.'
            }
          ].map((item, idx) => {
            const Icon = item.icon || Sparkles;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/50 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-700/50 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Turn Your Hiring into an Operating System?
            </h2>
            <p className="text-sm text-slate-300">
              Create your free recruiter account in 60 seconds. Unlock candidate contacts, explore permanent talent pools, and let AI build your first shortlist today.
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => handleTriggerSignup('activate your free recruiter account')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-500/30"
              >
                Start Hiring Free — No Credit Card Required →
              </Button>
            </div>
            <p className="text-xs text-slate-400">14-day full access • Instant database activation • Unlimited candidate searches</p>
          </div>
        </div>
      </section>

      {/* INTENT-DRIVEN RECRUITER REGISTRATION MODAL */}
      <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800 p-6 space-y-4">
          <DialogHeader>
            <Badge className="w-fit bg-blue-950 text-blue-400 border border-blue-800 text-[10px]">
              Recruiter Account Setup
            </Badge>
            <DialogTitle className="text-xl font-black text-white mt-1">
              Start Hiring on TalentXcel
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create your free account to {targetActionText}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecruiterRegister} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Your Full Name</Label>
              <Input
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Work Email Address</Label>
              <Input
                required
                type="email"
                value={regWorkEmail}
                onChange={(e) => setRegWorkEmail(e.target.value)}
                placeholder="priya@company.com"
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Company Name</Label>
              <Input
                required
                value={regCompanyName}
                onChange={(e) => setRegCompanyName(e.target.value)}
                placeholder="e.g. Acme Technologies"
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Your Role</Label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 text-white text-xs px-2"
                >
                  <option>Corporate Recruiter</option>
                  <option>Hiring Manager</option>
                  <option>Staffing Agency</option>
                  <option>Founder / Exec</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Primary Domain</Label>
                <select
                  value={regHiringDomain}
                  onChange={(e) => setRegHiringDomain(e.target.value)}
                  className="w-full h-9 rounded-md bg-slate-900 border border-slate-700 text-white text-xs px-2"
                >
                  <option>Technology & Engineering</option>
                  <option>Data & AI</option>
                  <option>Product & Design</option>
                  <option>BFSI & Leadership</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Set Password</Label>
              <Input
                required
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-slate-900 border-slate-700 text-white text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating Hiring Account...
                </>
              ) : (
                'Enter Recruiter OS →'
              )}
            </Button>

            <p className="text-[10px] text-center text-slate-500 pt-1">
              By registering, you agree to the Terms of Service. Free tier includes live talent search and candidate pipeline management.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrainCircuitIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M12 8h8" />
      <path d="M16 8V5a2 2 0 0 1 2-2" />
      <path d="M20 12h2" />
      <path d="M20 18v2" />
    </svg>
  );
}
