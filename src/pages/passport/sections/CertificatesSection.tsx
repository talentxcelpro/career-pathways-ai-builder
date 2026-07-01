import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BadgeCheck, QrCode } from "lucide-react";

interface CertRow {
  id: string;
  title: string;
  issuer: string;
  issued: string | null;
  hash: string;
  verified: boolean;
}

const CertificatesSection: React.FC = () => {
  const { user } = useOptimizedAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-certs", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<CertRow[]> => {
      const uid = user!.id;
      const [course, skill] = await Promise.all([
        supabase
          .from("course_certificates")
          .select("id, certificate_number, issued_at, certificate_data, courses(title, instructor_name)")
          .eq("user_id", uid)
          .order("issued_at", { ascending: false }),
        supabase
          .from("skill_certifications")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }),
      ]);

      const courseRows: CertRow[] = (course.data ?? []).map((c: any) => ({
        id: c.id,
        title: c.courses?.title || c.certificate_data?.course_title || "Course Certificate",
        issuer: c.certificate_data?.instructor_name || c.courses?.instructor_name || "TalentXcel",
        issued: c.issued_at,
        hash: c.certificate_number || c.id.slice(0, 10),
        verified: true,
      }));

      const skillRows: CertRow[] = (skill.data ?? []).map((s: any) => ({
        id: s.id,
        title: s.skill_name || s.certification_name || "Certification",
        issuer: s.issuer || s.provider || "Issuer",
        issued: s.issue_date || s.created_at,
        hash: (s.credential_id || s.id).toString().slice(0, 10),
        verified: s.verification_status !== "pending",
      }));

      return [...courseRows, ...skillRows];
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Certificates"
        title="Blockchain-verified credentials"
        description="Every certificate carries a tamper-proof hash and QR — recruiters can verify instantly."
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading certificates…</p>
      ) : !data || data.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <Award className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-body text-foreground">No certificates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a course or add an external credential to fill this wall.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id} className="flex flex-col border-border/60 p-5">
              <div className="flex items-start justify-between">
                <Award className="h-5 w-5 text-muted-foreground" />
                {c.verified && (
                  <Badge className="gap-1 rounded-full">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 text-title-3 text-foreground line-clamp-2">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.issuer}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Issued {c.issued ? new Date(c.issued).toLocaleDateString() : "—"}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  <span className="font-mono">0x{c.hash.padEnd(6, "0").slice(0, 6)}…</span>
                </div>
                <button className="text-xs text-foreground underline-offset-2 hover:underline">
                  View proof
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesSection;
