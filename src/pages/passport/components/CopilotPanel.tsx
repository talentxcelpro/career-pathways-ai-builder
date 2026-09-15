import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedAuth } from "@/contexts/OptimizedAuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Loader2, Send, Sparkles } from "lucide-react";

interface Props {
  section: "overview" | "profile" | "education" | "certificates" | "experience" | "verification" | "skills" | "wallet";
  title?: string;
  suggestions?: string[];
}

type CitationSection =
  | "profile"
  | "education"
  | "experience"
  | "skills"
  | "certificates"
  | "verification"
  | "wallet";

interface Citation {
  section: CitationSection;
  field: string;
  value?: string;
}

const SECTION_ROUTE: Record<CitationSection, string> = {
  profile: "/passport/section/profile",
  education: "/passport/section/education",
  experience: "/passport/section/experience",
  skills: "/passport/section/skills",
  certificates: "/passport/section/certificates",
  verification: "/passport/section/verification",
  wallet: "/passport/section/wallet",
};

const SECTION_LABEL: Record<CitationSection, string> = {
  profile: "Profile",
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  certificates: "Certificates",
  verification: "Verification",
  wallet: "Wallet",
};

const DEFAULT_SUGGESTIONS: Record<Props["section"], string[]> = {
  overview: [
    "What is my biggest gap right now?",
    "How do I raise my Trust Score to 90?",
  ],
  profile: [
    "What's missing from my profile?",
    "How can I make my headline stronger?",
  ],
  education: [
    "Which certifications complement my degree?",
    "What learning path should I take next?",
  ],
  certificates: [
    "Which certificates would recruiters value most?",
    "What's the fastest way to add 2 more verified certificates?",
  ],
  experience: [
    "How do I frame my experience for senior roles?",
    "What skills am I missing based on my job history?",
  ],
  verification: [
    "How do I raise my Trust Score fastest?",
    "Which signals are dragging my Trust Score down?",
  ],
  skills: [
    "Which skills should I learn next for my target role?",
    "What are my most in-demand skills?",
  ],
  wallet: [
    "Which credentials should I highlight to recruiters?",
    "What's missing from my wallet for a strong profile?",
  ],
};

/** Deterministic citations: derived from the actual passport data we sent. */
const buildCitations = (
  profileData: any,
  section: Props["section"],
): Citation[] => {
  const citations: Citation[] = [];
  const push = (c: Citation) => {
    if (citations.length < 6) citations.push(c);
  };

  const p = profileData?.profile;
  if (p) {
    if (p.headline) push({ section: "profile", field: "Headline", value: p.headline });
    if (p.title) push({ section: "profile", field: "Title", value: p.title });
    if (p.location) push({ section: "profile", field: "Location", value: p.location });
  }

  const edu = profileData?.education ?? [];
  if (edu.length && (section === "education" || section === "overview" || section === "verification")) {
    const e = edu[0];
    push({
      section: "education",
      field: "Degree",
      value: [e.degree, e.institution].filter(Boolean).join(" · "),
    });
  }

  const exp = profileData?.experience ?? [];
  if (exp.length && section !== "education") {
    const e = exp[0];
    push({
      section: "experience",
      field: "Latest role",
      value: [e.job_title || e.title, e.company].filter(Boolean).join(" · "),
    });
  }

  const skills = profileData?.skills ?? [];
  if (skills.length) {
    push({
      section: "skills",
      field: `${skills.length} skill${skills.length === 1 ? "" : "s"}`,
      value: skills
        .slice(0, 3)
        .map((s: any) => s.skill_name)
        .filter(Boolean)
        .join(", "),
    });
  }

  const certs = profileData?.certificates ?? [];
  if (certs.length) {
    push({
      section: "certificates",
      field: `${certs.length} certification${certs.length === 1 ? "" : "s"}`,
      value: certs
        .slice(0, 2)
        .map((c: any) => c.skill_name)
        .filter(Boolean)
        .join(", "),
    });
  }

  return citations;
};

const CopilotPanel: React.FC<Props> = ({ section, title = "Ask your Career Copilot", suggestions }) => {
  const { user } = useOptimizedAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);

  const prompts = suggestions ?? DEFAULT_SUGGESTIONS[section];

  const { data: profileData } = useQuery({
    queryKey: ["copilot-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profile, edu, exp, skills, certs] = await Promise.all([
        supabase.from("profiles").select("full_name, headline, title, about, location").eq("id", uid).maybeSingle(),
        supabase.from("education").select("degree, institution, field_of_study").eq("user_id", uid),
        supabase.from("work_experience").select("job_title, title, company, description, start_date, end_date, is_current").eq("user_id", uid),
        supabase.from("user_skills").select("skill_name").eq("user_id", uid),
        supabase.from("skill_certifications").select("skill_name, issuer").eq("user_id", uid),
      ]);
      return {
        profile: profile.data,
        education: edu.data ?? [],
        experience: exp.data ?? [],
        skills: skills.data ?? [],
        certificates: certs.data ?? [],
      };
    },
  });

  const ask = useMutation({
    mutationFn: async (q: string) => {
      const { data, error } = await supabase.functions.invoke("passport-ai-coach", {
        body: {
          goal: `Context: user is viewing the ${section} section of their Career Passport. Question: ${q}`,
          profile: profileData,
        },
      });
      if (error) throw error;
      return data as {
        summary: string;
        missing_skills?: { skill: string }[];
        citations?: Citation[];
      };
    },
    onSuccess: (r) => {
      const skills = r.missing_skills?.slice(0, 3).map((s) => s.skill).join(", ");
      setAnswer(skills ? `${r.summary}\n\nFocus on: ${skills}.` : r.summary);
      // Prefer citations returned by the coach; fall back to deterministic ones from the data we sent.
      const remote = (r.citations ?? []).filter((c) => c && SECTION_ROUTE[c.section]);
      setCitations(remote.length ? remote : buildCitations(profileData, section));
    },
  });

  const submit = (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    setAnswer(null);
    setCitations([]);
    ask.mutate(q);
  };

  return (
    <Card className="border-border/60 bg-muted/20 p-5 md:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-eyebrow text-muted-foreground">Career Copilot</p>
          <h3 className="text-title-3 text-foreground">{title}</h3>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => submit(p)}
            disabled={ask.isPending}
            className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="mt-4 flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your passport…"
          className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button size="sm" type="submit" disabled={ask.isPending || !question.trim()}>
          {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {ask.isError && (
        <p className="mt-3 text-sm text-destructive">
          Copilot is unavailable right now. Try again in a moment.
        </p>
      )}

      {answer && (
        <div className="mt-4 rounded-xl border border-border/60 bg-background p-4">
          <Badge variant="secondary" className="rounded-full">Copilot</Badge>
          <p className="mt-3 whitespace-pre-line text-body text-foreground">{answer}</p>

          {citations.length > 0 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="text-eyebrow text-muted-foreground">
                Based on {citations.length} passport field
                {citations.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {citations.map((c, i) => (
                  <li key={`${c.section}-${c.field}-${i}`}>
                    <Link
                      to={SECTION_ROUTE[c.section]}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                      title={c.value ? `${c.field}: ${c.value}` : c.field}
                    >
                      <span className="font-medium text-foreground">
                        {SECTION_LABEL[c.section]}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="truncate max-w-[180px]">{c.field}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CopilotPanel;
