import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Briefcase,
  Award,
  BookOpen,
  Layers,
  User,
  Compass,
  Zap,
  Globe,
  Building2,
  Sparkles,
  Users,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExploreItem {
  to: string;
  label: string;
  desc: string;
  icon: React.ElementType;
}

export interface ExploreGroup {
  label: string;
  color: string;
  textColor: string;
  badge?: string;
  items: ExploreItem[];
}

export const EXPLORE_GROUPS: ExploreGroup[] = [
  {
    label: "Find a Job",
    color: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-600 dark:text-blue-400",
    badge: "Careers",
    items: [
      { to: "/jobs",             label: "Browse Jobs",          desc: "Millions of live opportunities",       icon: Briefcase },
      { to: "/government-jobs",  label: "Government Jobs",      desc: "PSU, UPSC & state roles",             icon: Award },
      { to: "/resume/ats-check", label: "ATS Resume Check",     desc: "SI-powered resume score",             icon: BookOpen },
      { to: "/jobs/applied",     label: "My Applications",      desc: "Track your active applications",      icon: Layers },
    ],
  },
  {
    label: "Build My Career",
    color: "text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
    badge: "Intelligence",
    items: [
      { to: "/passport",   label: "Career Passport",    desc: "Universal profile & TalentScore", icon: User },
      { to: "/career-map", label: "Career Map",         desc: "Skill progression trajectories",  icon: Compass },
      { to: "/learning",   label: "Learning & Skills",  desc: "High-income credentials",         icon: Zap },
      { to: "/rankings",   label: "Salary & Rankings",  desc: "Compensation benchmarks",         icon: Award },
      { to: "/colleges",   label: "10,250+ Colleges",   desc: "NIRF rankings & placement stats", icon: Globe },
      { to: "/companies",  label: "Companies",          desc: "Explore verified employer pages", icon: Building2 },
    ],
  },
  {
    label: "Hire Talent",
    color: "text-purple-600 dark:text-purple-400",
    textColor: "text-purple-600 dark:text-purple-400",
    badge: "Enterprise",
    items: [
      { to: "/recruiters",          label: "Recruiter OS",          desc: "SI-powered hiring intelligence",  icon: Sparkles },
      { to: "/talent",              label: "Talent Discovery",       desc: "Search verified candidate pool", icon: Users },
      { to: "/hire",                label: "Post a Job",             desc: "Reach qualified candidates fast", icon: Briefcase },
      { to: "/dashboard?view=role", label: "Employer Dashboard",     desc: "Requirements, matches & pipeline", icon: Layers },
    ],
  },
];

interface ExploreNavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExploreNavigationDrawer: React.FC<ExploreNavigationDrawerProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleSelect = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-4 w-[90%] max-w-sm sm:max-w-md overflow-y-auto z-[100] bg-white dark:bg-slate-950 text-foreground border-l border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <SheetHeader className="mb-4 text-left border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <SheetTitle className="text-sm font-black flex items-center justify-between uppercase tracking-wider text-foreground">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Compass className="h-4 w-4" />
              </div>
              <span>Explore TalentXcel</span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
              Ecosystem
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {EXPLORE_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
                <p className={cn("text-[11px] font-black uppercase tracking-wider", group.color)}>
                  {group.label}
                </p>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {group.items.length} tools
                </span>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelect(item.to)}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-all group active:scale-[0.99] cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400 transition-colors shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-800/60">
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.label}
                          </p>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
