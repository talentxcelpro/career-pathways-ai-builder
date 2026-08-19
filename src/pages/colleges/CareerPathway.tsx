// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — CareerPathway.tsx
// THE STAR feature: 3-step wizard → AI-generated education pathway
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  School,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generatePathway } from "@/services/globalEducationService";
import type {
  PathwayInput,
  EducationPathway,
  CurrentLevel,
  EducationBudget,
} from "@/types/globalEducation";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const EXAMPLE_GOALS = [
  "AI Researcher",
  "Doctor",
  "Software Engineer",
  "Architect",
  "Data Scientist",
  "Teacher",
  "Cybersecurity Specialist",
  "Financial Analyst",
  "UI/UX Designer",
  "HR Analytics Specialist",
];

type LevelOption = {
  value: CurrentLevel;
  label: string;
  descriptor: string;
  icon: React.ReactNode;
};

const CURRENT_LEVEL_OPTIONS: LevelOption[] = [
  {
    value: "10th",
    label: "10th Grade",
    descriptor: "Currently in secondary school",
    icon: <School className="h-7 w-7" />,
  },
  {
    value: "12th",
    label: "12th Grade",
    descriptor: "Completed or currently in higher secondary",
    icon: <BookOpen className="h-7 w-7" />,
  },
  {
    value: "bachelor",
    label: "Bachelor's Degree",
    descriptor: "Graduated or enrolled in undergraduate",
    icon: <GraduationCap className="h-7 w-7" />,
  },
  {
    value: "master",
    label: "Master's Degree",
    descriptor: "Completed or pursuing postgraduate studies",
    icon: <Award className="h-7 w-7" />,
  },
  {
    value: "working",
    label: "Working Professional",
    descriptor: "Currently employed, seeking career growth",
    icon: <Briefcase className="h-7 w-7" />,
  },
];

type BudgetOption = {
  value: EducationBudget;
  label: string;
  descriptor: string;
};

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    value: "ZERO",
    label: "₹0",
    descriptor: "Find fully free or fully funded pathways",
  },
  {
    value: "UNDER_50K",
    label: "Under ₹50,000",
    descriptor: "Low-cost with scholarship options",
  },
  {
    value: "UNDER_2L",
    label: "₹50K – ₹2 Lakh",
    descriptor: "Affordable international programs",
  },
  {
    value: "FLEXIBLE",
    label: "Flexible",
    descriptor: "Show all options",
  },
];

// Map icon string from PathwayStep to lucide component
const STEP_ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS TYPE BADGE
// ─────────────────────────────────────────────────────────────────────────────

function AccessTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    FULLY_FUNDED: {
      label: "Fully Funded",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    TUITION_FREE: {
      label: "Tuition Free",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    SCHOLARSHIP_MAKES_IT_FREE: {
      label: "Scholarship = Free",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    FREE_TO_LEARN_PAID_CREDENTIAL: {
      label: "Free to Learn",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
  };

  const config = configs[type];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function CourseAccessBadge({ type }: { type?: string }) {
  if (!type) return null;
  const configs: Record<string, { label: string; className: string; icon: string }> = {
    FREE_TO_LEARN: {
      label: "🟢 Free to Learn (₹0)",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "🟢"
    },
    FREE_WITH_LIMITATIONS: {
      label: "🔵 Free with Limitations",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: "🔵"
    },
    PAID_CREDENTIAL: {
      label: "🟡 Free Audit / Paid Cert",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "🟡"
    },
    PAID: {
      label: "🔴 Paid Access",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: "🔴"
    }
  };

  const config = configs[type];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEM TYPE BADGE
// ─────────────────────────────────────────────────────────────────────────────

function ItemTypeBadge({ type, academicCredits }: { type: string; academicCredits?: boolean }) {
  const configs: Record<string, { label: string; className: string }> = {
    course: { label: "Course (Non-Credit)", className: "bg-sky-100 text-sky-700" },
    program: { label: academicCredits !== false ? "Degree Program (Accredited)" : "Program", className: "bg-indigo-100 text-indigo-700" },
    scholarship: { label: "Scholarship & Grant", className: "bg-green-100 text-green-700" },
    exam: { label: "Standardized Exam", className: "bg-orange-100 text-orange-700" },
    action: { label: "Action Step", className: "bg-gray-100 text-gray-700" },
    resource: { label: "Resource", className: "bg-teal-100 text-teal-700" },
  };

  const config = configs[type] ?? { label: type, className: "bg-gray-100 text-gray-700" };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function ProgressIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  if (step === 4) return null;

  const steps = [
    { n: 1, label: "Your Goal" },
    { n: 2, label: "Your Level" },
    { n: 3, label: "Your Budget" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((s, idx) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
              step > s.n
                ? "bg-emerald-500 text-white"
                : step === s.n
                ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step > s.n ? "✓" : s.n}
          </div>
          <span
            className={`text-sm font-medium hidden sm:block ${
              step === s.n ? "text-indigo-700" : "text-gray-400"
            }`}
          >
            {s.label}
          </span>
          {idx < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CareerPathway() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goal, setGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel | null>(null);
  const [budget, setBudget] = useState<EducationBudget | null>(null);
  const [pathway, setPathway] = useState<EducationPathway | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!currentLevel || !budget) return;

    setIsGenerating(true);
    try {
      const input: PathwayInput = {
        goal,
        current_level: currentLevel,
        budget,
      };
      const result = await generatePathway(input);
      setPathway(result);
      setStep(4);
    } catch (err) {
      console.error("Pathway generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setGoal("");
    setCurrentLevel(null);
    setBudget(null);
    setPathway(null);
  };

  const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === budget)?.label ?? "";
  const levelLabel = CURRENT_LEVEL_OPTIONS.find((l) => l.value === currentLevel)?.label ?? "";

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Goal
  // ─────────────────────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="max-w-2xl w-full mx-auto">
          <ProgressIndicator step={1} />

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              AI EDUCATION INTELLIGENCE
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              What do you want to become?
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              We'll build the evidence-backed education path to get you there — including verified ₹0 and funded options.
            </p>
          </div>

          {/* Ambition Command Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                ✨ Tell TalentXcel your ambition
              </label>
              <div className="relative">
                <Input
                  className="h-16 text-base sm:text-lg pl-5 pr-14 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 shadow-none font-medium text-slate-900 bg-slate-50/50"
                  placeholder="e.g. AI Researcher, Software Engineer, Doctor..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && goal.trim()) setStep(2);
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30"
                  disabled={!goal.trim()}
                  onClick={() => setStep(2)}
                  aria-label="Proceed to next step"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Popular Goals */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2.5">Popular goals:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_GOALS.map((eg) => (
                  <button
                    key={eg}
                    onClick={() => setGoal(eg)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      goal === eg
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200/80 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40"
                    }`}
                  >
                    {eg}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversational Prompt Option */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 block mb-2 italic">
                Or describe your situation in your own words:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGoal("AI Researcher with no tuition budget")}
                  className="text-xs text-slate-600 bg-slate-100/70 hover:bg-slate-200/70 rounded-lg px-2.5 py-1 text-left"
                >
                  "I want to work in AI but I have no money for college"
                </button>
                <button
                  onClick={() => setGoal("Self-taught Software Engineer from school")}
                  className="text-xs text-slate-600 bg-slate-100/70 hover:bg-slate-200/70 rounded-lg px-2.5 py-1 text-left"
                >
                  "I have 70% in 12th; what can I study?"
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-10 h-13 text-sm font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 shadow-md shadow-indigo-200"
              disabled={!goal.trim()}
              onClick={() => setStep(2)}
            >
              Build My Pathway
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Current Level
  // ─────────────────────────────────────────────────────────────────────────

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
        <div className="max-w-3xl w-full mx-auto">
          <ProgressIndicator step={2} />

          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
              Where are you now?
            </h1>
            <p className="text-lg text-gray-500">
              Select your current education level so we can map the right path.
            </p>
          </div>

          <div className="grid gap-3 mb-10">
            {CURRENT_LEVEL_OPTIONS.map((opt) => {
              const isSelected = currentLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setCurrentLevel(opt.value)}
                  className={`w-full text-left rounded-2xl border-2 p-5 flex items-center gap-5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl transition-colors ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{opt.descriptor}</div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="lg"
              className="px-8 h-12 rounded-2xl"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              className="px-10 h-12 text-base font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
              disabled={!currentLevel}
              onClick={() => setStep(3)}
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3 — Budget
  // ─────────────────────────────────────────────────────────────────────────

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-16">
        <div className="max-w-3xl w-full mx-auto">
          <ProgressIndicator step={3} />

          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
              What's your budget for education?
            </h1>
            <p className="text-lg text-gray-500">
              We'll find the best pathways within your means.
            </p>
          </div>

          <div className="grid gap-3 mb-6">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  className={`w-full text-left rounded-2xl border-2 p-5 flex items-center gap-5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl transition-colors font-bold text-lg ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    ₹
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xl text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{opt.descriptor}</div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-gray-400 text-center mb-10">
            We show <span className="font-semibold text-gray-600">REAL costs</span>. ₹0 options require qualifying for a competitive scholarship.
          </p>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="lg"
              className="px-8 h-12 rounded-2xl"
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              className="px-10 h-12 text-base font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
              disabled={!budget || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Pathway →
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — Result
  // ─────────────────────────────────────────────────────────────────────────

  if (step === 4 && pathway) {
    const isFree =
      pathway.total_estimated_cost === "₹0" ||
      pathway.total_estimated_cost === "$0";

    return (
      <div className="min-h-screen bg-slate-50/60 px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">

          {/* Operating System Hero Bar */}
          <div className="mb-10 rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                EVIDENCE-BACKED PERSONALIZED PATHWAY
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Verified against global education graph
              </span>
            </div>

            <div className="pt-6 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                Target Ambition
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {pathway.goal_resolved}
              </h1>
              <p className="text-xs text-slate-400 mt-1 italic">
                * Potential ₹0 / affordable pathway — subject to admission eligibility and scholarship/fee-waiver approval.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <div className="text-slate-400 text-xs font-medium">Your Goal</div>
                <div className="font-bold text-sm text-white truncate mt-0.5">{pathway.input.goal}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <div className="text-slate-400 text-xs font-medium">Starting Level</div>
                <div className="font-bold text-sm text-white mt-0.5">{levelLabel}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <div className="text-slate-400 text-xs font-medium">Budget Preference</div>
                <div className="font-bold text-sm text-white mt-0.5">{budgetLabel}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
                <div className="text-slate-400 text-xs font-medium">Est. Net Cost</div>
                <div
                  className={`font-black text-base mt-0.5 ${
                    isFree ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {pathway.total_estimated_cost}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {pathway.skills_required.length > 0 && (
            <div className="mb-10 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Core Competencies You Will Build
              </h3>
              <div className="flex flex-wrap gap-2">
                {pathway.skills_required.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step Cards with 2-Digit Numeric Hierarchy */}
          <div className="space-y-6 mb-10">
            {pathway.steps.map((pathwayStep) => {
              const stepIcon =
                STEP_ICON_MAP[pathwayStep.icon] ?? <Brain className="h-5 w-5" />;
              const stepNumStr = String(pathwayStep.step_number).padStart(2, '0');

              return (
                <div
                  key={pathwayStep.step_number}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8"
                >
                  {/* Step Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center font-black text-lg font-mono">
                        {stepNumStr}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-indigo-600">{stepIcon}</span>
                        <h3 className="text-xl font-bold text-slate-900">
                          {pathwayStep.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{pathwayStep.description}</p>

                      {(pathwayStep.estimated_duration || pathwayStep.cost_estimate) && (
                        <div className="flex flex-wrap gap-3 mt-2.5">
                          {pathwayStep.estimated_duration && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              ⏱ {pathwayStep.estimated_duration}
                            </span>
                          )}
                          {pathwayStep.cost_estimate && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/50">
                              💰 {pathwayStep.cost_estimate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Items */}
                  {pathwayStep.items.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {pathwayStep.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <ItemTypeBadge type={item.type} academicCredits={item.academic_credits_awarded} />
                                {item.access_type && (
                                  <AccessTypeBadge type={item.access_type} />
                                )}
                                {item.course_access_type && (
                                  <CourseAccessBadge type={item.course_access_type} />
                                )}
                              </div>
                              <div className="font-bold text-sm sm:text-base text-slate-900">
                                {item.title}
                              </div>
                              {item.provider && (
                                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                                  {item.provider}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {item.cost !== undefined && (
                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    item.is_free
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {item.is_free ? "₹0 Tuition / Free" : item.cost}
                                </span>
                              )}
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm"
                                  aria-label={`Open ${item.title} in new tab`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Transparent Evidence Snippet */}
                          {item.evidence_snippet && (
                            <div className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-xl p-3 italic flex items-start gap-2 shadow-2xs">
                              <span className="font-bold not-italic text-emerald-700 shrink-0">✓ Verified Citation:</span>
                              <span>"{item.evidence_snippet}"</span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="text-xs text-slate-500 italic">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Honest caveat */}
          {pathway.honest_caveat && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800 mb-1">Honest Reality Check</div>
                <p className="text-sm text-amber-700">{pathway.honest_caveat}</p>
              </div>
            </div>
          )}

          {/* Action links */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => navigate("/colleges/global-programs")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white text-indigo-700 font-semibold px-6 py-4 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
            >
              Explore Global Programs →
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/colleges/scholarships")}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white text-emerald-700 font-semibold px-6 py-4 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
            >
              Find Scholarships →
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Start over */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
              onClick={handleStartOver}
            >
              ← Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
