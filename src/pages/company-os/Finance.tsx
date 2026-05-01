import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Calculator } from "lucide-react";

export default function Finance() {
  const qc = useQueryClient();
  const [focus, setFocus] = useState("");
  const [cash, setCash] = useState("");

  const analyze = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-cfo-analyze", {
        body: {
          focus: focus.trim() || undefined,
          cash_on_hand: cash ? Number(cash) : undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success("AI CFO queued a budget plan for approval");
      setFocus("");
      qc.invalidateQueries({ queryKey: ["aios"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Analysis failed"),
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <h3 className="font-semibold">Brief the AI CFO</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Cash on hand (USD, optional)</Label>
            <Input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>
          <div className="space-y-1">
            <Label>Focus (optional)</Label>
            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. extend runway to 18 months"
            />
          </div>
        </div>
        <Button onClick={() => analyze.mutate()} disabled={analyze.isPending}>
          {analyze.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
            </>
          ) : (
            "Analyze runway & propose actions"
          )}
        </Button>
      </Card>

      <DepartmentList
        title="Finance"
        description="Revenue, expenses and budgets tracked by the AI CFO."
        table="ai_finance_entries"
        orderBy="entry_date"
        columns={[
          { key: "entry_date", label: "Date" },
          {
            key: "entry_type",
            label: "Type",
            render: (r: any) => (
              <Badge variant={r.entry_type === "revenue" ? "default" : "outline"}>
                {r.entry_type}
              </Badge>
            ),
          },
          { key: "category", label: "Category" },
          { key: "department", label: "Dept" },
          {
            key: "amount",
            label: "Amount",
            render: (r: any) =>
              `${r.currency ?? "USD"} ${Number(r.amount ?? 0).toLocaleString()}`,
          },
          { key: "description", label: "Description" },
        ]}
      />
    </div>
  );
}
