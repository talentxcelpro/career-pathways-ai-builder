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
  Clock,
  Download,
  ExternalLink,
  Fingerprint,
  Share2,
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

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "—";

export const CredentialDetailDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  credential,
}) => {
  if (!credential) return null;

  const proofUrl =
    credential.proofUrl ||
    (credential.publicUrl
      ? `${credential.publicUrl}?proof=${credential.id}`
      : `${window.location.origin}/passport/proof/${credential.id}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="p-6 md:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-2">
                {statusBadge(credential.status)}
                <span className="text-eyebrow text-muted-foreground">
                  {credential.type === "certificate"
                    ? "Certificate"
                    : credential.type === "education"
                      ? "Education"
                      : "Experience"}
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

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-eyebrow text-muted-foreground">Issued</dt>
                <dd className="mt-1 text-foreground">{fmt(credential.issuedAt)}</dd>
              </div>
              {credential.expiresAt && (
                <div>
                  <dt className="text-eyebrow text-muted-foreground">Expires</dt>
                  <dd className="mt-1 text-foreground">{fmt(credential.expiresAt)}</dd>
                </div>
              )}
              {credential.meta?.map((m) => (
                <div key={m.label}>
                  <dt className="text-eyebrow text-muted-foreground">{m.label}</dt>
                  <dd className="mt-1 text-foreground">{m.value}</dd>
                </div>
              ))}
            </dl>

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

            {credential.hash && (
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Fingerprint className="h-3.5 w-3.5" />
                <span className="font-mono truncate">{credential.hash}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={proofUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View proof
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: credential.title,
                      url: proofUrl,
                    });
                  } else {
                    navigator.clipboard?.writeText(proofUrl);
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={proofUrl} download>
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          </div>

          <div className="border-t border-border/60 bg-muted/30 p-6 md:border-l md:border-t-0">
            <p className="text-eyebrow text-muted-foreground">Verification QR</p>
            <div className="mt-3 flex items-center justify-center rounded-2xl border border-border/60 bg-background p-4">
              <QRCodeSVG
                value={proofUrl}
                size={168}
                includeMargin={false}
                level="M"
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Scan to verify this credential on-chain. No account needed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialDetailDialog;
