import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ShieldCheck, Link2 } from "lucide-react";
import { computeTrustScore } from "../lib/trustScore";

const VerificationDashboard: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data } = useQuery({
    queryKey: ["passport-verification", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, education, experience, cc, sc, skills, projects] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("education").select("id").eq("user_id", uid),
          supabase.from("work_experience").select("id, company").eq("user_id", uid),
          supabase.from("course_certificates").select("id").eq("user_id", uid),
          supabase.from("skill_certifications").select("id").eq("user_id", uid),
          supabase.from("user_skills").select("id").eq("user_id", uid),
          supabase.from("portfolio_items").select("id").eq("user_id", uid),
        ]);
      const companies = new Set(
        (experience.data ?? [])
          .map((r: any) => (r.company || "").toLowerCase())
          .filter(Boolean),
      );
      return {
        profile: profile.data,
        counts: {
          education: education.data?.length ?? 0,
          experience: experience.data?.length ?? 0,
          companies: companies.size,
          certificates: (cc.data?.length ?? 0) + (sc.data?.length ?? 0),
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

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Verification"
        title="Trust, verified end to end"
        description="Each signal is checked independently. Recruiters see a single trust score."
      />

      <Card className="border-border/60 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-eyebrow text-muted-foreground">Verification Score</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-display-2 font-semibold tracking-tight text-foreground">
                {trust.score}
              </span>
              <span className="pb-2 text-body-lg text-muted-foreground">%</span>
            </div>
            <p className="mt-3 max-w-lg text-body text-muted-foreground">
              {trust.summary}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-foreground" />
            Blockchain anchoring{" "}
            <span className="text-foreground">Active</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${trust.score}%` }}
          />
        </div>
      </Card>

      <div>
        <h2 className="text-title-1 text-foreground">Signal breakdown</h2>
        <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {trust.signals.map((s) => (
            <div key={s.key} className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {s.status === "verified" ? (
                    <CheckCircle2 className="h-5 w-5 text-foreground" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-body text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Weight {s.weight}% · {s.detail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-title-3 text-foreground">
                    {s.score}
                  </span>
                  <Badge
                    variant={s.status === "verified" ? "default" : "secondary"}
                    className="rounded-full capitalize"
                  >
                    {s.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border/60 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-muted p-2">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-title-3 text-foreground">
              How verification works
            </h3>
            <p className="mt-1 max-w-2xl text-body text-muted-foreground">
              Each credential is hashed and anchored so it can be independently
              verified by any employer or institution. Users see a single trust
              score; recruiters can drill into every signal from the public
              passport link.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerificationDashboard;
