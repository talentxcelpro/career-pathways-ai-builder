import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Marketing() {
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [channel, setChannel] = useState("");
  const [budget, setBudget] = useState("");
  const [brief, setBrief] = useState("");
  const qc = useQueryClient();

  const plan = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-cmo-plan", {
        body: {
          objective,
          audience,
          channel,
          budget_usd: Number(budget) || 0,
          brief,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success("AI CMO drafted a campaign. Awaiting your approval.");
      setObjective("");
      setAudience("");
      setChannel("");
      setBudget("");
      setBrief("");
      qc.invalidateQueries({ queryKey: ["aios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to draft campaign"),
  });

  const canSubmit = objective.trim().length >= 4 && brief.trim().length >= 10;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Brief the AI CMO</h3>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Describe the goal. The AI CMO designs a 2-week campaign with a content
          calendar, KPIs, and budget — queued for your approval before launch.
        </p>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) plan.mutate();
          }}
        >
          <Input
            placeholder="Objective * (e.g. drive 500 signups from senior engineers)"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={plan.isPending}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={plan.isPending}
            />
            <Input
              placeholder="Channel (LinkedIn, email…)"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              disabled={plan.isPending}
            />
            <Input
              placeholder="Budget USD"
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={plan.isPending}
            />
          </div>
          <Textarea
            placeholder="Brief: positioning, hooks, what success looks like *"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            disabled={plan.isPending}
          />
          <div>
            <Button type="submit" disabled={!canSubmit || plan.isPending}>
              {plan.isPending ? "Drafting…" : "Generate campaign"}
            </Button>
          </div>
        </form>
      </Card>

      <DepartmentList
        title="Marketing"
        description="Campaigns orchestrated by the AI CMO."
        table="ai_marketing_campaigns"
        columns={[
          { key: "name", label: "Campaign" },
          { key: "channel", label: "Channel" },
          { key: "objective", label: "Objective" },
          {
            key: "status",
            label: "Status",
            render: (r: any) => <Badge variant="outline">{r.status}</Badge>,
          },
          {
            key: "budget",
            label: "Budget",
            render: (r: any) => `$${Number(r.budget ?? 0).toLocaleString()}`,
          },
          {
            key: "spent",
            label: "Spent",
            render: (r: any) => `$${Number(r.spent ?? 0).toLocaleString()}`,
          },
        ]}
      />
    </div>
  );
}
