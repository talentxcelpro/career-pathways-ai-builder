import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Compass, Video, Users, Briefcase, Award, TrendingUp, Sparkles, 
  ArrowRight, Search, ShieldCheck, MapPin, CheckCircle2, Play, 
  Banknote, FileText, Share2, Flame, ExternalLink, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GLOBAL_CURATED_REELS } from '@/hooks/useReelsData';
import { useAuth } from '@/contexts/AuthContext';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const VERTICALS = [
    { title: 'Network Feed', desc: 'Realtime career discussions & peer milestones', icon: '🌐', path: '/network', color: 'from-blue-600 to-indigo-600' },
    { title: 'Verified Jobs', desc: '2,700+ direct 1-click openings with zero ghost listings', icon: '💼', path: '/jobs', color: 'from-indigo-600 to-purple-600' },
    { title: 'Talent Directory', desc: 'Peer-endorsed candidate profiles & recruiter search', icon: '👥', path: '/talent', color: 'from-purple-600 to-pink-600' },
    { title: 'Career Reels', desc: '30-second video elevator pitches & interview tips', icon: '🎥', path: '/reels', color: 'from-pink-600 to-rose-600' },
    { title: 'Communities', desc: 'Domain guilds for AI, Systems, Leadership & Campus', icon: '🤝', path: '/communities', color: 'from-emerald-600 to-teal-600' },
    { title: 'Direct Messages', desc: 'High-intent peer messaging & recruiter outreach', icon: '💬', path: '/network/messages', color: 'from-teal-600 to-cyan-600' },
    { title: 'Recruiter OS', desc: 'Direct candidate pipelines & applicant tracking', icon: '⚡', path: '/recruiters', color: 'from-amber-600 to-orange-600' },
    { title: 'Explore Hub', desc: 'Unified discovery across all 12 platform verticals', icon: '🧭', path: '/explore', color: 'from-blue-500 to-cyan-500' },
    { title: 'My Career Hub', desc: 'Skill roadmaps, milestones & career progression', icon: '🚀', path: '/passport', color: 'from-violet-600 to-purple-700' },
    { title: 'Career Passport', desc: 'Tamper-proof verified handle & peer endorsements', icon: '🛡️', path: '/passport', color: 'from-blue-700 to-indigo-800' },
    { title: 'ATS Studio', desc: 'Instant 5-second un-gated resume parse diagnostic', icon: '📄', path: '/ats-check', color: 'from-emerald-500 to-green-600' },
    { title: 'Salary Intelligence', desc: '2026 CTC percentiles & take-home pay calculator', icon: '💰', path: '/salary', color: 'from-indigo-500 to-blue-600' }
  ];

  const FEATURED_TALENT = [
    { username: 'sanobarkhan', name: 'Sanobar Khan', role: 'Founder at TalentXcel & HR Leader', score: 99, skills: ['Executive Recruitment', 'Talent Strategy', 'People Leadership', 'HR Tech'], avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face' },
    { username: 'sarah_ai', name: 'Sarah Chen', role: 'Staff AI Systems Architect', score: 95, skills: ['RAG Architectures', 'Vector Databases', 'Python', 'LLMOps'], avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { username: 'david_k', name: 'David Kim', role: 'VP of Product Engineering', score: 94, skills: ['Engineering Leadership', 'Distributed Systems', 'Go', 'Cloud'], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    { username: 'priya_cloud', name: 'Priya Sharma', role: 'Principal Cloud Architect', score: 92, skills: ['Kubernetes', 'AWS', 'Terraform', 'FinOps'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' }
  ];

  const SALARY_CORRIDORS = [
    { role: 'Software Engineer', city: 'Bangalore', median: '₹24.5L', range: '₹14L – ₹42L', path: '/salary/software-engineer-in-bangalore', growth: '+18.4%' },
    { role: 'Full Stack Developer', city: 'Pune', median: '₹19.2L', range: '₹11L – ₹34L', path: '/salary', growth: '+15.2%' },
    { role: 'Cloud & DevOps Engineer', city: 'Hyderabad', median: '₹22.8L', range: '₹13L – ₹38L', path: '/salary', growth: '+22.6%' },
    { role: 'Data Engineer', city: 'NCR (Noida/Gurgaon)', median: '₹21.0L', range: '₹12L – ₹36L', path: '/salary', growth: '+16.8%' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      <Helmet>
        <title>Explore TalentXcel — 12 Verticals Career Operating System &amp; Professional Network</title>
        <meta name="description" content="Discover verified tech vacancies, trending 30s career reels, professional domain guilds, peer-endorsed talent passports, and 2026 salary benchmarks on TalentXcel." />
        <link rel="canonical" href="https://talentxcel.in/explore" />
      </Helmet>

      {/* Hero Discovery Section */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>The Unified Career Operating System &bull; 12 High-Velocity Verticals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Explore Careers, Communities, Reels &amp; Verified Talent
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Search 2,700+ verified jobs, watch 30-second elevator pitches, benchmark take-home compensation, and build your peer-verified Career Passport.
          </p>

          {/* Universal Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills (React, Go), or companies..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-blue-400 transition"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-5 rounded-2xl shadow-lg">
              Search &rarr;
            </Button>
          </form>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 space-y-12 relative z-20">

        {/* 12 Platform Verticals Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Platform Verticals Directory</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">12 Integrated Engines</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {VERTICALS.map((v) => (
              <Link 
                key={v.title} 
                to={v.path}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600 transition shadow-xs hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">{v.icon}</div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
                <div className="pt-3 flex items-center text-[10px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform gap-1">
                  <span>Open Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 1: Trending Career Pitch Reels */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-pink-500" />
                <span>Trending Career Pitch Reels</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">30-second elevator pitches &amp; architectural breakdowns from verified engineers</p>
            </div>
            <Link to="/reels" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>View All Reels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GLOBAL_CURATED_REELS.slice(0, 3).map((reel) => (
              <Card 
                key={reel.id} 
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group"
                onClick={() => navigate(`/reels/${reel.id}`)}
              >
                <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                  <img 
                    src={reel.thumbnail_url} 
                    alt={reel.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded-md">
                    <span>@{reel.user_name}</span>
                    <span>{reel.views_count.toLocaleString()} views</span>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {reel.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {reel.tags.slice(0, 2).map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Active Professional Communities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Active Professional Guilds</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Peer communities for hiring referrals, mock panels &amp; technical mentorship</p>
            </div>
            <Link to="/communities" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>Explore Communities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">AI &amp; Systems</Badge>
                <span className="text-[11px] text-emerald-600 font-semibold">&bull; Active Now</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">AI &amp; Intelligent Systems Guild</h3>
              <p className="text-xs text-slate-500 line-clamp-2">Deep dive into RAG architectures, model fine-tuning, vector pipelines, and agentic workflows.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">1,240 Members</span>
                <Link to="/communities">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl h-8">
                    Join Guild &rarr;
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">Full Stack</Badge>
                <span className="text-[11px] text-emerald-600 font-semibold">&bull; Active Now</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Full Stack &amp; Distributed Systems</h3>
              <p className="text-xs text-slate-500 line-clamp-2">System design drills, database scaling, microservices, and React 19 / TypeScript toolchains.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">980 Members</span>
                <Link to="/communities">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl h-8">
                    Join Guild &rarr;
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">Campus to Career</Badge>
                <span className="text-[11px] text-emerald-600 font-semibold">&bull; Active Now</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Campus &amp; Early Career Launchpad</h3>
              <p className="text-xs text-slate-500 line-clamp-2">Exclusive placement referrals, ATS resume checks, and coding interview preparation for 2025/2026 batches.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">1,620 Members</span>
                <Link to="/communities">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl h-8">
                    Join Guild &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 3: Top-Endorsed Verified Talent Passports */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span>Top-Endorsed Career Passports</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Verified peer endorsements &amp; top TalentScores ready for recruiter review</p>
            </div>
            <Link to="/talent" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>View Talent Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_TALENT.map((t) => (
              <Card key={t.username} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition text-center flex flex-col justify-between">
                <div className="space-y-2">
                  <Avatar className="w-16 h-16 mx-auto rounded-2xl ring-2 ring-blue-500/30">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback className="bg-blue-700 text-white font-bold">{t.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">{t.role}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    TalentScore: {t.score} &bull; Top 5%
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap justify-center gap-1">
                    {t.skills.slice(0, 2).map(s => (
                      <Badge key={s} variant="outline" className="text-[9px] px-1.5 py-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Link to={`/verify/${t.username}`}>
                      <Button size="sm" variant="outline" className="w-full text-[10px] font-bold h-7 px-1">
                        ⭐ Endorse
                      </Button>
                    </Link>
                    <Link to={`/u/${t.username}`}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold h-7 px-1">
                        Passport &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 4: High-Growth 2026 Salary Corridors */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>2026 Salary Benchmarks &amp; Hiring Corridors</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Live verified compensation distributions across major Indian &amp; global tech hubs</p>
            </div>
            <Link to="/salary" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>Salary Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SALARY_CORRIDORS.map((c) => (
              <Link key={c.city} to={c.path} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-xs hover:shadow-md space-y-2 group block">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{c.city}</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    {c.growth} YoY
                  </Badge>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {c.role}
                </h3>
                <div className="pt-1">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{c.median}</div>
                  <div className="text-[10px] text-slate-400">Median CTC ({c.range})</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 5: Un-Gated PLG Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase">
              Zero Login Required
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black">Test Your Resume Against Indian ATS Parsers Free</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-lg leading-relaxed">
              Get an instant 5-second breakdown of keyword match percentage, formatting health, and recruiter parseability before applying to your next role.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/ats-check">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-black text-xs px-6 h-11 rounded-2xl shadow-lg">
                Run Free ATS Scan &rarr;
              </Button>
            </Link>
            <Link to="/passport">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold text-xs px-5 h-11 rounded-2xl">
                Claim Passport
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ExplorePage;
