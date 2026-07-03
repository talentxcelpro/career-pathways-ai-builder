import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Mail,
  Phone,
  Link as LinkIcon,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { computeTrustScore } from "./lib/trustScore";

const DEFAULT_VIS = {
  education: true,
  experience: true,
  certificates: true,
  skills: true,
  contact: false,
  trust_score: true,
};

async function findProfile(identifier: string) {
  const cleaned = identifier.startsWith("@") ? identifier.slice(1) : identifier;
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(cleaned);

  let query = supabase.from("profiles").select("*");
  if (uuidLike) {
    query = query.eq("id", cleaned);
  } else {
    query = query.or(
      `username.eq.${cleaned},custom_url_slug.eq.${cleaned},slug.eq.${cleaned}`,
    );
  }
  const { data } = await query.maybeSingle();
  return data;
}

const PublicPassport: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["public-passport", identifier],
    enabled: !!identifier,
    queryFn: async () => {
      const profile = await findProfile(identifier!);
      if (!profile) return null;
      const uid = profile.id;
      const [edu, exp, courseCerts, skillCerts, skills, portfolio] =
        await Promise.all([
          supabase.from("education").select("*").eq("user_id", uid),
          supabase.from("work_experience").select("*").eq("user_id", uid),
          supabase.from("course_certificates").select("id, courses(title)").eq("user_id", uid),
          supabase.from("skill_certifications").select("id, skill_name, issuer, verification_status").eq("user_id", uid),
          supabase.from("user_skills").select("id, skill_name").eq("user_id", uid),
          supabase.from("portfolio_items").select("id").eq("user_id", uid),
        ]);
      const companies = new Set(
        (exp.data ?? []).map((r: any) => (r.company || "").toLowerCase()).filter(Boolean),
      );
      return {
        profile,
        education: edu.data ?? [],
        experience: exp.data ?? [],
        certificates: [
          ...(courseCerts.data ?? []).map((c: any) => ({
            id: c.id,
            title: c.courses?.title ?? "Course Certificate",
            issuer: "TalentXcel",
            verified: true,
          })),
          ...(skillCerts.data ?? []).map((c: any) => ({
            id: c.id,
            title: c.skill_name ?? "Certification",
            issuer: c.issuer ?? "Issuer",
            verified: c.verification_status === "verified",
          })),
        ],
        skills: skills.data ?? [],
        counts: {
          education: edu.data?.length ?? 0,
          experience: exp.data?.length ?? 0,
          companies: companies.size,
          certificates:
            (courseCerts.data?.length ?? 0) + (skillCerts.data?.length ?? 0),
          skills: skills.data?.length ?? 0,
          projects: portfolio.data?.length ?? 0,
        },
      };
    },
  });

  const vis = useMemo(() => {
    if (!data?.profile) return DEFAULT_VIS;
    return { ...DEFAULT_VIS, ...((data.profile as any).passport_visibility ?? {}) };
  }, [data]);

  const trust = useMemo(
    () =>
      computeTrustScore({
        profile: data?.profile,
        counts: data?.counts,
      }),
    [data],
  );

  if (isLoading) {
    return (
      <PageShell width="lg" pad="md">
        <p className="text-muted-foreground">Loading passport…</p>
      </PageShell>
    );
  }

  if (!data || !data.profile) {
    return (
      <PageShell width="md" pad="md">
        <Helmet>
          <title>Passport not found · TalentXcel</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Card className="border-border/60 p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 text-title-1 text-foreground">Passport not found</h1>
          <p className="mt-2 text-muted-foreground">
            This passport may be private or the link is incorrect.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Return home</Link>
          </Button>
        </Card>
      </PageShell>
    );
  }

  const p: any = data.profile;
  const publicUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <PageShell width="xl" pad="md">
      <Helmet>
        <title>{p.full_name} · Career Passport · TalentXcel</title>
        <meta
          name="description"
          content={`${p.full_name}'s verified Career Passport on TalentXcel. Trust score ${trust.score}/100.`}
        />
        <meta property="og:title" content={`${p.full_name} · Career Passport`} />
        <meta property="og:description" content={p.headline || p.about || ""} />
        <meta property="og:type" content="profile" />
        {(p.profile_picture_url || p.profile_photo_url) && (
          <meta
            property="og:image"
            content={p.profile_picture_url || p.profile_photo_url}
          />
        )}
      </Helmet>

      {/* Hero */}
      <Card className="overflow-hidden border-border/60 p-0">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
                {(p.profile_picture_url || p.profile_photo_url) && (
                  <img
                    src={p.profile_picture_url || p.profile_photo_url}
                    alt={p.full_name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-eyebrow text-muted-foreground">Career Passport</p>
                <h1 className="mt-1 text-display-2 font-semibold tracking-tight text-foreground">
                  {p.full_name}
                </h1>
                <p className="mt-2 text-body text-muted-foreground">
                  {p.headline || p.title || ""}
                  {p.location ? ` · ${p.location}` : ""}
                </p>
                {p.about && (
                  <p className="mt-4 max-w-xl text-body text-muted-foreground line-clamp-4">
                    {p.about}
                  </p>
                )}
              </div>
            </div>
            {vis.trust_score && (
              <div className="mt-6 flex items-center gap-3">
                <Badge className="gap-1 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> Trust {trust.score}/100
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {trust.summary}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-border/60 bg-muted/30 p-8 md:border-l md:border-t-0">
            <p className="text-eyebrow text-muted-foreground">Verify</p>
            <div className="mt-3 flex items-center justify-center rounded-2xl border border-border/60 bg-background p-4">
              <QRCodeSVG value={publicUrl} size={160} includeMargin={false} level="M" />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Scan to verify this passport. Tamper-proof.
            </p>
          </div>
        </div>
      </Card>

      {/* Trust breakdown */}
      {vis.trust_score && (
        <Card className="mt-8 border-border/60 p-6 md:p-8">
          <h2 className="text-title-2 text-foreground">Trust breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trust.signals.map((s) => (
              <div key={s.key} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{s.label}</p>
                  <span className="text-sm text-muted-foreground">{s.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {vis.experience && data.experience.length > 0 && (
            <Card className="border-border/60 p-6 md:p-8">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-title-2 text-foreground">Experience</h2>
              </div>
              <ol className="mt-6 relative border-l border-border/60 pl-8">
                {data.experience.map((x: any) => (
                  <li key={x.id} className="relative mb-8 last:mb-0">
                    <span className="absolute -left-[33px] h-5 w-5 rounded-full border border-border/80 bg-background" />
                    <p className="text-eyebrow text-muted-foreground">
                      {x.start_date ? new Date(x.start_date).getFullYear() : "—"}
                      {" — "}
                      {x.is_current
                        ? "Present"
                        : x.end_date
                          ? new Date(x.end_date).getFullYear()
                          : "—"}
                    </p>
                    <p className="mt-1 text-title-3 text-foreground">
                      {x.job_title || x.title} · {x.company}
                    </p>
                    {x.description && (
                      <p className="mt-2 max-w-2xl text-body text-muted-foreground line-clamp-3">
                        {x.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {vis.education && data.education.length > 0 && (
            <Card className="border-border/60 p-6 md:p-8">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-title-2 text-foreground">Education</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {data.education.map((e: any) => (
                  <li key={e.id}>
                    <p className="text-title-3 text-foreground">
                      {e.degree} · {e.institution}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {e.graduation_date
                        ? new Date(e.graduation_date).getFullYear()
                        : "—"}
                      {e.field_of_study ? ` · ${e.field_of_study}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {vis.certificates && data.certificates.length > 0 && (
            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-title-3 text-foreground">Certificates</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {data.certificates.slice(0, 20).map((c: any) => (
                  <li key={c.id} className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">
                      · {c.title}{" "}
                      <span className="text-xs opacity-70">— {c.issuer}</span>
                    </span>
                    {c.verified && <BadgeCheck className="h-3.5 w-3.5 text-foreground" />}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {vis.skills && data.skills.length > 0 && (
            <Card className="border-border/60 p-6">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-title-3 text-foreground">Skills</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.skills.slice(0, 40).map((s: any) => (
                  <Badge key={s.id} variant="secondary" className="rounded-full font-normal">
                    {s.skill_name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {vis.contact && (p.email || p.phone || p.website || p.linkedin_url) && (
            <Card className="border-border/60 p-6">
              <h2 className="text-title-3 text-foreground">Contact</h2>
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                {p.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {p.email}
                  </li>
                )}
                {p.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {p.phone}
                  </li>
                )}
                {p.website && (
                  <li className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <a href={p.website} target="_blank" rel="noreferrer" className="underline">
                      {p.website}
                    </a>
                  </li>
                )}
                {p.linkedin_url && (
                  <li className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="underline">
                      LinkedIn
                    </a>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Powered by TalentXcel Career Passport · Verified on-chain
      </p>
    </PageShell>
  );
};

export default PublicPassport;
