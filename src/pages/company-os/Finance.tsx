import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";

export default function Finance() {
  return (
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
            <Badge variant={r.entry_type === "revenue" ? "default" : "outline"}>{r.entry_type}</Badge>
          ),
        },
        { key: "category", label: "Category" },
        { key: "department", label: "Dept" },
        {
          key: "amount",
          label: "Amount",
          render: (r: any) => `${r.currency ?? "USD"} ${Number(r.amount ?? 0).toLocaleString()}`,
        },
        { key: "description", label: "Description" },
      ]}
    />
  );
}
