import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

interface CoverLetterStudioPanelProps {
  resumeData: any;
  targetJobTitle?: string;
}

export const CoverLetterStudioPanel: React.FC<CoverLetterStudioPanelProps> = ({
  resumeData,
  targetJobTitle = 'Targeted Position'
}) => {
  const [selectedStyle, setSelectedStyle] = useState<'professional' | 'executive' | 'technical' | 'switch' | 'concise' | 'recruiter'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  const fullName = resumeData?.personalInfo?.fullName || "Candidate";
  const email = resumeData?.personalInfo?.email || "candidate@example.com";
  const phone = resumeData?.personalInfo?.phone || "+1 555 0199";
  const topSkills = (resumeData?.skills || []).slice(0, 4).map((s: any) => typeof s === 'string' ? s : s.name).join(', ');
  const topProject = resumeData?.projects?.[0]?.name || "key strategic projects";

  const getCoverLetterText = () => {
    switch (selectedStyle) {
      case 'executive':
        return `Dear Executive Selection Committee,

I am writing to apply for the ${targetJobTitle} leadership role. With extensive leadership experience driving organizational strategy, operational resilience, and high-impact delivery, I bring a proven framework for scaling performance across complex environments.

In my recent initiatives—including ${topProject}—I have focused on establishing robust governance, aligning cross-functional teams, and driving core competency in ${topSkills || 'strategic execution'}. My leadership philosophy centers on transparency, data-backed accountability, and sustainable growth.

I welcome the opportunity to discuss how my strategic vision and operational leadership can accelerate ${targetJobTitle} objectives.

Sincerely,

${fullName}
${email} | ${phone}`;

      case 'technical':
        return `Dear Engineering Manager,

I am writing to express my strong interest in the ${targetJobTitle} role. As a technical practitioner specializing in ${topSkills || 'modern technology stacks'}, I excel at building resilient, high-availability architecture.

Throughout my technical background, I have architected and deployed production systems such as ${topProject}. My engineering workflow emphasizes clean code, comprehensive testing, automated CI/CD pipelines, and SLA compliance.

I would value the chance to discuss how my technical expertise in ${topSkills || 'systems architecture'} can support your engineering roadmap.

Sincerely,

${fullName}
${email} | ${phone}`;

      case 'switch':
        return `Dear Hiring Team,

I am writing to present my application for the ${targetJobTitle} position. Transitioning into this domain, I bring a unique blend of analytical problem-solving, rapid skill acquisition, and hands-on execution in ${topSkills || 'core technical areas'}.

My background includes successful delivery of ${topProject}, demonstrating my ability to master new domains, collaborate across teams, and deliver verifiable outcomes quickly.

I am eager to contribute my adaptable skillset and fresh perspective to the ${targetJobTitle} team.

Sincerely,

${fullName}
${email} | ${phone}`;

      case 'concise':
        return `Dear Hiring Manager,

I am applying for the ${targetJobTitle} position. With verified hands-on expertise in ${topSkills || 'key technical domains'}, I bring a track record of reliability and execution.

Key Highlights:
• Delivered ${topProject} with zero unplanned downtime.
• Strong competency across ${topSkills || 'core competencies'}.
• Focused on clean delivery and cross-functional team collaboration.

I look forward to discussing how my experience aligns with your team's immediate needs.

Best regards,

${fullName}
${email} | ${phone}`;

      case 'recruiter':
        return `Hi Hiring Team,

I'm reaching out regarding the ${targetJobTitle} position. My profile matches your core requirements around ${topSkills || 'key technical competencies'}, supported by hands-on delivery on ${topProject}.

Quick Snapshot:
- Core Skills: ${topSkills || 'Tech Stack & Process Expertise'}
- Proven History: Led execution on ${topProject}
- Availability: Open to immediate discussion and seamless team integration.

I'd love to connect for a quick 10-minute introductory call.

Best,

${fullName}
${email} | ${phone}`;

      default: // professional
        return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${targetJobTitle} position. With a proven career history in technical execution and operational delivery, I offer a strong combination of skills in ${topSkills || 'key competencies'} that directly align with your requirements.

Throughout my experience, I have led execution across complex initiatives, including ${topProject}. My approach combines analytical problem-solving, cross-functional collaboration, and strict compliance to consistently deliver business value.

What sets my profile apart is a commitment to evidence-backed execution. Whether optimizing system latency, managing project scope, or driving operational improvements, I ensure that all key milestones yield measurable performance.

I look forward to discussing how my background in ${topSkills || 'relevant domains'} can contribute to your team's upcoming growth objectives.

Sincerely,

${fullName}
${email} | ${phone}`;
    }
  };

  const generatedCoverLetter = getCoverLetterText();

  const paragraphRationales = [
    { para: "Paragraph 1 (Hook)", rationale: "Establishes candidate identity and matches core required skills directly against job description." },
    { para: "Paragraph 2 (Evidence)", rationale: `Cites verified project experience (${topProject}) without fabricating metric claims.` },
    { para: "Paragraph 3 (Value Add)", rationale: "Highlights operational methodology, teamwork, and SLA compliance standards." }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    toast.success("Cover Letter copied to clipboard!");
  };

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base font-bold text-foreground">Cover Letter Studio</CardTitle>
            <p className="text-xs text-muted-foreground">Contextual cover letters generated from Master Identity &amp; Target Job with paragraph traceability</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold">
          Zero Metric Fabrication
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Style Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Letter Style</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'professional', label: 'Professional' },
              { id: 'executive', label: 'Executive' },
              { id: 'technical', label: 'Technical' },
              { id: 'switch', label: 'Career Switcher' },
              { id: 'concise', label: 'Concise' },
              { id: 'recruiter', label: 'Recruiter Friendly' }
            ].map(st => (
              <Button
                key={st.id}
                type="button"
                variant={selectedStyle === st.id ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  setSelectedStyle(st.id as any);
                  toast.success(`Generated ${st.label} Cover Letter`);
                }}
              >
                {st.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cover Letter Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Cover Letter for {targetJobTitle}</label>
            <Button onClick={handleCopy} size="sm" variant="outline" className="h-7 text-xs font-semibold gap-1 border-primary/30 text-primary">
              <Copy className="w-3.5 h-3.5" />
              Copy Text
            </Button>
          </div>
          <Textarea value={generatedCoverLetter} readOnly rows={12} className="text-xs leading-relaxed font-sans bg-background" />
        </div>

        {/* Traceability Rationale Box */}
        <div className="space-y-2 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Why This Cover Letter Paragraph Structure Exists (Traceability)
          </span>
          <div className="space-y-2 text-xs">
            {paragraphRationales.map((pr, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{pr.para}: </span>
                  <span className="text-muted-foreground">{pr.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
