import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Target, TrendingUp, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CoachResult {
  summary: string;
  strengths: string[];
  missing_skills: { skill: string; why: string; priority: "high" | "medium" | "low" }[];
  roadmap: {
    horizon: string;
    goal: string;
    actions: string[];
  }[];
  target_roles?: string[];
}

const AICoach: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);

  const { data: profileData } = useQuery({
    queryKey: ["coach-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, edu, exp, skills, certs] = await Promise.all([
        supabase.from("profiles").select("full_name, headline, title, about, location").eq("id", uid).maybeSingle(),
        supabase.from("education").select("degree, institution, field_of_study").eq("user_id", uid),
        supabase.from("work_experience").select("job_title, title, company, description, start_date, end_date, is_current").eq("user_id", uid),
        supabase.from("user_skills").select("skill_name").eq("user_id", uid),
        supabase.from("skill_certifications").select("skill_name, issuer").eq("user_id", uid),
      ]);
      return {
        profile: profile.data,
        education: edu.data ?? [],
        experience: exp.data ?? [],
        skills: skills.data ?? [],
        certificates: certs.data ?? [],
      };
    },
  });

  const analyze = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("passport-ai-coach", {
        body: { goal, profile: profileData },
      });
      if (error) throw error;
      return data as CoachResult;
    },
    onSuccess: (r) => {
      setResult(r);
      toast.success("Career analysis ready");
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Coach unavailable");
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="AI Career Coach"
        title="Your personalized career guidance"
        description="Trained on your verified passport data — get missing-skill analysis and a role-specific roadmap."
      />

      <Card className="border-border/60 p-6 md:p-8">
        <label className="text-eyebrow text-muted-foreground">
          What career direction are you exploring?
        </label>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Break into product management at a growth-stage startup within 12 months."
          className="mt-3 min-h-[100px]"
        />
        <div className="mt-4 flex items-center justify-end">
          <Button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending || !profileData}
          >
            {analyze.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your passport…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze & generate roadmap
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="border-border/60 p-6 md:p-8">
            <p className="text-eyebrow text-muted-foreground">Summary</p>
            <p className="mt-3 text-body text-foreground">{result.summary}</p>
            {result.target_roles && result.target_roles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {result.target_roles.map((r) => (
                  <Badge key={r} variant="secondary" className="rounded-full">
                    <Target className="mr-1 h-3 w-3" /> {r}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-title-3 text-foreground">Your strengths</h3>
              </div>
              <ul className="mt-4 space-y-2 text-body text-muted-foreground">
                {result.strengths.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </Card>

            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-title-3 text-foreground">Skills to add</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {result.missing_skills.map((m, i) => (
                  <li key={i} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-body text-foreground">{m.skill}</p>
                      <Badge
                        variant={m.priority === "high" ? "default" : "secondary"}
                        className="rounded-full capitalize"
                      >
                        {m.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.why}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="border-border/60 p-6 md:p-8">
            <h3 className="text-title-2 text-foreground">Your roadmap</h3>
            <ol className="mt-6 relative border-l border-border/60 pl-8">
              {result.roadmap.map((r, i) => (
                <li key={i} className="relative mb-8 last:mb-0">
                  <span className="absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full border border-border/80 bg-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  </span>
                  <p className="text-eyebrow text-muted-foreground">{r.horizon}</p>
                  <p className="mt-1 text-title-3 text-foreground">{r.goal}</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {r.actions.map((a, j) => (
                      <li key={j}>· {a}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AICoach;
