import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Code2, Megaphone, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}

export default function CEODashboard() {
  const { data: pendingDecisions = 0 } = useQuery({
    queryKey: ["aios", "pending-decisions"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ai_company_decisions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return count ?? 0;
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["aios", "leads-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ai_sales_leads")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: openTasks = 0 } = useQuery({
    queryKey: ["aios", "open-tasks"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ai_engineering_tasks")
        .select("id", { count: "exact", head: true })
        .neq("status", "done");
      return count ?? 0;
    },
  });

  const { data: candidateCount = 0 } = useQuery({
    queryKey: ["aios", "candidates"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ai_hr_candidates")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: campaignCount = 0 } = useQuery({
    queryKey: ["aios", "campaigns"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ai_marketing_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      return count ?? 0;
    },
  });

  const { data: revenue = 0 } = useQuery({
    queryKey: ["aios", "revenue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_finance_entries")
        .select("amount")
        .eq("entry_type", "revenue");
      return (data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Executive Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time signal from every department.</p>
      </div>

      {pendingDecisions > 0 && (
        <Card className="border-primary/40 bg-primary/5 p-4">
          <Link to="/company-os/decisions" className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {pendingDecisions} AI decision{pendingDecisions === 1 ? "" : "s"} awaiting your approval
              </div>
              <div className="text-xs text-muted-foreground">Review the decision queue to approve, reject or modify.</div>
            </div>
            <Badge>Action needed</Badge>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={DollarSign} label="Revenue" value={`$${revenue.toLocaleString()}`} hint="All time" />
        <StatCard icon={TrendingUp} label="Pipeline" value={String(leadCount)} hint="Active leads" />
        <StatCard icon={Code2} label="Open tasks" value={String(openTasks)} hint="Engineering" />
        <StatCard icon={Users} label="Candidates" value={String(candidateCount)} hint="In funnel" />
        <StatCard icon={Megaphone} label="Campaigns" value={String(campaignCount)} hint="Active" />
        <StatCard icon={AlertCircle} label="Pending" value={String(pendingDecisions)} hint="Decisions" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-2">How the Virtual CEO works</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Sets weekly goals across all 5 departments</li>
            <li>Department agents break goals into tasks</li>
            <li>Low-risk tasks execute autonomously</li>
            <li>High-risk decisions queue for your approval</li>
            <li>Outcomes feed back to improve next plans</li>
          </ol>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-2">Approval policy</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Hires &amp; offers — always require approval</li>
            <li>Spend over budget — always require approval</li>
            <li>Product launches &amp; pricing — always require approval</li>
            <li>Outreach drafts &amp; sprint plans — auto-execute</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
