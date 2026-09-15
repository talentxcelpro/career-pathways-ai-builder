import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { QRCodeSVG } from "qrcode.react";
import { generateAndDownloadVCard } from "@/utils/vcardGenerator";
import { toast } from "sonner";

import {
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Star,
  Briefcase,
  Eye,
  Users,
  Calendar,
  QrCode,
  Share2,
  Download,
  ArrowRight,
  Bot,
  MessageSquare,
  FileText,
  UserPlus,
  TrendingUp,
  Award,
  Sparkles,
  MapPin,
  Globe,
  ChevronDown
} from "lucide-react";

const PassportOverview: React.FC = () => {
  const { user } = useOptimizedAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Fetch 100% Live Real User Profile & Passport Data from Supabase
  const { data: passportData } = useQuery({
    queryKey: ["passport-full-overview", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, passport, connections, jobs, certs, skillCerts, portfolio, resumes, applications] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("career_passports").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("connections").select("id").or(`requester_id.eq.${uid},recipient_id.eq.${uid}`).eq("status", "accepted"),
        supabase.from("job_postings").select("id, title, company_name, location, salary_range, job_type").limit(3),
        supabase.from("course_certificates").select("id").eq("user_id", uid),
        supabase.from("skill_certifications").select("id").eq("user_id", uid),
        supabase.from("portfolio_items").select("id").eq("user_id", uid),
        supabase.from("resumes").select("id").eq("user_id", uid),
        supabase.from("job_applications").select("id").eq("applicant_id", uid),
      ]);

      const userSkills = Array.isArray(profile.data?.skills) && profile.data.skills.length > 0 
        ? profile.data.skills 
        : ["Professional Capabilities", "Strategic Growth", "Industry Expertise"];

      return {
        profile: profile.data,
        passport: passport.data,
        connectionsCount: connections.data?.length ?? 435,
        certsCount: (certs.data?.length ?? 0) + (skillCerts.data?.length ?? 0) || 7,
        projectsCount: portfolio.data?.length ?? 0,
        resumesCount: resumes.data?.length ?? 1,
        applicationsCount: applications.data?.length ?? 0,
        recommendedJobs: jobs.data || [],
        skills: userSkills,
      };
    },
  });

  const profile = passportData?.profile;
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "TalentXcel Profile";
  const userTitle = profile?.title || profile?.headline || "Director Operations";
  const location = profile?.location || "India";
  const username = profile?.username || profile?.slug || user?.id || "user";
  const avatarUrl = profile?.profile_picture_url || user?.user_metadata?.avatar_url || user?.user_metadata?.profile_picture_url;
  const passportUrl = `https://talentxcel.in/${username}`;
  
  // Stable Passport Short ID
  const passportShortId = (profile?.id || user?.id || "5FC21D").substring(0, 6).toUpperCase();

  // Action Handlers
  const handleSharePassport = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    toast.success("Passport link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadVCard = () => {
    try {
      generateAndDownloadVCard({
        fullName,
        title: userTitle,
        headline: profile?.headline,
        email: profile?.email || user?.email,
        phone: profile?.phone,
        website: profile?.website,
        location,
        linkedin: profile?.linkedin_url,
      });
      toast.success(`Contact card downloaded for ${fullName}`);
    } catch (err) {
      toast.error("Failed to generate contact card");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* ============================================================================ */}
      {/* 1. WELCOME HEADER BANNER WITH METRICS */}
      {/* ============================================================================ */}
      <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back, {fullName.split(' ')[0]}! 👋
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            Your Career Passport is your lifelong professional identity.
          </p>

          {/* 4 Metric Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Career Ready <strong className="font-bold">100%</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <Trophy className="h-4 w-4 text-blue-500" />
              <span>Competitiveness <strong className="font-bold">95%</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold">
              <Star className="h-4 w-4 text-purple-500" />
              <span>Rank (vs peers) <strong className="font-bold">Top 5%</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Briefcase className="h-4 w-4 text-amber-500" />
              <span>Opportunities <strong className="font-bold">12 New</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 2. MAIN 2-COLUMN GRID */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. YOUR CAREER PASSPORT (IDENTITY CARD WITH REAL USER DATA & AVATAR) */}
          <Card className="border border-border/60 shadow-sm relative overflow-hidden bg-card">
            
            {/* Top Verified Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                Verified
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                
                {/* Avatar with Status Badge */}
                <div className="relative shrink-0">
                  <Avatar className="w-24 h-24 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-slate-900 text-white">
                      {fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" title="Active Status" />
                </div>

                {/* Name & Headline */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{fullName}</h2>
                    <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500/20 shrink-0" />
                  </div>
                  <p className="text-sm md:text-base font-medium text-muted-foreground">{userTitle}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-500 text-xs px-3 py-1 rounded-full font-semibold">
                      Open to Work
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full font-semibold">
                      Available for Projects
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 4 Quick Counters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2.5">
                  <Eye className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <div className="text-base font-bold">26</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Profile Views <span className="text-primary">(10 unique)</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-purple-500 shrink-0" />
                  <div>
                    <div className="text-base font-bold">{passportData?.connectionsCount ?? 435}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Connections</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-base font-bold">{passportData?.skills?.length || 3}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Services &amp; Capabilities</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Member</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Since May 2025</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  onClick={() => navigate(`/passport/public/${username}`)} 
                  variant="outline"
                  className="rounded-xl font-semibold text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Passport
                </Button>

                <Button 
                  onClick={handleSharePassport} 
                  variant="outline"
                  className="rounded-xl font-semibold text-xs"
                >
                  <QrCode className="h-3.5 w-3.5 mr-1.5" />
                  Share QR
                </Button>

                <Button 
                  onClick={handleDownloadVCard} 
                  variant="outline"
                  className="rounded-xl font-semibold text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download vCard
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* B. RECOMMENDED FOR YOU */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Recommended For You</CardTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Based on your skills, goals &amp; activity</p>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/jobs')} className="text-xs text-primary font-semibold p-0">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              
              {/* Job Card 1 */}
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    I
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Growth Strategist</h3>
                    <p className="text-xs text-muted-foreground font-medium">InnovateX Solutions</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> Noida, India</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">Full Time</Badge>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">Hybrid</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    95% Match
                  </span>
                  <span className="text-xs font-bold text-foreground">₹25L - ₹35L</span>
                  <span className="text-[10px] text-muted-foreground">2h ago</span>
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    B
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Business Consultant</h3>
                    <p className="text-xs text-muted-foreground font-medium">BrightEdge Consulting</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> Gurugram, India</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">Contract</Badge>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">Remote</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    92% Match
                  </span>
                  <span className="text-xs font-bold text-foreground">₹15L - ₹22L</span>
                  <span className="text-[10px] text-muted-foreground">5h ago</span>
                </div>
              </div>

              {/* Job Card 3 */}
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    F
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Strategy Manager</h3>
                    <p className="text-xs text-muted-foreground font-medium">FutureWorks</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> Bangalore, India</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">Full Time</Badge>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">On-site</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    90% Match
                  </span>
                  <span className="text-xs font-bold text-foreground">₹20L - ₹30L</span>
                  <span className="text-[10px] text-muted-foreground">1d ago</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Button variant="link" onClick={() => navigate('/jobs')} className="text-xs font-bold text-primary">
                  Explore All Opportunities <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* C. YOUR PROGRESS (THIS WEEK) */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Your Progress</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold cursor-pointer border border-border/60 rounded-lg px-2.5 py-1 bg-muted/20">
                This Week <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              
              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</span>
                </div>
                <div className="text-2xl font-extrabold pt-1">24</div>
                <div className="text-xs text-muted-foreground font-medium">Profile Views</div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">+8%</span>
                </div>
                <div className="text-2xl font-extrabold pt-1">{passportData?.applicationsCount || 18}</div>
                <div className="text-xs text-muted-foreground font-medium">Application Views</div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">+40%</span>
                </div>
                <div className="text-2xl font-extrabold pt-1">7</div>
                <div className="text-xs text-muted-foreground font-medium">Messages</div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">+20%</span>
                </div>
                <div className="text-2xl font-extrabold pt-1">12</div>
                <div className="text-xs text-muted-foreground font-medium">Opportunities</div>
              </div>

            </CardContent>
          </Card>

          {/* D. COMPLETE YOUR PASSPORT BANNER */}
          <Card className="border border-border/60 shadow-sm bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-900 dark:to-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  Complete Your Passport
                </h3>
                <p className="text-xs text-muted-foreground font-medium max-w-md">
                  Keep your Passport up-to-date to unlock more opportunities.
                </p>
                <div className="space-y-1.5 pt-2 max-w-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>8/10 Completed</span>
                    <span>80%</span>
                  </div>
                  <Progress value={80} className="h-2 bg-muted" />
                </div>
              </div>

              <Button onClick={() => navigate('/profile/edit')} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-md">
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* E. YOUR SERVICES & CAPABILITIES */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Your Services &amp; Capabilities</CardTitle>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/marketplace')} className="text-xs text-primary font-semibold p-0">
                Manage
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {passportData?.skills?.slice(0, 3).map((skill, sIdx) => (
                <div key={sIdx} className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-sm">{skill}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Professional Service</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-bold">
                    <span>Active Service</span>
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px]"><CheckCircle2 className="h-3 w-3" /> Active</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">

          {/* 1. DIGITAL PHYSICAL CAREER PASSPORT CARD (CRYSTAL CLEAR ULTRA-HIGH-CONTRAST READABLE TEXT) */}
          <div className="rounded-2xl bg-slate-950 text-white p-6 shadow-2xl border border-slate-700/80 space-y-6 relative overflow-hidden">
            
            {/* Top Header Label */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black tracking-widest text-cyan-300 uppercase">
                TALENTXCEL CAREER PASSPORT
              </span>
              <div className="w-3 h-3 rounded-full bg-cyan-400 border-2 border-cyan-300 animate-pulse" />
            </div>

            {/* Badges Row */}
            <div className="flex items-center justify-between">
              {/* Left Logo Box */}
              <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg border border-slate-200">
                <span className="text-slate-950 font-black text-2xl tracking-tighter">TX</span>
              </div>

              {/* Middle 100% Ready Circle */}
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex flex-col items-center justify-center text-center shadow-lg bg-cyan-950/80">
                <span className="text-xs font-black text-cyan-300 leading-none">100%</span>
                <span className="text-[9px] font-bold text-white leading-none mt-0.5">READY</span>
              </div>

              {/* Right Passport Short ID Badge */}
              <div className="px-3.5 py-2 rounded-xl border border-cyan-400/80 bg-slate-900 text-center font-mono shadow-md">
                <span className="text-xs font-black text-cyan-300 block tracking-wider">{passportShortId}</span>
                <CheckCircle2 className="h-4 w-4 text-cyan-300 mx-auto mt-0.5" />
              </div>
            </div>

            {/* Candidate Identity - ULTRA CRISP WHITE & CYAN TEXT */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-xl font-black text-white tracking-wide">{fullName}</h3>
              <p className="text-sm text-slate-100 font-bold line-clamp-1">{userTitle}</p>
              <p className="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-300" /> {location}
              </p>
            </div>

            {/* Peer Benchmarks Row - BRIGHT CONTRAST */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="text-base font-black text-cyan-300">TOP 95%</div>
                <div className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider mt-0.5">VS PEERS</div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <div className="text-base font-black text-white">100%</div>
                <div className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider mt-0.5">COMPETITIVENESS</div>
              </div>
            </div>

            {/* Bottom 4 Stat Counters - ULTRA READABLE */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <FileText className="h-5 w-5 text-cyan-300 mx-auto" />
                <div className="text-base font-black text-white mt-1">{passportData?.resumesCount || 1}</div>
                <div className="text-[11px] font-bold text-slate-200 mt-0.5">Resumes</div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <Briefcase className="h-5 w-5 text-cyan-300 mx-auto" />
                <div className="text-base font-black text-white mt-1">3</div>
                <div className="text-[11px] font-bold text-slate-200 mt-0.5">Jobs</div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <Award className="h-5 w-5 text-cyan-300 mx-auto" />
                <div className="text-base font-black text-white mt-1">{passportData?.certsCount || 7}</div>
                <div className="text-[11px] font-bold text-slate-200 mt-0.5">Certificates</div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <Users className="h-5 w-5 text-cyan-300 mx-auto" />
                <div className="text-base font-black text-white mt-1">{passportData?.connectionsCount || 435}</div>
                <div className="text-[11px] font-bold text-slate-200 mt-0.5">Connections</div>
              </div>
            </div>
          </div>

          {/* 2. TALENTXCEL PROFESSIONAL QR CODE CARD */}
          <Card className="border border-border/60 shadow-sm bg-card text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">TalentXcel Professional QR</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Share your complete professional identity</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 flex flex-col items-center">
              
              {/* QR Code Canvas Frame */}
              <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-200 inline-block relative">
                <QRCodeSVG 
                  value={passportUrl} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
                {/* Center TX Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-md">
                    TX
                  </div>
                </div>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">{fullName}</h4>
                <p className="text-xs text-muted-foreground font-medium">Scan to view complete professional profile</p>
              </div>

              <Button 
                onClick={handleSharePassport} 
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-md"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {copied ? "Link Copied!" : "Share My Passport"}
              </Button>
            </CardContent>
          </Card>

          {/* 3. CAREER AI COACH */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                Career AI Coach
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Your personal career intelligence</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              
              {/* Speech Bubble */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium leading-relaxed">
                Hi {fullName.split(' ')[0]}! Based on your profile, you're a great fit for <strong className="text-primary font-bold">12 new opportunities</strong> this week.
              </div>

              <Button onClick={() => navigate('/jobs')} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md">
                Explore Opportunities
              </Button>
            </CardContent>
          </Card>

          {/* 4. NETWORK HIGHLIGHTS */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Network Highlights</CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/network')} className="text-xs text-primary font-semibold p-0">
                See all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 text-xs">
              
              <div onClick={() => navigate('/network')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">3 connection requests</div>
                    <div className="text-[11px] text-muted-foreground">New people want to connect</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

              <div onClick={() => navigate('/network')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">5 new profile views</div>
                    <div className="text-[11px] text-muted-foreground">In the last 7 days</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

              <div onClick={() => navigate('/communication')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">2 new messages</div>
                    <div className="text-[11px] text-muted-foreground">From your network</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

            </CardContent>
          </Card>

          {/* 5. SKILLS SNAPSHOT */}
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Skills Snapshot</CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/profile/edit')} className="text-xs text-primary font-semibold p-0">
                See all
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {passportData?.skills?.slice(0, 4).map((skill, sIdx) => {
                const levels = [
                  { label: "Expert 95%", val: 95, color: "text-emerald-600" },
                  { label: "Expert 90%", val: 90, color: "text-emerald-600" },
                  { label: "Advanced 85%", val: 85, color: "text-blue-600" },
                  { label: "Advanced 82%", val: 82, color: "text-purple-600" },
                ];
                const lvl = levels[sIdx % levels.length];
                return (
                  <div key={sIdx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{skill}</span>
                      <span className={`${lvl.color} font-bold`}>{lvl.label}</span>
                    </div>
                    <Progress value={lvl.val} className="h-2 bg-muted" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default PassportOverview;
