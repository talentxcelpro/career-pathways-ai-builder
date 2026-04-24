import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

type Decision = {
  id: string;
  department: string;
  decision_type: string;
  title: string;
  summary: string | null;
  status: string;
  priority: number;
  confidence_score: number | null;
  created_at: string;
  created_by_agent: string | null;
};

export default function DecisionQueue() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["aios", "decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_company_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Decision[];
    },
  });

  const review = useMutation({
    mutationFn: async ({
      id,
      status,
      decision_type,
    }: {
      id: string;
      status: "approved" | "rejected";
      decision_type: string;
    }) => {
      // For known auto-executable decisions, route through the matching agent function.
      const executors: Record<string, string> = {
        create_sprint: "ai-cto-execute",
        send_outreach: "ai-sales-execute",
        launch_campaign: "ai-cmo-execute",
        screen_candidates: "ai-hr-execute",
      };
      if (status === "approved" && executors[decision_type]) {
        const { data, error } = await supabase.functions.invoke(
          executors[decision_type],
          { body: { decision_id: id } },
        );
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        return;
      }

      const { error } = await supabase
        .from("ai_company_decisions")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          executed_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(`Decision ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["aios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update decision"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading decisions…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Decision Queue</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated decisions awaiting your approval.
        </p>
      </div>

      {decisions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No decisions yet. The Virtual CEO will queue items here.
        </Card>
      ) : (
        decisions.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{d.department}</Badge>
                  <Badge variant="secondary">{d.decision_type}</Badge>
                  {d.confidence_score != null && (
                    <span className="text-xs text-muted-foreground">
                      Confidence {Number(d.confidence_score).toFixed(0)}%
                    </span>
                  )}
                  <Badge
                    variant={
                      d.status === "pending"
                        ? "default"
                        : d.status === "approved" || d.status === "auto_executed"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {d.status}
                  </Badge>
                </div>
                <h3 className="mt-2 font-medium">{d.title}</h3>
                {d.summary && (
                  <p className="mt-1 text-sm text-muted-foreground">{d.summary}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  by {d.created_by_agent ?? "AI Agent"} •{" "}
                  {new Date(d.created_at).toLocaleString()}
                </p>
              </div>
              {d.status === "pending" && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      review.mutate({
                        id: d.id,
                        status: "approved",
                        decision_type: d.decision_type,
                      })
                    }
                    disabled={review.isPending}
                  >
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      review.mutate({
                        id: d.id,
                        status: "rejected",
                        decision_type: d.decision_type,
                      })
                    }
                    disabled={review.isPending}
                  >
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
