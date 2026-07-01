import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Briefcase,
  Wrench,
  FolderGit2,
  Trophy,
  BookOpen,
  QrCode,
  Share2,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { computeTrustScore } from "../lib/trustScore";

const PassportOverview: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-overview", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, education, experience, courseCerts, skillCerts, skills, projects] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("education").select("id").eq("user_id", uid),
          supabase.from("work_experience").select("id, company").eq("user_id", uid),
          supabase.from("course_certificates").select("id").eq("user_id", uid),
          supabase
            .from("skill_certifications")
            .select("id, skill_name")
            .eq("user_id", uid),
          supabase.from("user_skills").select("id").eq("user_id", uid),
          supabase.from("portfolio_items").select("id").eq("user_id", uid),
        ]);

      const companies = new Set(
        (experience.data ?? []).map((r: any) => (r.company || "").toLowerCase()).filter(Boolean),
      );

      return {
        profile: profile.data,
        counts: {
          education: education.data?.length ?? 0,
          experience: experience.data?.length ?? 0,
          companies: companies.size,
          certificates:
            (courseCerts.data?.length ?? 0) + (skillCerts.data?.length ?? 0),
          skills: skills.data?.length ?? 0,
          projects: projects.data?.length ?? 0,
          awards: 0,
          research: 0,
        },
      };
    },
  });

  const trust = computeTrustScore({
    profile: data?.profile,
    counts: data?.counts,
  });

  const publicSlug =
    (data?.profile as any)?.username ||
    (data?.profile as any)?.custom_url_slug ||
    user?.id;

  const publicUrl = publicSlug
    ? `${window.location.origin}/passport/public/${publicSlug}`
    : "";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Career Passport"
        title="Your verified career identity"
        description="One lifelong profile — education, experience, skills, and credentials — instantly verifiable by employers worldwide."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/passport/section/verification">
                <ShieldCheck className="mr-2 h-4 w-4" /> Verification
              </Link>
            </Button>
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <Share2 className="mr-2 h-4 w-4" /> Share Passport
              </a>
            </Button>
          </div>
        }
      />

      {/* Trust Score hero */}
      <Card className="overflow-hidden border-border/60 p-0">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-8 md:p-10">
            <p className="text-eyebrow text-muted-foreground">Trust Score</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-display-1 font-semibold tracking-tight text-foreground">
                {isLoading ? "—" : trust.score}
              </span>
              <span className="pb-2 text-body-lg text-muted-foreground">/ 100</span>
            </div>
            <p className="mt-4 max-w-md text-body text-muted-foreground">
              {trust.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {trust.signals.map((s) => (
                <Badge
                  key={s.label}
                  variant={s.status === "verified" ? "default" : "secondary"}
                  className={
                    s.status === "verified"
                      ? "gap-1 rounded-full"
                      : "gap-1 rounded-full opacity-70"
                  }
                >
                  {s.status === "verified" && <BadgeCheck className="h-3 w-3" />}
                  {s.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="border-t border-border/60 bg-muted/30 p-8 md:border-l md:border-t-0">
            <p className="text-eyebrow text-muted-foreground">Public Passport</p>
            <div className="mt-4 flex items-center justify-center rounded-2xl border border-border/60 bg-background p-6">
              <QrCode className="h-32 w-32 text-foreground" />
            </div>
            <p className="mt-4 truncate text-xs text-muted-foreground">
              {publicUrl || "Sign in to generate your link"}
            </p>
            <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                View public profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Credential grid */}
      <div>
        <h2 className="text-title-1 text-foreground">Your credentials</h2>
        <p className="mt-1 text-body text-muted-foreground">
          Everything that builds your career identity, in one place.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={GraduationCap}
            label="Education"
            value={data?.counts.education ?? 0}
            hint="credentials"
            to="/passport/section/education"
          />
          <StatCard
            icon={Briefcase}
            label="Experience"
            value={data?.counts.experience ?? 0}
            hint={`${data?.counts.companies ?? 0} companies`}
            to="/passport/section/experience"
          />
          <StatCard
            icon={Award}
            label="Certificates"
            value={data?.counts.certificates ?? 0}
            hint="issued"
            to="/passport/section/certificates"
          />
          <StatCard
            icon={Wrench}
            label="Skills"
            value={data?.counts.skills ?? 0}
            hint="tracked"
            to="/passport/section/skills"
          />
          <StatCard
            icon={FolderGit2}
            label="Projects"
            value={data?.counts.projects ?? 0}
            hint="in portfolio"
            to="/passport/section/projects"
          />
          <StatCard
            icon={Trophy}
            label="Awards"
            value={data?.counts.awards ?? 0}
            hint="recognized"
            to="/passport/section/awards"
          />
          <StatCard
            icon={BookOpen}
            label="Research"
            value={data?.counts.research ?? 0}
            hint="publications"
            to="/passport/section/research"
          />
          <StatCard
            icon={ShieldCheck}
            label="Verification"
            value={`${trust.score}%`}
            hint="trust score"
            to="/passport/section/verification"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  hint: string;
  to: string;
}> = ({ icon: Icon, label, value, hint, to }) => (
  <Link to={to} className="group">
    <Card className="h-full border-border/60 p-5 transition-colors group-hover:border-foreground/30">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-6">
        <p className="text-title-1 font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="text-foreground">{label}</span>
          <span> · {hint}</span>
        </p>
      </div>
    </Card>
  </Link>
);

export default PassportOverview;
