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

export default function HR() {
  const [role, setRole] = useState("");
  const [mustHaves, setMustHaves] = useState("");
  const [niceToHaves, setNiceToHaves] = useState("");
  const [brief, setBrief] = useState("");
  const qc = useQueryClient();

  const screen = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-hr-screen", {
        body: {
          role,
          brief,
          must_haves: mustHaves,
          nice_to_haves: niceToHaves,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success("AI Head of HR queued screening for your approval.");
      setRole("");
      setMustHaves("");
      setNiceToHaves("");
      setBrief("");
      qc.invalidateQueries({ queryKey: ["aios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to screen candidates"),
  });

  const canSubmit = role.trim().length >= 2 && brief.trim().length >= 10;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Brief the AI Head of HR</h3>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Open a role. The AI screens active candidates, scores fit, and
          recommends advance/reject — queued for your approval.
        </p>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) screen.mutate();
          }}
        >
          <Input
            placeholder="Role title * (e.g. Senior Frontend Engineer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={screen.isPending}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Must-haves (comma separated)"
              value={mustHaves}
              onChange={(e) => setMustHaves(e.target.value)}
              disabled={screen.isPending}
            />
            <Input
              placeholder="Nice-to-haves"
              value={niceToHaves}
              onChange={(e) => setNiceToHaves(e.target.value)}
              disabled={screen.isPending}
            />
          </div>
          <Textarea
            placeholder="Brief: scope, seniority, what success looks like in 90 days *"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            disabled={screen.isPending}
          />
          <div>
            <Button type="submit" disabled={!canSubmit || screen.isPending}>
              {screen.isPending ? "Screening…" : "Screen candidates"}
            </Button>
          </div>
        </form>
      </Card>

      <DepartmentList
        title="HR & Hiring"
        description="Candidates screened and ranked by the AI Head of HR."
        table="ai_hr_candidates"
        columns={[
          { key: "full_name", label: "Candidate" },
          { key: "role", label: "Role" },
          {
            key: "stage",
            label: "Stage",
            render: (r: any) => <Badge variant="outline">{r.stage}</Badge>,
          },
          { key: "ai_score", label: "AI Score" },
          { key: "email", label: "Email" },
        ]}
      />
    </div>
  );
}
