import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Clock,
  DownloadCloud,
  GraduationCap,
  Link2,
  QrCode,
  Search,
  Share2,
} from "lucide-react";
import CredentialDetailDialog, {
  CredentialDetail,
  buildProofPayload,
} from "../components/CredentialDetailDialog";
import CopilotPanel from "../components/CopilotPanel";
import { toast } from "sonner";

type Filter = "all" | "certificate" | "education" | "experience";

const iconFor = (t: CredentialDetail["type"]) =>
  t === "certificate" ? Award : t === "education" ? GraduationCap : Briefcase;

const proofUrlFor = (id: string) =>
  `${window.location.origin}/passport/proof/${id}`;

const WalletSection: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [active, setActive] = useState<CredentialDetail | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["passport-wallet", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<CredentialDetail[]> => {
      const uid = user!.id;
      const [course, skill, edu, exp] = await Promise.all([
        supabase
          .from("course_certificates")
          .select(
            "id, certificate_number, issued_at, certificate_data, courses(title, instructor_name, duration_hours)",
          )
          .eq("user_id", uid),
        supabase.from("skill_certifications").select("*").eq("user_id", uid),
        supabase.from("education").select("*").eq("user_id", uid),
        supabase.from("work_experience").select("*").eq("user_id", uid),
      ]);

      const rows: CredentialDetail[] = [];

      (course.data ?? []).forEach((c: any) =>
        rows.push({
          id: c.id,
          type: "certificate",
          title: c.courses?.title || c.certificate_data?.course_title || "Course Certificate",
          issuer: c.certificate_data?.instructor_name || c.courses?.instructor_name || "TalentXcel",
          status: "verified",
          issuedAt: c.issued_at,
          hash: c.certificate_number || c.id,
          skills: c.certificate_data?.skills_acquired,
        }),
      );

      (skill.data ?? []).forEach((s: any) =>
        rows.push({
          id: s.id,
          type: "certificate",
          title: s.skill_name || s.certification_name || "Certification",
          issuer: s.issuer || s.provider || "Issuer",
          status: s.verification_status === "verified" ? "verified" : "pending",
          issuedAt: s.issue_date || s.created_at,
          expiresAt: s.expiry_date,
          hash: s.credential_id || s.id,
          proofUrl: s.credential_url,
        }),
      );

      (edu.data ?? []).forEach((e: any) =>
        rows.push({
          id: e.id,
          type: "education",
          title: e.degree || "Qualification",
          issuer: e.institution || "Institution",
          status: "verified",
          issuedAt: e.graduation_date,
          hash: e.id,
        }),
      );

      (exp.data ?? []).forEach((e: any) =>
        rows.push({
          id: e.id,
          type: "experience",
          title: e.job_title || e.title || "Role",
          issuer: e.company || "Company",
          status: "verified",
          issuedAt: e.start_date,
          expiresAt: e.is_current ? null : e.end_date,
          hash: e.id,
        }),
      );

      return rows.sort((a, b) => (b.issuedAt || "").localeCompare(a.issuedAt || ""));
    },
  });

  // Deep-link: /passport/proof/:id redirects here with ?proof=<id> — auto-open the matching card.
  useEffect(() => {
    const proofId = searchParams.get("proof");
    if (!proofId || !data) return;
    const match = data.find((c) => c.id === proofId);
    if (match) {
      setActive(match);
      // Scroll the underlying card into view for context after the dialog closes.
      queueMicrotask(() => {
        document
          .getElementById(`wallet-card-${match.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else {
      toast.error("Credential not found in your wallet");
    }
    // Clear the query param so refresh doesn't keep re-opening.
    const next = new URLSearchParams(searchParams);
    next.delete("proof");
    setSearchParams(next, { replace: true });
  }, [data, searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!q) return true;
      return `${c.title} ${c.issuer}`.toLowerCase().includes(q);
    });
  }, [data, filter, query]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      all: list.length,
      certificate: list.filter((c) => c.type === "certificate").length,
      education: list.filter((c) => c.type === "education").length,
      experience: list.filter((c) => c.type === "experience").length,
      verified: list.filter((c) => c.status === "verified").length,
    };
  }, [data]);

  const copyLink = async (c: CredentialDetail) => {
    try {
      await navigator.clipboard.writeText(proofUrlFor(c.id));
      toast.success("Proof link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const downloadAllProofs = async () => {
    const verified = (data ?? []).filter((c) => c.status === "verified");
    if (verified.length === 0) {
      toast.info("No verified credentials to export yet");
      return;
    }
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("proofs")!;
      const index: any[] = [];
      const usedNames = new Set<string>();
      for (const c of verified) {
        const payload = buildProofPayload(c);
        let base = `${c.type}-${c.title}`.replace(/\W+/g, "-").toLowerCase().slice(0, 60) || c.id;
        let name = `${base}.json`;
        let i = 2;
        while (usedNames.has(name)) name = `${base}-${i++}.json`;
        usedNames.add(name);
        folder.file(name, JSON.stringify(payload, null, 2));
        index.push({
          file: `proofs/${name}`,
          id: payload.id,
          type: payload.type,
          title: payload.title,
          issuer: payload.issuer,
          issued_at: payload.issued_at,
          proof_url: payload.proof_url,
          hash: payload.hash,
        });
      }
      zip.file(
        "manifest.json",
        JSON.stringify(
          {
            kind: "talentxcel.wallet.export",
            version: 1,
            exported_at: new Date().toISOString(),
            user_id: user?.id ?? null,
            total: verified.length,
            credentials: index,
          },
          null,
          2,
        ),
      );
      zip.file(
        "README.txt",
        [
          "TalentXcel Career Passport — Verified Proofs export",
          "",
          `Exported: ${new Date().toISOString()}`,
          `Total credentials: ${verified.length}`,
          "",
          "Each file under /proofs is a signed proof payload. Recruiters can",
          "verify by opening the proof_url or scanning the QR from the wallet.",
        ].join("\n"),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `talentxcel-proofs-${stamp}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${verified.length} verified proof${verified.length === 1 ? "" : "s"}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not build proofs archive");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Wallet"
        title="Your credential wallet"
        description="Every verified credential in one place. Share any of them with a QR code or link — recruiters verify instantly."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total credentials", value: counts.all },
          { label: "Verified", value: counts.verified },
          { label: "Certificates", value: counts.certificate },
          { label: "Roles & degrees", value: counts.education + counts.experience },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 p-5">
            <p className="text-eyebrow text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-title-1 text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "certificate", "education", "experience"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : `${f}s`} · {counts[f]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search credentials"
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAllProofs}
            disabled={downloading || counts.verified === 0}
            title="Export every verified proof as a single ZIP"
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            {downloading ? "Packaging…" : "Download all proofs"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading wallet…</p>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <QrCode className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-body text-foreground">No credentials in your wallet yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete courses, add certifications, or log experience to fill your wallet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const Icon = iconFor(c.type);
            const proofUrl = proofUrlFor(c.id);
            return (
              <Card
                key={c.id}
                id={`wallet-card-${c.id}`}
                className={`flex flex-col border-border/60 p-5 transition-shadow ${
                  active?.id === c.id ? "ring-2 ring-foreground/40" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-eyebrow capitalize text-muted-foreground">{c.type}</span>
                  </div>
                  {c.status === "verified" ? (
                    <Badge className="gap-1 rounded-full">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 rounded-full">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 text-title-3 text-foreground line-clamp-2">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c.issuer}</p>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                  <button
                    type="button"
                    onClick={() => setActive(c)}
                    className="rounded-md bg-background p-1.5 transition-transform hover:scale-[1.03]"
                    aria-label="Open verified proof"
                  >
                    <QRCodeSVG value={proofUrl} size={56} level="M" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-eyebrow text-muted-foreground">Scan to verify</p>
                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      0x{String(c.hash || c.id).replace(/[^a-z0-9]/gi, "").slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setActive(c)}>
                    <QrCode className="mr-2 h-4 w-4" /> Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyLink(c)}
                    aria-label="Copy proof link"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Share credential"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: c.title, url: proofUrl });
                        } else {
                          await navigator.clipboard.writeText(proofUrl);
                          toast.success("Proof link copied");
                        }
                      } catch {}
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CopilotPanel section="wallet" title="Which credentials should I highlight?" />

      <CredentialDetailDialog
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        credential={active}
      />
    </div>
  );
};

export default WalletSection;
