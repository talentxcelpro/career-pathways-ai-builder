import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Briefcase, Clock, GraduationCap } from "lucide-react";
import CredentialDetailDialog, {
  CredentialDetail,
} from "../components/CredentialDetailDialog";

type MilestoneKind = "education" | "experience";

interface Milestone {
  key: string;
  kind: MilestoneKind;
  title: string;
  subtitle: string;
  start?: string | null;
  end?: string | null;
  year: number;
  verified: boolean;
  detail: CredentialDetail;
}

const toYear = (d?: string | null) => (d ? new Date(d).getFullYear() : 0);

const CareerTimeline: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [active, setActive] = useState<CredentialDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["passport-timeline", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [edu, exp] = await Promise.all([
        supabase.from("education").select("*").eq("user_id", uid),
        supabase.from("work_experience").select("*").eq("user_id", uid),
      ]);
      return { edu: edu.data ?? [], exp: exp.data ?? [] };
    },
  });

  const milestones = useMemo<Milestone[]>(() => {
    if (!data) return [];
    const eduM: Milestone[] = data.edu.map((e: any) => ({
      key: `edu-${e.id}`,
      kind: "education",
      title: e.degree || "Qualification",
      subtitle: e.institution || "Institution",
      start: e.start_date,
      end: e.graduation_date,
      year: toYear(e.graduation_date) || toYear(e.start_date),
      verified: true,
      detail: {
        id: e.id,
        type: "education",
        title: e.degree || "Qualification",
        issuer: e.institution || "Institution",
        status: "verified",
        issuedAt: e.graduation_date,
        hash: e.id,
        description: e.description,
        skills: e.relevant_coursework,
        meta: [
          e.field_of_study && { label: "Field", value: e.field_of_study },
          e.gpa_honors && { label: "GPA / Honors", value: e.gpa_honors },
        ].filter(Boolean) as any,
      },
    }));

    const expM: Milestone[] = data.exp.map((x: any) => ({
      key: `exp-${x.id}`,
      kind: "experience",
      title: x.job_title || x.title || "Role",
      subtitle: x.company || "Company",
      start: x.start_date,
      end: x.is_current ? null : x.end_date,
      year: toYear(x.start_date),
      verified: Boolean(x.company && x.start_date),
      detail: {
        id: x.id,
        type: "experience",
        title: x.job_title || x.title || "Role",
        issuer: x.company || "Company",
        status: x.company && x.start_date ? "verified" : "partial",
        issuedAt: x.start_date,
        expiresAt: x.is_current ? null : x.end_date,
        hash: x.id,
        description: x.description,
        meta: [
          x.location && { label: "Location", value: x.location },
          x.employment_type && { label: "Type", value: x.employment_type },
        ].filter(Boolean) as any,
      },
    }));

    return [...eduM, ...expM].sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [data]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Career Timeline"
        title="Every milestone, verified"
        description="Your complete career journey — tap any milestone to open its verified credential."
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading timeline…</p>
      ) : milestones.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <p className="text-body text-foreground">Your timeline is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add education and experience to build your verified journey.
          </p>
        </Card>
      ) : (
        <ol className="relative border-l border-border/60 pl-8">
          {milestones.map((m) => {
            const Icon = m.kind === "education" ? GraduationCap : Briefcase;
            return (
              <li key={m.key} className="relative mb-10 last:mb-0">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background">
                  <Icon className="h-3 w-3 text-foreground" />
                </span>
                <button
                  onClick={() => setActive(m.detail)}
                  className="group w-full text-left"
                >
                  <p className="text-eyebrow text-muted-foreground">
                    {m.year || "—"}
                    {m.kind === "experience" && m.end === null ? " · Present" : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-title-2 text-foreground group-hover:underline underline-offset-4">
                      {m.title}
                    </h3>
                    {m.verified ? (
                      <Badge className="gap-1 rounded-full">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        <Clock className="h-3 w-3" /> Partial
                      </Badge>
                    )}
                    <Badge variant="secondary" className="rounded-full font-normal">
                      {m.kind === "education" ? "Education" : "Experience"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-body text-muted-foreground">
                    {m.subtitle}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <CredentialDetailDialog
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        credential={active}
      />
    </div>
  );
};

export default CareerTimeline;
