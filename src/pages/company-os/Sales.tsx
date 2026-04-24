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

export default function Sales() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [brief, setBrief] = useState("");
  const qc = useQueryClient();

  const draft = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-sales-draft", {
        body: { name, company, email, source, brief },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success("AI Head of Sales drafted outreach. Awaiting your approval.");
      setName("");
      setCompany("");
      setEmail("");
      setSource("");
      setBrief("");
      qc.invalidateQueries({ queryKey: ["aios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to draft outreach"),
  });

  const canSubmit = name.trim().length >= 2 && brief.trim().length >= 10;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Brief the AI Head of Sales</h3>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Drop a lead. The AI qualifies them, scores the deal, and drafts a
          personalized outreach email — queued for your approval before sending.
        </p>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) draft.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Lead name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={draft.isPending}
            />
            <Input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={draft.isPending}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={draft.isPending}
            />
            <Input
              placeholder="Source (LinkedIn, referral…)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={draft.isPending}
            />
          </div>
          <Textarea
            placeholder="Brief: what they do, why they'd care, signals you've seen *"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            disabled={draft.isPending}
          />
          <div>
            <Button type="submit" disabled={!canSubmit || draft.isPending}>
              {draft.isPending ? "Drafting…" : "Draft outreach"}
            </Button>
          </div>
        </form>
      </Card>

      <DepartmentList
        title="Sales"
        description="Pipeline managed by the AI Head of Sales."
        table="ai_sales_leads"
        columns={[
          { key: "name", label: "Lead" },
          { key: "company", label: "Company" },
          {
            key: "stage",
            label: "Stage",
            render: (r: any) => <Badge variant="outline">{r.stage}</Badge>,
          },
          {
            key: "deal_value",
            label: "Value",
            render: (r: any) =>
              `${r.currency ?? "USD"} ${Number(r.deal_value ?? 0).toLocaleString()}`,
          },
          { key: "score", label: "Score" },
          { key: "source", label: "Source" },
        ]}
      />
    </div>
  );
}
