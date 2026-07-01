import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BadgeCheck, Briefcase, Plus } from "lucide-react";

const ExperienceSection: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-experience", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Experience"
        title="Verified employment history"
        description="Every role, cross-checked and hash-anchored. No more manual background verification."
        actions={
          <Button asChild variant="outline">
            <Link to="/profile/edit">
              <Plus className="mr-2 h-4 w-4" /> Add experience
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-body text-foreground">
            No experience recorded yet
          </p>
          <Button asChild className="mt-6">
            <Link to="/profile/edit">Add your first role</Link>
          </Button>
        </Card>
      ) : (
        <ol className="relative border-l border-border/60 pl-8">
          {data.map((exp: any) => {
            const start = exp.start_date
              ? new Date(exp.start_date).getFullYear()
              : "";
            const end = exp.is_current
              ? "Present"
              : exp.end_date
                ? new Date(exp.end_date).getFullYear()
                : "";
            return (
              <li key={exp.id} className="relative mb-10 last:mb-0">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background">
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                </span>
                <p className="text-eyebrow text-muted-foreground">
                  {start} {end ? `— ${end}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-title-2 text-foreground">
                    {exp.job_title || exp.title}
                  </h3>
                  <Badge className="gap-1 rounded-full">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                </div>
                <p className="mt-1 text-body text-muted-foreground">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </p>
                {exp.description && (
                  <p className="mt-3 max-w-2xl text-body text-muted-foreground">
                    {exp.description}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default ExperienceSection;
