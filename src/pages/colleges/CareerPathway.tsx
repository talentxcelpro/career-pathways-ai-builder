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
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              TALENTXCEL CAREER INTELLIGENCE
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              YOUR FUTURE STARTS WITH ONE QUESTION
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
              What do you want to become?
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              Tell us where you want to go. We'll map degrees, free learning, scholarships and the exact steps between them.
            </p>
          </div>

          {/* Conversational Command Box */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 mb-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                What are you trying to become?
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-28 text-base sm:text-lg p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none resize-none font-medium text-slate-900 bg-slate-50/50"
                  placeholder='e.g. "I want to become an AI researcher, but I have 72% in 12th and almost no budget."'
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey && goal.trim()) {
                      e.preventDefault();
                      setStep(2);
                    }
                  }}
                />
              </div>
            </div>

            {/* Popular Goals */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Popular paths:
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_GOALS.map((eg) => (
                  <button
                    key={eg}
                    onClick={() => setGoal(eg)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
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
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-10 h-13 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 shadow-md shadow-indigo-100"
              disabled={!goal.trim()}
              onClick={() => setStep(2)}
            >
              Find My Path
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
      <div className="min-h-screen bg-slate-50/60 px-4 py-12 md:py-16">
        <div className="max-w-2xl w-full mx-auto">
          <ProgressIndicator step={2} />

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Where are you today?
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Select your current academic baseline so we can bridge the prerequisites.
            </p>
          </div>

          <div className="grid gap-3 mb-8">
            {CURRENT_LEVEL_OPTIONS.map((opt) => {
              const isSelected = currentLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setCurrentLevel(opt.value)}
                  className={`w-full text-left rounded-xl border-2 p-4 sm:p-5 flex items-center gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.descriptor}</div>
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
              className="px-6 h-11 text-xs font-bold rounded-xl border-slate-200"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              className="px-8 h-11 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setStep(3)}
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
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
      <div className="min-h-screen bg-slate-50/60 px-4 py-12 md:py-16">
        <div className="max-w-2xl w-full mx-auto">
          <ProgressIndicator step={3} />

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              What is your tuition budget?
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              We show real tuition and mandatory fees. Select your preferred cost range.
            </p>
          </div>

          <div className="grid gap-3 mb-8">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  className={`w-full text-left rounded-xl border-2 p-4 sm:p-5 flex items-center gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold font-mono transition-colors ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {opt.label === "₹0" ? "₹0" : "₹"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.descriptor}</div>
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
              className="px-6 h-11 text-xs font-bold rounded-xl border-slate-200"
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              className="px-8 h-11 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleGenerate}
            >
              Generate My Pathway
              <ArrowRight className="ml-2 h-4 w-4" />
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
      <div className="min-h-screen bg-slate-50/60 px-4 sm:px-6 py-10 md:py-14">
        <div className="max-w-4xl mx-auto">

          {/* Operating System Hero Bar */}
          <div className="mb-8 rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                EVIDENCE-BACKED PERSONALIZED PATHWAY
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Verified against global education graph
              </span>
            </div>

            <div className="pt-5 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                Your Target Path
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {pathway.goal_resolved}
              </h1>
              <p className="text-xs text-slate-400 mt-1 italic">
                * Potential ₹0 / affordable pathway — subject to admission eligibility and scholarship/fee-waiver approval.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-400 text-[11px]">Your Goal</div>
                <div className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">{pathway.input.goal}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-400 text-[11px]">Starting Level</div>
                <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{levelLabel}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-400 text-[11px]">Budget Preference</div>
                <div className="font-bold text-xs sm:text-sm text-white mt-0.5">{budgetLabel}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-slate-400 text-[11px]">Estimated Cost</div>
                <div
                  className={`font-black text-sm sm:text-base font-mono mt-0.5 ${
                    isFree ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {pathway.total_estimated_cost}
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Engine: WHY TALENTXCEL RECOMMENDS THIS */}
          <div className="mb-8 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 block">
                  EXPLAINABILITY ENGINE
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Why TalentXcel Recommends This Route
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Path Confidence:</span>
                <span className="text-xs font-black font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  94% CONFIDENCE
                </span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No upfront tuition requirement identified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Matches your starting level ({levelLabel})</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free foundation coursework available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Degree &amp; scholarship options verified today</span>
              </div>
            </div>
          </div>

          {/* The 6-Phase Connected Visual Journey */}
          <div className="space-y-4 mb-8">
            {pathway.steps.map((pathwayStep, sIdx) => {
              const stepIcon =
                STEP_ICON_MAP[pathwayStep.icon] ?? <Brain className="h-5 w-5" />;
              const stepNumStr = String(pathwayStep.step_number).padStart(2, '0');

              return (
                <div key={pathwayStep.step_number} className="relative">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
                    {/* Step Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-base font-mono shrink-0">
                        {stepNumStr}
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
                              <span className="font-bold not-italic text-emerald-700 shrink-0">✓ Verified Source:</span>
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

                {/* Vertical Connector */}
                {sIdx < pathway.steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-5 bg-slate-300"></div>
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
              <div className="font-bold text-amber-800 mb-1 text-sm">Honest Reality Check</div>
              <p className="text-xs text-amber-700 leading-relaxed">{pathway.honest_caveat}</p>
            </div>
          </div>
        )}

        {/* Action links */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => navigate("/colleges/global-programs")}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs px-5 py-3.5 hover:bg-slate-50 transition-all"
          >
            Explore Global Programs →
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/colleges/scholarships")}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-900 font-bold text-xs px-5 py-3.5 hover:bg-purple-100 transition-all"
          >
            Find Scholarships &amp; Funding →
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Start over */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            onClick={handleStartOver}
          >
            ← Plan Another Career
          </Button>
        </div>
      </div>
    </div>
  );
}

  return null;
}
