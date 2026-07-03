import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Briefcase, Download, GraduationCap, Award, Wrench } from "lucide-react";
import { computeTrustScore } from "../lib/trustScore";

const RecruiterView: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-recruiter", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, education, experience, courseCerts, skillCerts, skills, projects] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("education").select("*").eq("user_id", uid),
          supabase.from("work_experience").select("*").eq("user_id", uid),
          supabase.from("course_certificates").select("id, courses(title)").eq("user_id", uid),
          supabase.from("skill_certifications").select("id, skill_name, issuer").eq("user_id", uid),
          supabase.from("user_skills").select("id, skill_name").eq("user_id", uid),
          supabase.from("portfolio_items").select("id").eq("user_id", uid),
        ]);
      const companies = new Set(
        (experience.data ?? []).map((r: any) => (r.company || "").toLowerCase()).filter(Boolean),
      );
      return {
        profile: profile.data,
        education: education.data ?? [],
        experience: experience.data ?? [],
        certificates: [
          ...((courseCerts.data ?? []).map((c: any) => ({
            title: c.courses?.title ?? "Course",
          }))),
          ...((skillCerts.data ?? []).map((c: any) => ({
            title: c.skill_name ?? "Certification",
            issuer: c.issuer,
          }))),
        ],
        skills: skills.data ?? [],
        counts: {
          education: education.data?.length ?? 0,
          experience: experience.data?.length ?? 0,
          companies: companies.size,
          certificates:
            (courseCerts.data?.length ?? 0) + (skillCerts.data?.length ?? 0),
          skills: skills.data?.length ?? 0,
          projects: projects.data?.length ?? 0,
        },
      };
    },
  });

  const trust = computeTrustScore({
    profile: data?.profile,
    counts: data?.counts,
  });

  const p: any = data?.profile ?? {};

  return (
    <div className="space-y-10 print:space-y-6">
      <PageHeader
        eyebrow="Recruiter View"
        title="One-page hiring report"
        description="A recruiter-friendly summary of this passport with trust breakdown. Download as PDF."
        actions={
          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        }
      />

      <div id="recruiter-report" className="space-y-6">
        {/* Candidate header */}
        <Card className="border-border/60 p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
              {(p.profile_picture_url || p.profile_photo_url) && (
                <img
                  src={p.profile_picture_url || p.profile_photo_url}
                  alt={p.full_name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-title-1 text-foreground">
                  {p.full_name ?? "Candidate"}
                </h2>
                <Badge className="gap-1 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> Trust {trust.score}
                </Badge>
              </div>
              <p className="mt-1 text-body text-muted-foreground">
                {p.headline || p.title || "—"}
                {p.location ? ` · ${p.location}` : ""}
              </p>
              {p.about && (
                <p className="mt-3 max-w-3xl text-body text-muted-foreground line-clamp-4">
                  {p.about}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-eyebrow text-muted-foreground">Trust Score</p>
              <p className="text-display-2 font-semibold tracking-tight text-foreground">
                {trust.score}
              </p>
              <p className="text-xs text-muted-foreground">/ 100</p>
            </div>
          </div>
        </Card>

        {/* Trust breakdown */}
        <Card className="border-border/60 p-6 md:p-8">
          <h3 className="text-title-2 text-foreground">Trust breakdown</h3>
          <p className="mt-1 text-sm text-muted-foreground">{trust.summary}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {trust.signals.map((s) => (
              <div key={s.key} className="rounded-lg border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-body text-foreground">{s.label}</p>
                  <Badge
                    variant={s.status === "verified" ? "default" : "secondary"}
                    className="rounded-full"
                  >
                    {s.score}
                  </Badge>
                </div>
                <Progress value={s.score} className="mt-3 h-1.5" />
                <p className="mt-2 text-xs text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Experience */}
        {data && data.experience.length > 0 && (
          <Card className="border-border/60 p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-title-2 text-foreground">Experience</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {data.experience.slice(0, 6).map((x: any) => (
                <li key={x.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body text-foreground">
                      {x.job_title || x.title} · {x.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {x.start_date ? new Date(x.start_date).getFullYear() : "—"}
                      {" — "}
                      {x.is_current
                        ? "Present"
                        : x.end_date
                          ? new Date(x.end_date).getFullYear()
                          : "—"}
                      {x.location ? ` · ${x.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Education */}
        {data && data.education.length > 0 && (
          <Card className="border-border/60 p-6 md:p-8">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-title-2 text-foreground">Education</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {data.education.map((e: any) => (
                <li key={e.id}>
                  <p className="text-body text-foreground">
                    {e.degree} · {e.institution}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {e.graduation_date
                      ? new Date(e.graduation_date).getFullYear()
                      : "—"}
                    {e.gpa_honors ? ` · ${e.gpa_honors}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Certificates + Skills */}
        <div className="grid gap-6 md:grid-cols-2">
          {data && data.certificates.length > 0 && (
            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-title-3 text-foreground">Certificates</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {data.certificates.slice(0, 10).map((c: any, i: number) => (
                  <li key={i}>· {c.title}</li>
                ))}
              </ul>
            </Card>
          )}
          {data && data.skills.length > 0 && (
            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-title-3 text-foreground">Skills</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.skills.slice(0, 20).map((s: any) => (
                  <Badge key={s.id} variant="secondary" className="rounded-full font-normal">
                    {s.skill_name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading report…</p>
        )}
      </div>

      <style>{`
        @media print {
          nav, aside, header, footer, .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
};

export default RecruiterView;
