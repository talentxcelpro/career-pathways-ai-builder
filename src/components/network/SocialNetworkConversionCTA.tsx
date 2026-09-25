import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Sparkles, 
  Briefcase, 
  ArrowRight, 
  ShieldCheck, 
  PlayCircle, 
  Compass, 
  Building2,
  TrendingUp,
  Share2
} from 'lucide-react';

interface SocialNetworkConversionCTAProps {
  roleTitle?: string;
  location?: string;
  category?: string;
  compact?: boolean;
}

export const SocialNetworkConversionCTA: React.FC<SocialNetworkConversionCTAProps> = ({
  roleTitle,
  location,
  category,
  compact = false
}) => {
  const displayRole = roleTitle || 'High-Growth Tech & Leadership';
  const displayLoc = location ? `in ${location}` : 'Across India & Remote';

  if (compact) {
    return (
      <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border border-blue-500/30 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block"></span>
              Living Talent Network
            </Badge>
            <span className="text-xs text-blue-200/80">3,400+ members active now</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Connect with {displayRole} Professionals {displayLoc}
          </h4>
          <p className="text-xs text-blue-100/70">
            Build your Career Passport, get verified by TalentScore™, and let top hiring teams discover you.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
          <Link to="/auth/register?role=candidate">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md gap-1.5">
              <span>Join Network Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link to={`/talent?role=${encodeURIComponent(displayRole)}`}>
            <Button size="sm" variant="outline" className="border-blue-400/40 text-blue-200 hover:bg-blue-900/50 text-xs rounded-xl">
              <Users className="w-3.5 h-3.5 mr-1" />
              <span>See People</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-6 sm:p-8 md:p-10 shadow-2xl text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-xs py-1 px-3 rounded-full font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              TalentXcel Professional Network
            </Badge>
            <span className="text-2xs sm:text-xs text-slate-400 hidden sm:inline">
              10K+ verified professionals & 500+ hiring teams connected
            </span>
          </div>

          <div className="flex items-center gap-2 text-2xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>0% Spam • Verified Profiles</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-3 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Don't Just Browse Jobs — <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
              Build Your Living Identity & Get Discovered
            </span>
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Every day, top companies and recruiters search TalentXcel's living talent graph to hire {displayRole} professionals {displayLoc}. Build your free profile once — let career opportunities, peers, and recruiter outreach come to you.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-blue-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-white">Verified TalentScore™</h5>
            <p className="text-2xs sm:text-xs text-slate-400 leading-normal">
              Showcase verified credentials, skills, and projects that jump you straight to the top of recruiter pipelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-purple-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PlayCircle className="w-4 h-4" />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-white">Career Reels & Knowledge</h5>
            <p className="text-2xs sm:text-xs text-slate-400 leading-normal">
              Share interview advice, projects, and salary truths in bite-sized video reels that build your professional following.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-white">Direct Recruiter Outreach</h5>
            <p className="text-2xs sm:text-xs text-slate-400 leading-normal">
              Skip traditional resume black holes. Recruiters on Recruiter OS discover and message you directly based on merit.
            </p>
          </div>
        </div>

        {/* Action Gate / Call to Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <Link to="/auth/register?role=candidate" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 gap-2">
                <span>Join TalentXcel Free (1-Click)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/hire" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-400/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 font-semibold text-sm px-5 py-3 rounded-2xl gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Hiring? Recruiter OS ⚡</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Link to={`/talent?q=${encodeURIComponent(roleTitle || '')}`} className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Explore {displayRole} Talent Directory →</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialNetworkConversionCTA;
