import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";

export default function Sales() {
  return (
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
          render: (r: any) => `${r.currency ?? "USD"} ${Number(r.deal_value ?? 0).toLocaleString()}`,
        },
        { key: "score", label: "Score" },
        { key: "source", label: "Source" },
      ]}
    />
  );
}
