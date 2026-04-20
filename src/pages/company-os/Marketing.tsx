import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";

export default function Marketing() {
  return (
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
  );
}
