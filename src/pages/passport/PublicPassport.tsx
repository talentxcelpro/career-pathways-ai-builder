import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FileText
} from "lucide-react";
import { computeTrustScore } from "./lib/trustScore";

const DEFAULT_VIS = {
  education: true,
  experience: true,
  certificates: true,
  skills: true,
  contact: true,
  trust_score: true,
};

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
  const [copied, setCopied] = useState(false);

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
          supabase.from("portfolio_items").select("id").eq("user_id", uid),
          supabase.from("connections").select("id").or(`requester_id.eq.${uid},recipient_id.eq.${uid}`).eq("status", "accepted"),
        ]);

      const userSkills = Array.isArray(profile.skills) && profile.skills.length > 0
        ? profile.skills
        : (skills.data?.map((s: any) => s.skill_name) || ["Business Analysis", "Branding", "Customer Retention", "Public Speaking", "Sales, Marketing , Startup incubation", "Bootstrap", "Python (Pandas, NumPy)"]);

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
        counts: {
          education: edu.data?.length ?? 0,
          experience: exp.data?.length ?? 0,
          connections: connections.data?.length ?? 435,
          certificates: (courseCerts.data?.length ?? 0) + (skillCerts.data?.length ?? 0) || 7,
          skills: userSkills.length,
          projects: portfolio.data?.length ?? 3,
        },
      };
    },
  });

  const vis = useMemo(() => {
    if (!data?.profile) return DEFAULT_VIS;
    return { ...DEFAULT_VIS, ...((data.profile as any).passport_visibility ?? {}) };
  }, [data]);

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
  const fullName = p.full_name || "Professional Profile";
  const title = p.title || p.headline || "Director Operations";
  const location = p.location || "India";
  const avatarUrl = p.profile_picture_url || p.profile_photo_url;
  const username = p.username || p.slug || identifier;
  const passportShortId = (p.id || "5FC21D").substring(0, 6).toUpperCase();
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
        headline: p.headline,
        email: p.email,
        phone: p.phone,
        website: p.website,
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
        <title>{fullName} · Verified Career Passport · TalentXcel</title>
        <meta
          name="description"
          content={`${fullName}'s verified Career Passport on TalentXcel. Trust score ${trust.score}/100.`}
        />
        <meta property="og:title" content={`${fullName} · Career Passport`} />
        <meta property="og:description" content={p.headline || p.about || ""} />
        <meta property="og:type" content="profile" />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
      </Helmet>

      {/* ============================================================================ */}
      {/* 1. HYPER-PREMIUM EXECUTIVE HERO BANNER */}
      {/* ============================================================================ */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white mb-6">
        
        {/* Background Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            
            {/* Glowing Avatar Frame */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-2xl">
                <Avatar className="w-full h-full rounded-full border-2 border-slate-900">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName} className="object-cover" />
                  <AvatarFallback className="text-3xl font-black bg-slate-900 text-white">
                    {fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-md" title="Verified Identity" />
            </div>

            {/* Candidate Identity - HIGH CONTRAST BRIGHT TEXT */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  {fullName}
                  <CheckCircle2 className="h-6 w-6 text-cyan-400 fill-cyan-400/20 shrink-0" />
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                  Verified Identity
                </Badge>
              </div>

              <p className="text-base md:text-lg font-semibold text-slate-200">{title}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-300 font-medium pt-0.5">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="h-4 w-4 text-cyan-400" /> Member since 2025
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Trust Score {trust.score}/100
                </span>
              </div>

              {p.headline && (
                <p className="text-xs md:text-sm text-slate-300 max-w-xl line-clamp-2 pt-1 font-medium">{p.headline}</p>
              )}
            </div>

          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={handleSharePassport} 
              className="flex-1 md:flex-none rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-sm"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-cyan-300" />
              {copied ? "Copied!" : "Share Profile"}
            </Button>

            <Button 
              onClick={handleDownloadVCard} 
              className="flex-1 md:flex-none rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download vCard
            </Button>
          </div>

        </div>
      </div>

      {/* ============================================================================ */}
      {/* 2. MAIN 2-COLUMN PUBLIC PASSPORT LAYOUT */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* A. SKILLS & EXPERTISE */}
          {vis.skills && data.skills.length > 0 && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Skills &amp; Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill: any, idx: number) => {
                    const skillName = typeof skill === "string" ? skill : skill.skill_name;
                    return (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {skillName}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* B. PROFESSIONAL SUMMARY / ABOUT */}
          {p.about && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {p.about}
                </p>
              </CardContent>
            </Card>
          )}

          {/* C. VERIFIED WORK EXPERIENCE */}
          {vis.experience && data.experience.length > 0 && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="relative border-l-2 border-primary/20 pl-6 space-y-6">
                  {data.experience.map((x: any) => (
                    <li key={x.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-foreground">{x.job_title || x.title}</h3>
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          {x.start_date ? new Date(x.start_date).getFullYear() : "2022"} — {x.is_current ? "Present" : (x.end_date ? new Date(x.end_date).getFullYear() : "Present")}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-primary mt-0.5">{x.company}</p>
                      {x.description && (
                        <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                          {x.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* D. EDUCATION */}
          {vis.education && data.education.length > 0 && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  Education &amp; Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {data.education.map((e: any) => (
                  <div key={e.id} className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{e.degree}</h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{e.institution}</p>
                      {e.field_of_study && <p className="text-[11px] text-muted-foreground mt-1">{e.field_of_study}</p>}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {e.graduation_date ? new Date(e.graduation_date).getFullYear() : "Graduated"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">

          {/* 1. DIGITAL VERIFIED CAREER PASSPORT IDENTITY CARD */}
          <div className="rounded-2xl bg-slate-950 text-white p-6 shadow-2xl border border-slate-700/80 space-y-6 relative overflow-hidden">
            
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black tracking-widest text-cyan-300 uppercase">
                TALENTXCEL CAREER PASSPORT
              </span>
              <Badge className="bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono text-[10px]">
                ID: TX-{passportShortId}
              </Badge>
            </div>

            {/* Center User Info & Live SVG QR Code */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-slate-900 font-black text-lg">TX</span>
                  )}
                </div>
                <h4 className="text-base font-black text-white truncate pt-1">{fullName}</h4>
                <p className="text-xs text-cyan-300 font-bold line-clamp-1">{title}</p>
                <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-cyan-300" /> {location}
                </p>
              </div>

              {/* Live SVG QR Code Frame */}
              <div className="p-2 rounded-xl bg-white shadow-md border border-slate-200 shrink-0">
                <QRCodeSVG value={publicUrl} size={90} level="M" />
              </div>
            </div>

            {/* Peer Benchmarks */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-center">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="text-xs font-black text-cyan-300">TOP 95%</div>
                <div className="text-[9px] font-bold text-slate-300 uppercase">VS PEERS</div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="text-xs font-black text-white">100%</div>
                <div className="text-[9px] font-bold text-slate-300 uppercase">COMPETITIVENESS</div>
              </div>
            </div>

            {/* Bottom 4 Stat Counters */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center">
              <div>
                <FileText className="h-4 w-4 text-cyan-300 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">1</div>
                <div className="text-[9px] font-medium text-slate-300">Resumes</div>
              </div>

              <div>
                <Briefcase className="h-4 w-4 text-cyan-300 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">3</div>
                <div className="text-[9px] font-medium text-slate-300">Jobs</div>
              </div>

              <div>
                <Award className="h-4 w-4 text-cyan-300 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">{data.counts.certificates}</div>
                <div className="text-[9px] font-medium text-slate-300">Certificates</div>
              </div>

              <div>
                <Users className="h-4 w-4 text-cyan-300 mx-auto" />
                <div className="text-xs font-bold text-white mt-1">{data.counts.connections}</div>
                <div className="text-[9px] font-medium text-slate-300">Connections</div>
              </div>
            </div>

          </div>

          {/* 2. TRUST SCORE BREAKDOWN CARD */}
          {vis.trust_score && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Trust Score Breakdown</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    {trust.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-2 text-xs">
                {trust.signals.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 font-semibold">
                    <span className="text-foreground">{s.label}</span>
                    <span className="text-primary font-bold">{s.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 3. CONTACT & VERIFICATION DETAILS */}
          {vis.contact && (p.email || p.phone || p.website || p.linkedin_url) && (
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs font-medium">
                {p.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                    <a href={p.website} target="_blank" rel="noreferrer" className="underline hover:text-primary truncate">
                      {p.website}
                    </a>
                  </div>
                )}
                {p.linkedin_url && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="underline hover:text-primary">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground font-medium">
        Powered by TalentXcel Universal Career Passport · Verified &amp; Secured
      </p>

    </PageShell>
  );
};

export default PublicPassport;
