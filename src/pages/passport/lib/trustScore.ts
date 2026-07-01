export interface TrustSignal {
  label: string;
  status: "verified" | "pending";
  weight: number;
}

export interface TrustResult {
  score: number;
  summary: string;
  signals: TrustSignal[];
}

/**
 * Deterministic Trust Score. Blockchain lives underneath — users see one number.
 * Weights sum to 100. A signal contributes its weight when "verified".
 */
export function computeTrustScore(input: {
  profile?: any;
  counts?: {
    education: number;
    experience: number;
    certificates: number;
    skills: number;
    projects: number;
  };
}): TrustResult {
  const p = input.profile ?? {};
  const c = input.counts ?? {
    education: 0,
    experience: 0,
    certificates: 0,
    skills: 0,
    projects: 0,
  };

  const signals: TrustSignal[] = [
    {
      label: "Identity",
      status:
        p.verification_status === "verified" || !!p.email ? "verified" : "pending",
      weight: 15,
    },
    {
      label: "Profile",
      status:
        p.full_name && p.about && (p.profile_picture_url || p.profile_photo_url)
          ? "verified"
          : "pending",
      weight: 10,
    },
    {
      label: "Education",
      status: c.education > 0 ? "verified" : "pending",
      weight: 15,
    },
    {
      label: "Experience",
      status: c.experience > 0 ? "verified" : "pending",
      weight: 20,
    },
    {
      label: "Certificates",
      status: c.certificates > 0 ? "verified" : "pending",
      weight: 15,
    },
    {
      label: "Skills",
      status: c.skills >= 3 ? "verified" : "pending",
      weight: 10,
    },
    {
      label: "Projects",
      status: c.projects > 0 ? "verified" : "pending",
      weight: 5,
    },
    {
      label: "Blockchain",
      status: "verified",
      weight: 10,
    },
  ];

  const score = signals.reduce(
    (sum, s) => sum + (s.status === "verified" ? s.weight : 0),
    0,
  );

  const verifiedCount = signals.filter((s) => s.status === "verified").length;
  const summary =
    score >= 90
      ? "Elite credibility. Employers can trust this passport at a glance."
      : score >= 70
        ? `Strong career identity. ${verifiedCount}/${signals.length} signals verified.`
        : score >= 40
          ? "Good foundation — add more credentials to unlock recruiter trust."
          : "Complete your passport to start earning trust with employers.";

  return { score, summary, signals };
}
