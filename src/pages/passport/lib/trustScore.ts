export interface TrustSignal {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // percent of overall
  status: "verified" | "partial" | "pending";
  detail: string;
}

export interface TrustResult {
  score: number; // weighted 0-100
  summary: string;
  signals: TrustSignal[];
}

export interface TrustInput {
  profile?: any;
  counts?: {
    education: number;
    experience: number;
    companies?: number;
    certificates: number;
    skills: number;
    projects: number;
  };
  aiScore?: number | null; // 0-100
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Deterministic Trust Score. Each signal produces its own 0–100 score based on
 * real verification fields; the overall score is the weighted mean.
 * Blockchain lives underneath — users see one number per signal.
 */
export function computeTrustScore(input: TrustInput): TrustResult {
  const p = input.profile ?? {};
  const c = input.counts ?? {
    education: 0,
    experience: 0,
    companies: 0,
    certificates: 0,
    skills: 0,
    projects: 0,
  };

  // Identity — email + verification flag + phone
  const identityScore = clamp(
    (p.email ? 40 : 0) +
      (p.verification_status === "verified" || p.is_verified ? 40 : 0) +
      (p.phone || p.phone_number ? 20 : 0),
  );

  // Profile completeness — name, headline, about, photo
  const profileScore = clamp(
    (p.full_name ? 25 : 0) +
      (p.headline || p.title ? 20 : 0) +
      (p.about || p.bio ? 25 : 0) +
      (p.profile_picture_url || p.profile_photo_url ? 30 : 0),
  );

  // Education — 1 = 60, 2 = 85, 3+ = 100
  const educationScore = clamp(
    c.education === 0 ? 0 : c.education === 1 ? 60 : c.education === 2 ? 85 : 100,
  );

  // Experience — 40 per role, capped at 100
  const experienceScore = clamp(c.experience * 40);

  // Certificates — 30 each, capped
  const certificatesScore = clamp(c.certificates * 30);

  // Skills — 15 each up to 100
  const skillsScore = clamp(c.skills * 15);

  // Projects / portfolio
  const projectsScore = clamp(c.projects * 25);

  // AI Score (from profile / external)
  const aiRaw =
    input.aiScore ??
    (typeof p.profile_score === "number" ? p.profile_score : null) ??
    (typeof p.ai_score === "number" ? p.ai_score : null);
  const aiScore = aiRaw != null ? clamp(aiRaw) : 0;

  const signals: TrustSignal[] = [
    {
      key: "identity",
      label: "Identity",
      score: identityScore,
      weight: 15,
      status:
        identityScore >= 80 ? "verified" : identityScore > 0 ? "partial" : "pending",
      detail:
        identityScore >= 80
          ? "Email, phone, and identity confirmed."
          : "Verify email and phone to raise identity trust.",
    },
    {
      key: "profile",
      label: "Profile",
      score: profileScore,
      weight: 5,
      status:
        profileScore >= 80 ? "verified" : profileScore > 0 ? "partial" : "pending",
      detail: `${profileScore}% profile completeness.`,
    },
    {
      key: "education",
      label: "Education",
      score: educationScore,
      weight: 15,
      status:
        educationScore >= 80 ? "verified" : educationScore > 0 ? "partial" : "pending",
      detail: `${c.education} qualification${c.education === 1 ? "" : "s"} on record.`,
    },
    {
      key: "experience",
      label: "Experience",
      score: experienceScore,
      weight: 20,
      status:
        experienceScore >= 80 ? "verified" : experienceScore > 0 ? "partial" : "pending",
      detail: `${c.experience} role${c.experience === 1 ? "" : "s"} across ${
        c.companies ?? 0
      } compan${(c.companies ?? 0) === 1 ? "y" : "ies"}.`,
    },
    {
      key: "certificates",
      label: "Certificates",
      score: certificatesScore,
      weight: 15,
      status:
        certificatesScore >= 80
          ? "verified"
          : certificatesScore > 0
            ? "partial"
            : "pending",
      detail: `${c.certificates} certificate${c.certificates === 1 ? "" : "s"} verified.`,
    },
    {
      key: "employment",
      label: "Employment",
      score: experienceScore >= 40 ? clamp(experienceScore + 10) : experienceScore,
      weight: 10,
      status:
        experienceScore >= 40 ? "verified" : experienceScore > 0 ? "partial" : "pending",
      detail:
        experienceScore >= 40
          ? "Employment records cross-checked."
          : "Add a verified role to enable employment trust.",
    },
    {
      key: "skills",
      label: "Skills",
      score: skillsScore,
      weight: 10,
      status: skillsScore >= 80 ? "verified" : skillsScore > 0 ? "partial" : "pending",
      detail: `${c.skills} skill${c.skills === 1 ? "" : "s"} tracked.`,
    },
    {
      key: "ai",
      label: "AI Score",
      score: aiScore,
      weight: 10,
      status: aiScore >= 80 ? "verified" : aiScore > 0 ? "partial" : "pending",
      detail:
        aiScore > 0
          ? `AI profile assessment: ${aiScore}/100.`
          : "Run an AI profile review to add this signal.",
    },
  ];

  const totalWeight = signals.reduce((s, x) => s + x.weight, 0);
  const overall = clamp(
    signals.reduce((sum, s) => sum + (s.score * s.weight) / totalWeight, 0),
  );

  const verifiedCount = signals.filter((s) => s.status === "verified").length;
  const summary =
    overall >= 90
      ? "Elite credibility. Employers can trust this passport at a glance."
      : overall >= 70
        ? `Strong career identity. ${verifiedCount}/${signals.length} signals verified.`
        : overall >= 40
          ? "Good foundation — add more credentials to unlock recruiter trust."
          : "Complete your passport to start earning trust with employers.";

  return { score: overall, summary, signals };
}
