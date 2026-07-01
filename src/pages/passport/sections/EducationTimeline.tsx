import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, GraduationCap, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const EducationTimeline: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-education", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", user!.id)
        .order("graduation_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Education"
        title="Lifelong learning timeline"
        description="Every qualification, from your first school to your most recent degree — verifiable end to end."
        actions={
          <Button asChild variant="outline">
            <Link to="/profile/edit">
              <Plus className="mr-2 h-4 w-4" /> Add education
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading timeline…</p>
      ) : !data || data.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-body text-foreground">
            No education entries yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your qualifications to build your verified academic timeline.
          </p>
          <Button asChild className="mt-6">
            <Link to="/profile/edit">Add your first entry</Link>
          </Button>
        </Card>
      ) : (
        <ol className="relative border-l border-border/60 pl-8">
          {data.map((edu: any) => {
            const year = edu.graduation_date
              ? new Date(edu.graduation_date).getFullYear()
              : "—";
            return (
              <li key={edu.id} className="relative mb-10 last:mb-0">
                <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background">
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-eyebrow text-muted-foreground">{year}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-title-2 text-foreground">
                      {edu.degree}
                    </h3>
                    <Badge className="gap-1 rounded-full">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </Badge>
                  </div>
                  <p className="text-body text-muted-foreground">
                    {edu.institution}
                    {edu.gpa_honors ? ` · ${edu.gpa_honors}` : ""}
                  </p>
                  {Array.isArray(edu.relevant_coursework) &&
                    edu.relevant_coursework.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {edu.relevant_coursework
                          .slice(0, 6)
                          .map((c: string) => (
                            <Badge
                              key={c}
                              variant="secondary"
                              className="rounded-full font-normal"
                            >
                              {c}
                            </Badge>
                          ))}
                      </div>
                    )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default EducationTimeline;
