import React, { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, Share2 } from "lucide-react";

type VisibilityKey =
  | "education"
  | "experience"
  | "certificates"
  | "skills"
  | "contact"
  | "trust_score";

const DEFAULT_VIS: Record<VisibilityKey, boolean> = {
  education: true,
  experience: true,
  certificates: true,
  skills: true,
  contact: false,
  trust_score: true,
};

const TOGGLES: { key: VisibilityKey; label: string; hint: string }[] = [
  { key: "trust_score", label: "Trust score", hint: "Show your verified score to viewers." },
  { key: "education", label: "Education", hint: "Degrees and qualifications." },
  { key: "experience", label: "Experience", hint: "Employment history." },
  { key: "certificates", label: "Certificates", hint: "Verified credentials & badges." },
  { key: "skills", label: "Skills", hint: "Skills you've tracked." },
  { key: "contact", label: "Contact info", hint: "Email, phone, links." },
];

const SharePassport: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [saving, setSaving] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["passport-share-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, custom_url_slug, slug, full_name, passport_visibility")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [vis, setVis] = useState<Record<VisibilityKey, boolean> | null>(null);

  const activeVis: Record<VisibilityKey, boolean> = useMemo(() => {
    if (vis) return vis;
    return { ...DEFAULT_VIS, ...((profile as any)?.passport_visibility ?? {}) };
  }, [vis, profile]);

  const publicSlug =
    (profile as any)?.username ||
    (profile as any)?.custom_url_slug ||
    (profile as any)?.slug ||
    user?.id;

  const publicUrl = publicSlug
    ? `${window.location.origin}/passport/public/${publicSlug}`
    : "";

  const setToggle = (k: VisibilityKey, v: boolean) => {
    setVis((prev) => ({ ...(prev ?? activeVis), [k]: v }));
  };

  const savePreferences = async () => {
    if (!user?.id || !vis) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ passport_visibility: vis } as any)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Visibility updated");
    refetch();
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied");
  };

  const downloadQr = () => {
    const svg = document.getElementById("passport-qr") as SVGSVGElement | null;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const src = serializer.serializeToString(svg);
    const blob = new Blob([src], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passport-${publicSlug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Share"
        title="Your QR Passport"
        description="One scannable, tamper-proof link to your verified career identity. Control what viewers see."
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        {/* Visibility controls */}
        <Card className="border-border/60 p-6 md:p-8">
          <h3 className="text-title-2 text-foreground">Public visibility</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Toggle sections shown on your public passport page.
          </p>
          <div className="mt-6 divide-y divide-border/60">
            {TOGGLES.map((t) => (
              <div
                key={t.key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <Label className="text-body text-foreground">{t.label}</Label>
                  <p className="text-sm text-muted-foreground">{t.hint}</p>
                </div>
                <Switch
                  checked={activeVis[t.key]}
                  onCheckedChange={(v) => setToggle(t.key, v)}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setVis(null)}>
              Reset
            </Button>
            <Button onClick={savePreferences} disabled={saving || !vis}>
              {saving ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </Card>

        {/* QR + link */}
        <Card className="border-border/60 p-6 md:p-8">
          <p className="text-eyebrow text-muted-foreground">Passport QR</p>
          <div className="mt-4 flex items-center justify-center rounded-2xl border border-border/60 bg-background p-6">
            {publicUrl ? (
              <QRCodeSVG
                id="passport-qr"
                value={publicUrl}
                size={220}
                includeMargin={false}
                level="M"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sign in to generate your QR
              </p>
            )}
          </div>
          <p className="mt-4 truncate text-xs text-muted-foreground">
            {publicUrl || "—"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadQr}>
              <Download className="mr-2 h-4 w-4" /> QR
            </Button>
            <Button size="sm" className="col-span-2" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open public passport
              </a>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="col-span-2"
              onClick={() =>
                navigator.share?.({
                  title: `${(profile as any)?.full_name ?? "My"} Career Passport`,
                  url: publicUrl,
                })
              }
            >
              <Share2 className="mr-2 h-4 w-4" /> Share…
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharePassport;
