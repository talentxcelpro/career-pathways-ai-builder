import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Award,
  Briefcase,
  Wrench,
  FolderGit2,
  Globe,
  BookOpen,
  Trophy,
  ShieldCheck,
  Wallet,
  Share2,
  Building2,
} from "lucide-react";

import PassportOverview from "./sections/PassportOverview";
import PassportProfile from "./sections/PassportProfile";
import EducationTimeline from "./sections/EducationTimeline";
import CertificatesSection from "./sections/CertificatesSection";
import ExperienceSection from "./sections/ExperienceSection";
import VerificationDashboard from "./sections/VerificationDashboard";
import ComingSoonSection from "./sections/ComingSoonSection";
import CareerTimeline from "./sections/CareerTimeline";
import SharePassport from "./sections/SharePassport";
import RecruiterView from "./sections/RecruiterView";
import AICoach from "./sections/AICoach";
import WalletSection from "./sections/WalletSection";
import { Sparkles } from "lucide-react";

type SectionKey =
  | "overview"
  | "profile"
  | "timeline"
  | "education"
  | "certificates"
  | "experience"
  | "skills"
  | "projects"
  | "portfolio"
  | "research"
  | "awards"
  | "verification"
  | "coach"
  | "wallet"
  | "share"
  | "recruiter";

const NAV: {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
}[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: User },
  { key: "timeline", label: "Timeline", icon: Sparkles },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "skills", label: "Skills", icon: Wrench, soon: true },
  { key: "projects", label: "Projects", icon: FolderGit2, soon: true },
  { key: "portfolio", label: "Portfolio", icon: Globe, soon: true },
  { key: "research", label: "Research", icon: BookOpen, soon: true },
  { key: "awards", label: "Awards", icon: Trophy, soon: true },
  { key: "verification", label: "Verification", icon: ShieldCheck },
  { key: "coach", label: "AI Coach", icon: Sparkles },
  { key: "wallet", label: "Wallet", icon: Wallet, soon: true },
  { key: "share", label: "Share", icon: Share2 },
  { key: "recruiter", label: "Recruiter View", icon: Building2 },
];

const VALID = new Set(NAV.map((n) => n.key));

const PassportLayout: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const active = (section || "overview") as SectionKey;

  if (section && !VALID.has(section as SectionKey)) {
    return <Navigate to="/passport" replace />;
  }

  const renderSection = () => {
    switch (active) {
      case "overview":
        return <PassportOverview />;
      case "profile":
        return <PassportProfile />;
      case "timeline":
        return <CareerTimeline />;
      case "education":
        return <EducationTimeline />;
      case "certificates":
        return <CertificatesSection />;
      case "experience":
        return <ExperienceSection />;
      case "verification":
        return <VerificationDashboard />;
      case "coach":
        return <AICoach />;
      case "share":
        return <SharePassport />;
      case "recruiter":
        return <RecruiterView />;
      default:
        return (
          <ComingSoonSection
            title={NAV.find((n) => n.key === active)?.label ?? "Coming soon"}
          />
        );
    }
  };

  return (
    <PageShell width="xl" pad="md">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="mb-4">
            <p className="text-eyebrow text-muted-foreground">TalentXcel</p>
            <h2 className="text-title-2 tracking-tight text-foreground">
              Career Passport
            </h2>
          </div>
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((item) => {
              const isActive = item.key === active;
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={
                    item.key === "overview"
                      ? "/passport"
                      : `/passport/section/${item.key}`
                  }
                  className={cn(
                    "group flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors md:whitespace-normal md:rounded-lg md:px-3 md:py-2",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.soon && (
                    <span
                      className={cn(
                        "hidden rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide md:inline",
                        isActive
                          ? "bg-background/10 text-background/70"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{renderSection()}</main>
      </div>
    </PageShell>
  );
};

export default PassportLayout;
