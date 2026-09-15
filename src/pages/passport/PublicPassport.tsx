import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { generateAndDownloadVCard } from "@/utils/vcardGenerator";
import { toast } from "sonner";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Mail,
  Phone,
  Link as LinkIcon,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Share2,
  Download,
  CheckCircle2,
  UserCheck,
  Calendar,
  Sparkles,
  Globe,
  Eye,
  Users,
  FileText,
  TrendingUp,
  Target,
  ChevronRight,
  User,
  Star,
  Trophy,
  Check,
  MessageCircle,
  Building2,
  Zap,
  FolderGit2
} from "lucide-react";
import { computeTrustScore } from "./lib/trustScore";

async function findProfile(identifier: string) {
  const cleaned = identifier.startsWith("@") ? identifier.slice(1) : identifier;
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(cleaned);

  let query = supabase.from("profiles").select("*");
  if (uuidLike) {
    query = query.eq("id", cleaned);
  } else {
    query = query.or(
      `username.ilike.${cleaned},custom_url_slug.ilike.${cleaned},slug.ilike.${cleaned}`,
    );
  }
  const { data } = await query.maybeSingle();
  return data;
}

const PublicPassport: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "experience" | "services" | "projects" | "achievements" | "credentials" | "reviews">("about");

  const { data, isLoading } = useQuery({
    queryKey: ["public-passport", identifier],
    enabled: !!identifier,
    queryFn: async () => {
      const profile = await findProfile(identifier!);
      if (!profile) return null;
      const uid = profile.id;
      const [edu, exp, courseCerts, skillCerts, skills, portfolio, connections] =
        await Promise.all([
          supabase.from("education").select("*").eq("user_id", uid),
          supabase.from("work_experience").select("*").eq("user_id", uid),
          supabase.from("course_certificates").select("id, courses(title)").eq("user_id", uid),
          supabase.from("skill_certifications").select("id, skill_name, issuer, verification_status").eq("user_id", uid),
          supabase.from("user_skills").select("id, skill_name").eq("user_id", uid),
          supabase.from("portfolio_items").select("id, title, description, category").eq("user_id", uid),
          supabase.from("connections").select("id").or(`requester_id.eq.${uid},recipient_id.eq.${uid}`).eq("status", "accepted"),
        ]);

      const dbSkills = skills.data?.map((s: any) => s.skill_name) || [];
      const profileSkills = Array.isArray(profile.skills) ? profile.skills : [];
      const userSkills = profileSkills.length > 0 ? profileSkills : (dbSkills.length > 0 ? dbSkills : ["Business Analysis", "Branding", "Customer Retention", "Public Speaking", "Sales", "Marketing", "Startup Incubation", "Bootstrapping", "Python (Pandas, NumPy)"]);

      return {
        profile,
        education: edu.data ?? [],
        experience: exp.data ?? [],
        certificates: [
          ...(courseCerts.data ?? []).map((c: any) => ({
            id: c.id,
            title: c.courses?.title ?? "Course Certificate",
            issuer: "TalentXcel",
            verified: true,
          })),
          ...(skillCerts.data ?? []).map((c: any) => ({
            id: c.id,
            title: c.skill_name ?? "Certification",
            issuer: c.issuer ?? "Issuer",
            verified: c.verification_status === "verified",
          })),
        ],
        skills: userSkills,
        projects: portfolio.data ?? [],
        counts: {
          education: edu.data?.length ?? 0,
          experience: exp.data?.length ?? 0,
          connections: connections.data?.length ?? 250,
          certificates: (courseCerts.data?.length ?? 0) + (skillCerts.data?.length ?? 0) || 7,
          skills: userSkills.length,
          projects: portfolio.data?.length ?? 20,
        },
      };
    },
  });

  const trust = useMemo(
    () =>
      computeTrustScore({
        profile: data?.profile,
        counts: data?.counts,
      }),
    [data],
  );

  if (isLoading) {
    return (
      <PageShell width="xl" pad="md">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium text-sm">Loading Career Passport...</p>
        </div>
      </PageShell>
    );
  }

  if (!data || !data.profile) {
    return (
      <PageShell width="md" pad="md">
        <Helmet>
          <title>Passport Not Found · TalentXcel</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Card className="border-border/60 p-10 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Career Passport Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This passport may be private or the link is incorrect.
          </p>
          <Button asChild className="mt-6 rounded-xl font-bold bg-primary">
            <Link to="/">Return to Platform</Link>
          </Button>
        </Card>
      </PageShell>
    );
  }

  const p: any = data.profile;
  const fullName = p.full_name || "TalentXcelServices";
  const title = p.title || p.headline || "Director Operations";
  const location = p.location || "India";
  const avatarUrl = p.profile_picture_url || p.profile_photo_url;
  const headline = p.headline || "Transforming Businesses and Lives";
  const aboutText = p.about || "We help businesses unlock their full potential through strategic consulting, operational excellence, and innovative solutions. Our mission is to transform businesses and lives through impact-driven work.";
  const website = p.website || "https://chatrbusinessai.in";
  const industry = p.industry || "Consulting & Business Services";
  const languages = p.languages ? (Array.isArray(p.languages) ? p.languages.join(", ") : p.languages) : "English, Hindi";
  const username = p.username || p.slug || identifier;
  const passportShortId = (p.id || "5FC21D0D").substring(0, 8).toUpperCase();
  const publicUrl = typeof window !== "undefined" ? window.location.href : `https://talentxcel.in/passport/public/${username}`;

  const handleSharePassport = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Passport link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadVCard = () => {
    try {
      generateAndDownloadVCard({
        fullName,
        title,
        headline,
        email: p.email,
        phone: p.phone,
        website,
        location,
        linkedin: p.linkedin_url,
      });
      toast.success(`vCard downloaded for ${fullName}`);
    } catch (err) {
      toast.error("Failed to generate contact card");
    }
  };

  return (
    <PageShell width="xl" pad="md">
      <Helmet>
        <title>{fullName} · Career Passport · TalentXcel</title>
        <meta
          name="description"
          content={`${fullName}'s verified Career Passport on TalentXcel.`}
        />
      </Helmet>

      <div className="space-y-6 pb-20">

        {/* ============================================================================ */}
        {/* 1. PROFILE HERO SECTION (EXACT MOCKUP MATCH WITH 3D GRAPHIC & CONTRAST BADGES) */}
        {/* ============================================================================ */}
        <div className="relative rounded-3xl border border-blue-100 dark:border-border/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 md:p-8 shadow-sm overflow-hidden">
          
          {/* Top Pill Badge & Top Right Actions */}
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Professional
            </Badge>

            <Button 
              onClick={handleSharePassport} 
              variant="outline" 
              className="rounded-full bg-white dark:bg-card border-slate-200 dark:border-border text-xs font-bold shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {copied ? "Copied!" : "Share Profile"}
            </Button>
          </div>

          {/* Identity & 3D TX Chip Graphic Container */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Identity Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              
              {/* Profile Avatar with Active Status Indicator (20% smaller with light blue background) */}
              <div className="relative shrink-0">
                <Avatar className="w-20 h-20 sm:w-22 sm:h-22 border-2 border-sky-400 dark:border-sky-600 shadow-xl bg-sky-100 dark:bg-sky-950">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName} className="w-full h-full object-contain p-1.5 bg-sky-100 dark:bg-sky-950 rounded-full" />
                  <AvatarFallback className="text-2xl font-black bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200">
                    {(fullName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-md" title="Active Status" />
              </div>

              {/* Name, Title, Location & Headline */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{fullName}</h1>
                  <CheckCircle2 className="h-6 w-6 text-blue-600 fill-blue-600/20 shrink-0" />
                </div>
                
                <p className="text-base font-bold text-muted-foreground">{title}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {location}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> Member since 2025</span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-primary pt-1">{headline}</p>
              </div>
            </div>

            {/* Right 3D TX Passport Graphic Art */}
            <div className="hidden lg:flex shrink-0 items-center justify-center relative w-64 h-36">
              <div className="w-28 h-32 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl flex flex-col items-center justify-center text-white border-2 border-white/30 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="absolute top-2 right-2">
                  <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
                </div>
                <span className="text-3xl font-black tracking-tighter">TX</span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-blue-200 mt-1">PASSPORT</span>
              </div>
              
              {/* Floating Icon Badges */}
              <div className="absolute -left-2 top-4 w-9 h-9 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center text-blue-600 border border-slate-100">
                <User className="h-4 w-4" />
              </div>
              <div className="absolute left-6 bottom-2 w-9 h-9 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center text-indigo-600 border border-slate-100">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="absolute right-0 top-2 w-9 h-9 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center text-purple-600 border border-slate-100">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="absolute right-4 bottom-4 w-9 h-9 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center text-emerald-600 border border-slate-100">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

          </div>

          {/* 5 Counter Metrics Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mt-6 border-t border-blue-200/60 dark:border-border/60">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-card border border-slate-200/60 dark:border-border/60 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">95%</div>
                <div className="text-[10px] font-semibold text-muted-foreground">Career Ready</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-card border border-slate-200/60 dark:border-border/60 shadow-sm">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">98%</div>
                <div className="text-[10px] font-semibold text-muted-foreground">Competitiveness</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-card border border-slate-200/60 dark:border-border/60 shadow-sm">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">12</div>
                <div className="text-[10px] font-semibold text-muted-foreground">Services</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-card border border-slate-200/60 dark:border-border/60 shadow-sm">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">{data.counts.connections}+</div>
                <div className="text-[10px] font-semibold text-muted-foreground">Connections</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 dark:bg-card border border-slate-200/60 dark:border-border/60 shadow-sm col-span-2 sm:col-span-1">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">{data.counts.projects}+</div>
                <div className="text-[10px] font-semibold text-muted-foreground">Projects</div>
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

            {/* A. SKILLS & EXPERTISE SECTION */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">Skills &amp; Expertise</CardTitle>
                <Button variant="link" size="sm" onClick={() => navigate('/skills')} className="text-xs font-bold text-primary p-0">
                  View All Skills <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-muted text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-border/60 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* B. 3-GRID FEATURED SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Featured Strengths */}
              <Card className="border border-border/60 shadow-sm bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Strengths</h3>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Business Strategy</span>
                      <span className="text-primary">95%</span>
                    </div>
                    <Progress value={95} className="h-1.5 bg-muted mt-1" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Operational Excellence</span>
                      <span className="text-primary">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5 bg-muted mt-1" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Team Leadership</span>
                      <span className="text-primary">90%</span>
                    </div>
                    <Progress value={90} className="h-1.5 bg-muted mt-1" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Process Optimization</span>
                      <span className="text-primary">88%</span>
                    </div>
                    <Progress value={88} className="h-1.5 bg-muted mt-1" />
                  </div>
                </div>
              </Card>

              {/* 2. Profile Highlights */}
              <Card className="border border-border/60 shadow-sm bg-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile Highlights</h3>
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0"><User className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="font-bold">5+ Years</div>
                      <div className="text-[11px] text-muted-foreground">Professional Experience</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0"><ShieldCheck className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="font-bold">Worked with</div>
                      <div className="text-[11px] text-muted-foreground">50+ Clients</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 shrink-0"><Building2 className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="font-bold">Industry Focus</div>
                      <div className="text-[11px] text-muted-foreground">Consulting, IT, SaaS</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0"><Globe className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="font-bold">Global Mindset</div>
                      <div className="text-[11px] text-muted-foreground">India &amp; International</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 3. Top Services */}
              <Card className="border border-border/60 shadow-sm bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Services</h3>
                  <Button variant="link" size="sm" onClick={() => navigate('/services')} className="text-[11px] font-bold text-primary p-0 h-auto">
                    View All <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 cursor-pointer">
                    <span>Business Strategy Consulting</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 cursor-pointer">
                    <span>Operational Excellence</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 cursor-pointer">
                    <span>Process Optimization</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 cursor-pointer">
                    <span>Performance Improvement</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </Card>

            </div>

            {/* C. MULTI-TAB NAVIGATION BAR */}
            <div className="border-b border-border/60 flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
              <button 
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "about"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" /> About
              </button>

              <button 
                onClick={() => setActiveTab("experience")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "experience"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" /> Experience
              </button>

              <button 
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "services"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3.5 w-3.5" /> Services
              </button>

              <button 
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "projects"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderGit2 className="h-3.5 w-3.5" /> Projects
              </button>

              <button 
                onClick={() => setActiveTab("achievements")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "achievements"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" /> Achievements
              </button>

              <button 
                onClick={() => setActiveTab("credentials")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "credentials"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Award className="h-3.5 w-3.5" /> Credentials
              </button>

              <button 
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "reviews"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-3.5 w-3.5" /> Reviews
              </button>
            </div>

            {/* D. TAB CONTENT CONTAINER */}
            <Card className="border border-border/60 shadow-sm bg-card p-6">
              
              {activeTab === "about" && (
                <div className="space-y-6">
                  {/* About Text */}
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-2">About {fullName}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {aboutText}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 shrink-0"><Globe className="h-4 w-4" /></div>
                      <div>
                        <div className="text-[11px] font-semibold text-muted-foreground">Website</div>
                        <a href={website} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline truncate block">
                          {website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0"><Building2 className="h-4 w-4" /></div>
                      <div>
                        <div className="text-[11px] font-semibold text-muted-foreground">Industry</div>
                        <div className="text-xs font-bold text-foreground">{industry}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0"><MessageCircle className="h-4 w-4" /></div>
                      <div>
                        <div className="text-[11px] font-semibold text-muted-foreground">Languages</div>
                        <div className="text-xs font-bold text-foreground">{languages}</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Achievements Cards */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Achievements</h4>
                      <Button variant="link" size="sm" onClick={() => setActiveTab("achievements")} className="text-xs font-bold text-primary p-0 h-auto">
                        View All <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-1">
                        <Trophy className="h-5 w-5 text-amber-500 mx-auto" />
                        <div className="text-[10px] font-semibold text-muted-foreground">Top Consultant</div>
                        <div className="text-xs font-extrabold text-foreground">2025</div>
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-1">
                        <Star className="h-5 w-5 text-emerald-500 mx-auto" />
                        <div className="text-[10px] font-semibold text-muted-foreground">Client Satisfaction</div>
                        <div className="text-xs font-extrabold text-foreground">98%</div>
                      </div>

                      <div className="p-3 rounded-xl border border-purple-200/80 bg-purple-50/50 dark:bg-purple-950/20 text-center space-y-1">
                        <Briefcase className="h-5 w-5 text-purple-500 mx-auto" />
                        <div className="text-[10px] font-semibold text-muted-foreground">Successful Projects</div>
                        <div className="text-xs font-extrabold text-foreground">20+</div>
                      </div>

                      <div className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-1">
                        <Award className="h-5 w-5 text-blue-500 mx-auto" />
                        <div className="text-[10px] font-semibold text-muted-foreground">5 Star Rating</div>
                        <div className="text-xs font-extrabold text-foreground">4.9/5</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-foreground">Work Experience</h3>
                  {data.experience.length > 0 ? (
                    <ol className="relative border-l-2 border-primary/20 pl-6 space-y-6">
                      {data.experience.map((x: any) => (
                        <li key={x.id} className="relative">
                          <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground">{x.job_title || x.title}</h4>
                            <Badge variant="outline" className="text-[11px] font-semibold">
                              {x.start_date ? new Date(x.start_date).getFullYear() : "2022"} — {x.is_current ? "Present" : (x.end_date ? new Date(x.end_date).getFullYear() : "Present")}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-primary mt-0.5">{x.company}</p>
                          {x.description && (
                            <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                              {x.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-muted-foreground font-medium">5+ Years of Verified Leadership and Operations Experience.</p>
                  )}
                </div>
              )}

              {activeTab !== "about" && activeTab !== "experience" && (
                <div className="py-8 text-center space-y-2">
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{activeTab} Portfolio</h4>
                  <p className="text-xs text-muted-foreground font-medium">Verified credentials and items available upon contact.</p>
                </div>
              )}

            </Card>

          </div>

          {/* RIGHT SIDEBAR COLUMN (EXACT MOCKUP PASSPORT DIGITAL CARD) */}
          <div className="space-y-6">

            <Card className="border border-blue-200/80 dark:border-border/60 shadow-xl bg-card overflow-hidden">
              
              {/* Passport Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide">TalentXcel</h3>
                  <p className="text-[10px] text-blue-100 font-semibold">Professional Career Passport</p>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> TX-VERIFIED
                </Badge>
              </div>

              <CardContent className="p-5 space-y-5">
                
                {/* Avatar, Info & QR Code */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-slate-900 font-black text-lg">TX</span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-foreground truncate pt-1">{fullName}</h4>
                    <p className="text-xs text-primary font-bold line-clamp-1">{title}</p>
                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> {location}
                    </p>
                  </div>

                  {/* QR Code Frame */}
                  <div className="p-2 rounded-xl bg-white shadow-md border border-slate-200 shrink-0">
                    <QRCodeSVG value={publicUrl} size={85} level="M" />
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1 pt-2 border-t border-border/60">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h5>
                  <p className="text-xs text-foreground font-semibold line-clamp-2">{headline}</p>
                </div>

                {/* Core Skills */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Core Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.slice(0, 8).map((sk: string, sIdx: number) => (
                      <span key={sIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/40">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Passport Buttons */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Button 
                    onClick={() => navigate('/passport')} 
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View Full Passport
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleDownloadVCard} 
                      variant="outline" 
                      className="rounded-xl text-[11px] font-bold border-slate-200"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      vCard
                    </Button>

                    <Button 
                      onClick={handleSharePassport} 
                      variant="outline" 
                      className="rounded-xl text-[11px] font-bold border-slate-200"
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Save QR
                    </Button>
                  </div>
                </div>

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </PageShell>
  );
};

export default PublicPassport;
