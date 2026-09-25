import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  ShieldCheck, 
  Briefcase, 
  PlayCircle, 
  Building2, 
  ArrowRight, 
  ChevronRight, 
  Award, 
  Network,
  Compass
} from "lucide-react";
import { PLATFORM_METRICS } from "@/config/platformMetrics";

export const About = () => {
  const pillars = [
    {
      icon: <Award className="h-7 w-7 text-blue-600 dark:text-blue-400" />,
      title: "Career Passport & Verified Identity",
      description: "A permanent, proof-backed career passport featuring verified skills, projects, and career milestones that travel with you across jobs and borders.",
      link: "/passport",
      action: "Explore Career Passport"
    },
    {
      icon: <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />,
      title: "TalentScore Merit Engine",
      description: "Objective, transparent capability scoring that eliminates resume keyword stuffing and surfaces true technical and leadership talent directly to employers.",
      link: "/tools/talent-score",
      action: "View TalentScore Details"
    },
    {
      icon: <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />,
      title: "Global Recruiter OS",
      description: "A proactive hiring operating system where candidate databases continuously work for hiring teams, cross-matching requirements in seconds.",
      link: "/recruiters",
      action: "Access Recruiter OS"
    },
    {
      icon: <Network className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      title: "Worldwide Professional Network",
      description: "Connect with tech leaders, peers, and mentors across the UAE, Europe, the Americas, India, and APAC in focused professional hubs.",
      link: "/network",
      action: "Join The Network"
    },
    {
      icon: <PlayCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />,
      title: "Career Reels & Domain Insights",
      description: "Bite-sized knowledge videos covering real interview experiences, salary transparency, and tech system designs created by industry practitioners.",
      link: "/reels",
      action: "Watch Career Reels"
    },
    {
      icon: <Briefcase className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
      title: "Borderless Opportunity Graph",
      description: "Direct access to high-impact roles at venture-backed startups and multinational enterprises with direct recruiter messaging and zero spam.",
      link: "/jobs",
      action: "Browse Global Jobs"
    },
  ];

  const globalRegions = [
    { name: "UAE & Middle East", detail: "Dubai, Abu Dhabi, Riyadh, Doha tech hubs & leadership" },
    { name: "Europe & UK", detail: "London, Berlin, Amsterdam, Paris & remote engineering teams" },
    { name: "North & South America", detail: "US tech corridors, Canada, and Latin American innovation hubs" },
    { name: "India & South Asia", detail: "Bengaluru, NCR, Mumbai, Hyderabad & pan-India leadership" },
    { name: "Southeast Asia & APAC", detail: "Singapore, Tokyo, Sydney & cross-border growth markets" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>About TalentXcel — The Global Professional Talent Network</title>
        <meta 
          name="description" 
          content="Learn how TalentXcel connects professionals, recruiters, and companies worldwide across the Americas, Europe, UAE, India, and beyond. Explore our mission, Career Passports, and Recruiter OS." 
        />
        <link rel="canonical" href="https://talentxcel.in/about" />
        <meta property="og:title" content="About TalentXcel — The Global Professional Talent Network" />
        <meta 
          property="og:description" 
          content="Where professionals build verified career identities, discover global opportunities, and get hired by top companies worldwide." 
        />
        <meta property="og:url" content="https://talentxcel.in/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About TalentXcel — The Global Professional Talent Network" />
        <meta 
          name="twitter:description" 
          content="Where professionals build verified career identities, discover global opportunities, and get hired by top companies worldwide." 
        />
        <meta name="twitter:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
      </Helmet>

      {/* TOP GLOBAL BADGE BANNER */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-bold shadow-sm">
          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>The Global Professional Talent Network</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Connecting the World's <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Professional Talent.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Where professionals build verified career identities, discover global opportunities, share knowledge, and get discovered by world-class companies and recruiters.
        </p>

        {/* Supporting Line */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 pt-2">
          <span className="text-slate-900 dark:text-white">Professionals</span>
          <span>•</span>
          <span className="text-slate-900 dark:text-white">Tech Leaders</span>
          <span>•</span>
          <span className="text-slate-900 dark:text-white">Recruiters</span>
          <span>•</span>
          <span className="text-slate-900 dark:text-white">Companies</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold hidden sm:inline">Connect. Discover. Grow. Get Hired.</span>
        </div>

        {/* GLOBAL STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{PLATFORM_METRICS.totalProfessionalsDisplay}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Global Professionals</p>
            <p className="text-[11px] text-slate-400">Indexed in Talent Graph</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{PLATFORM_METRICS.hiringTeamsDisplay}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Hiring Teams</p>
            <p className="text-[11px] text-slate-400">Active Recruiter OS Workspaces</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{PLATFORM_METRICS.activeJobsDisplay}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Verified Opportunities</p>
            <p className="text-[11px] text-slate-400">Remote & Regional Roles</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{PLATFORM_METRICS.matchSuccessRateDisplay}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Match Accuracy</p>
            <p className="text-[11px] text-slate-400">Proof-Backed Verification</p>
          </div>
        </div>
      </section>

      {/* WHO WE ARE & THE BORDERLESS MISSION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold">
                Who We Are
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                A Modern Talent Network Built Without Borders
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                TalentXcel was built on a foundational conviction: modern careers and hiring should not be trapped behind geographic walls, outdated resume formats, or black-box recruitment agencies.
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether you are a senior machine learning engineer in Berlin, a product leader in Dubai, a distributed systems architect in São Paulo, a fintech builder in Bengaluru, or an engineering manager in New York — TalentXcel bridges your verified capabilities directly with the global companies building tomorrow.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero spam • 100% merit-based discovery • Living talent graph</span>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <Badge className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                Our Mission & Vision
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Empowering Merit, Knowledge & Global Mobility
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Our Mission:</strong> To construct the world's most trusted, proof-backed talent graph where career progression is purely merit-driven, domain knowledge is freely shared, and opportunities reach talent anywhere on Earth.
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Our Vision:</strong> To operate as the global standard for professional identity, talent intelligence, and active recruiting across UAE, Europe, the Americas, and Asia.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Audited TalentScores replace resume noise with verified capability</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* GLOBAL REACH & HUBS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-blue-200 dark:border-blue-900/40 rounded-3xl p-6 sm:p-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
            <Badge className="bg-blue-600 text-white text-xs font-bold">
              Global Presence
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Built For Cross-Border Talent & Worldwide Hiring
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              TalentXcel connects regional communities into one unified global talent graph, enabling seamless hiring and networking across major economic corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalRegions.map((region, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1"
              >
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{region.name}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                  {region.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE PRODUCT ARCHITECTURE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
            Platform Architecture
          </Badge>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            The Six Pillars of TalentXcel
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-300">
            A cohesive ecosystem that combines professional identity, social connection, and enterprise-grade recruiting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <Card key={idx} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 rounded-3xl p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 w-fit">
                  {pillar.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link 
                  to={pillar.link} 
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{pillar.action}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* TWO-DOOR GLOBAL CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Join the Global Professional Talent Network?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Whether you are advancing your career or looking to hire verified specialists worldwide, your journey starts on TalentXcel.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/auth/register?role=candidate">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-blue-600/30 gap-2">
                  <span>Join as Professional</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/recruiters">
                <Button variant="outline" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-sm gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>Open Recruiter OS</span>
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="ghost" className="text-slate-300 hover:text-white text-sm">
                  <span>Explore Jobs</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
