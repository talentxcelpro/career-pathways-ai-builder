import { DepartmentList } from "./DepartmentList";
import { Badge } from "@/components/ui/badge";

export default function HR() {
  return (
    <DepartmentList
      title="HR & Hiring"
      description="Candidates screened and ranked by the AI HR Head."
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
  );
}
