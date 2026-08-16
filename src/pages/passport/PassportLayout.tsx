import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileSidebarNav } from "@/components/navigation/ProfileSidebarNav";
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
  Sparkles
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
  { key: "wallet", label: "Wallet", icon: Wallet },
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

  // When viewing Overview (/passport), render the full-screen hyper-premium Career Passport dashboard with Left Desktop Sidebar Nav!
  if (active === "overview") {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-background">
        <div className="max-w-7xl mx-auto flex items-start">
          <ProfileSidebarNav />
          <div className="flex-1 min-w-0 px-4 md:px-6 py-6">
            <PassportOverview />
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (active) {
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
      case "wallet":
        return <WalletSection />;
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <div className="max-w-7xl mx-auto flex items-start">
        <ProfileSidebarNav />
        <div className="flex-1 min-w-0 px-4 md:px-6 py-6">
          <PageShell width="xl" pad="none">
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
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.soon && (
                          <span className="ml-auto text-[10px] uppercase font-bold text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </aside>

              <main>{renderSection()}</main>
            </div>
          </PageShell>
        </div>
      </div>
    </div>
  );
};

export default PassportLayout;
