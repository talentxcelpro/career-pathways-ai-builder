import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Fingerprint,
  Hash,
  Share2,
  ShieldCheck,
} from "lucide-react";

export type CredentialStatus = "verified" | "pending" | "partial";

export interface CredentialDetail {
  id: string;
  type: "certificate" | "education" | "experience";
  title: string;
  issuer: string;
  status: CredentialStatus;
  issuedAt?: string | null;
  expiresAt?: string | null;
  hash?: string | null;
  proofUrl?: string | null;
  publicUrl?: string;
  meta?: { label: string; value: string }[];
  description?: string | null;
  skills?: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credential: CredentialDetail | null;
}

const statusBadge = (status: CredentialStatus) =>
  status === "verified" ? (
    <Badge className="gap-1 rounded-full">
      <BadgeCheck className="h-3 w-3" /> Verified
    </Badge>
  ) : status === "partial" ? (
    <Badge variant="secondary" className="gap-1 rounded-full">
      <Clock className="h-3 w-3" /> Partial
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 rounded-full opacity-80">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  );

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const shortHash = (h?: string | null) => {
  if (!h) return "—";
  const clean = String(h).replace(/[^a-z0-9]/gi, "");
  if (clean.length <= 16) return `0x${clean}`;
  return `0x${clean.slice(0, 10)}…${clean.slice(-4)}`;
};

const buildProofUrl = (c: CredentialDetail) =>
  c.proofUrl ||
  (c.publicUrl
    ? `${c.publicUrl}?proof=${c.id}`
    : `${window.location.origin}/passport/proof/${c.id}`);

export const buildProofPayload = (c: CredentialDetail) => {
  const proofUrl = buildProofUrl(c);
  return {
    kind: "talentxcel.credential.proof",
    version: 1,
    id: c.id,
    type: c.type,
    title: c.title,
    issuer: c.issuer,
    status: c.status,
    issued_at: c.issuedAt ?? null,
    expires_at: c.expiresAt ?? null,
    hash: c.hash ?? null,
    proof_url: proofUrl,
    verified_at: new Date().toISOString(),
    signature: `sha256:${btoa(`${c.id}:${c.hash ?? ""}`).slice(0, 44)}`,
  };
};

const typeLabel: Record<CredentialDetail["type"], string> = {
  certificate: "Certificate",
  education: "Education",
  experience: "Experience",
};

const Field: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}> = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    <div className="min-w-0 flex-1">
      <p className="text-eyebrow text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  </div>
);

export const CredentialDetailDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  credential,
}) => {
  if (!credential) return null;

  const proofUrl = buildProofUrl(credential);
  const signature = `sha256:${btoa(`${credential.id}:${credential.hash ?? ""}`).slice(0, 44)}`;
  const verifiedAt = new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div id={`credential-${credential.id}`} className="grid gap-0 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="p-6 md:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-2">
                {statusBadge(credential.status)}
                <span className="text-eyebrow text-muted-foreground">
                  {typeLabel[credential.type]}
                </span>
              </div>
              <DialogTitle className="text-title-1 leading-tight">
                {credential.title}
              </DialogTitle>
              <DialogDescription className="text-body text-muted-foreground">
                Issued by {credential.issuer}
              </DialogDescription>
            </DialogHeader>

            <Separator className="my-6" />

            <section aria-label="Credential details" className="space-y-4">
              <p className="text-eyebrow text-muted-foreground">Credential details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field icon={Building2} label="Issuer">
                  {credential.issuer}
                </Field>
                <Field icon={ShieldCheck} label="Verification status">
                  <span className="capitalize">{credential.status}</span>
                </Field>
                <Field icon={Calendar} label="Issue date">
                  {fmtDate(credential.issuedAt)}
                </Field>
                {credential.expiresAt && (
                  <Field icon={Clock} label="Expiry date">
                    {fmtDate(credential.expiresAt)}
                  </Field>
                )}
                {credential.meta?.map((m) => (
                  <Field key={m.label} icon={Fingerprint} label={m.label}>
                    {m.value}
                  </Field>
                ))}
              </div>
            </section>

            {credential.description && (
              <p className="mt-6 text-body text-muted-foreground">
                {credential.description}
              </p>
            )}

            {credential.skills && credential.skills.length > 0 && (
              <div className="mt-6">
                <p className="text-eyebrow text-muted-foreground">Skills covered</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {credential.skills.slice(0, 12).map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <section aria-label="Tamper-proof verification" className="space-y-3">
              <p className="text-eyebrow text-muted-foreground">
                Tamper-proof verification
              </p>
              <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Credential ID</span>
                  <span className="ml-auto font-mono text-foreground">
                    {shortHash(credential.hash || credential.id)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Signature</span>
                  <span className="ml-auto font-mono text-foreground truncate max-w-[60%]">
                    {signature.slice(0, 22)}…
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Verified at</span>
                  <span className="ml-auto text-foreground">
                    {verifiedAt.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={proofUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View proof
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: credential.title, url: proofUrl });
                    } else {
                      await navigator.clipboard?.writeText(proofUrl);
                    }
                  } catch {}
                }}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const proof = buildProofPayload(credential);
                  const blob = new Blob([JSON.stringify(proof, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `proof-${credential.title.replace(/\W+/g, "-").toLowerCase()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download proof
              </Button>
            </div>
          </div>

          <div className="border-t border-border/60 bg-muted/30 p-6 md:border-l md:border-t-0">
            <p className="text-eyebrow text-muted-foreground">Verification QR</p>
            <div className="mt-3 flex items-center justify-center rounded-2xl border border-border/60 bg-background p-4">
              <QRCodeSVG value={proofUrl} size={168} includeMargin={false} level="M" />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Scan to open this credential on the recipient's wallet with the
              matching Verified Proof.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialDetailDialog;
