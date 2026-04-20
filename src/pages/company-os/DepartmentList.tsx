import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => ReactNode };

interface Props<T> {
  title: string;
  description: string;
  table: string;
  columns: Column<T>[];
  orderBy?: string;
}

export function DepartmentList<T extends Record<string, any>>({
  title,
  description,
  table,
  columns,
  orderBy = "created_at",
}: Props<T>) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["aios", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .order(orderBy, { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nothing here yet. The AI agent will populate this view.
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={(row as any).id ?? i} className="border-t">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-4 py-3 align-top">
                      {c.render ? c.render(row) : renderCell((row as any)[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function renderCell(v: any) {
  if (v == null) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return <Badge variant={v ? "default" : "outline"}>{String(v)}</Badge>;
  if (typeof v === "object") return <code className="text-xs">{JSON.stringify(v)}</code>;
  return String(v);
}
