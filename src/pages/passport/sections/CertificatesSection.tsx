import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BadgeCheck, QrCode } from "lucide-react";
import CredentialDetailDialog, {
  CredentialDetail,
} from "../components/CredentialDetailDialog";
import CopilotPanel from "../components/CopilotPanel";

interface CertRow extends CredentialDetail {}

const CertificatesSection: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [active, setActive] = useState<CertRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["passport-certs", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<CertRow[]> => {
      const uid = user!.id;
      const [course, skill] = await Promise.all([
        supabase
          .from("course_certificates")
          .select(
            "id, certificate_number, issued_at, certificate_data, courses(title, instructor_name, duration_hours)",
          )
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
        type: "certificate",
        title:
          c.courses?.title || c.certificate_data?.course_title || "Course Certificate",
        issuer:
          c.certificate_data?.instructor_name ||
          c.courses?.instructor_name ||
          "TalentXcel",
        status: "verified",
        issuedAt: c.issued_at,
        hash: c.certificate_number || c.id,
        skills: c.certificate_data?.skills_acquired,
        meta: c.courses?.duration_hours
          ? [{ label: "Duration", value: `${c.courses.duration_hours} hrs` }]
          : undefined,
      }));

      const skillRows: CertRow[] = (skill.data ?? []).map((s: any) => ({
        id: s.id,
        type: "certificate",
        title: s.skill_name || s.certification_name || "Certification",
        issuer: s.issuer || s.provider || "Issuer",
        status: s.verification_status === "verified" ? "verified" : "pending",
        issuedAt: s.issue_date || s.created_at,
        expiresAt: s.expiry_date,
        hash: s.credential_id || s.id,
        proofUrl: s.credential_url,
      }));

      return [...courseRows, ...skillRows];
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Certificates"
        title="Verified credentials"
        description="Every certificate carries a tamper-proof signature and QR — recruiters can verify instantly."
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
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className="text-left"
            >
              <Card className="flex h-full flex-col border-border/60 p-5 transition-colors hover:border-foreground/30">
                <div className="flex items-start justify-between">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  {c.status === "verified" && (
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
                  Issued{" "}
                  {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "—"}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                    <span className="font-mono">
                      0x{String(c.hash || c.id).replace(/[^a-z0-9]/gi, "").slice(0, 6)}…
                    </span>
                  </div>
                  <span className="text-xs text-foreground underline-offset-2 group-hover:underline">
                    View proof
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <CopilotPanel section="certificates" />

      <CredentialDetailDialog
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        credential={active}
      />
    </div>
  );
};

export default CertificatesSection;
