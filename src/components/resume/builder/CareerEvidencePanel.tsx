import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink, 
  Award, 
  FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillEvidenceItem {
  skillName: string;
  status: 'VERIFIED' | 'CLAIMED' | 'UNVERIFIED';
  assessmentScore?: number;
  yearsExperience?: number;
  evidenceSource?: string;
}

interface CareerEvidencePanelProps {
  skills: string[];
  certifications?: Array<{ name: string; issuer?: string; date?: string }>;
  verifiedAttempts?: Array<{ skill_name: string; percentage?: number }>;
}

export const CareerEvidencePanel: React.FC<CareerEvidencePanelProps> = ({
  skills = [],
  certifications = [],
  verifiedAttempts = []
}) => {
  const navigate = useNavigate();

  const verifiedSkillMap = new Map<string, number>();
  verifiedAttempts.forEach(a => {
    if (a.skill_name) {
      verifiedSkillMap.set(a.skill_name.toLowerCase(), a.percentage || 80);
    }
  });

  const evidenceItems: SkillEvidenceItem[] = skills.map(skill => {
    const lower = skill.toLowerCase();
    if (verifiedSkillMap.has(lower)) {
      return {
        skillName: skill,
        status: 'VERIFIED',
        assessmentScore: verifiedSkillMap.get(lower),
        evidenceSource: 'Objective Skill Assessment'
      };
    }
    return {
      skillName: skill,
      status: 'CLAIMED',
      evidenceSource: 'Resume Career History'
    };
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <div>
              <CardTitle className="text-base font-bold text-foreground">Career Evidence Intelligence</CardTitle>
              <p className="text-xs text-muted-foreground">Private evidence correlation linking skills to verified assessments & career claims</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/tools/skill-assessment')} 
            size="sm" 
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Award className="w-3.5 h-3.5" />
            Take Skill Assessment
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Verified Skills</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {evidenceItems.filter(i => i.status === 'VERIFIED').length} / {skills.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Backed by objective assessment score</p>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Resume Claims</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {evidenceItems.filter(i => i.status === 'CLAIMED').length}
              </p>
              <p className="text-[11px] text-muted-foreground">Documented in career experience</p>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-1">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Certifications</span>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {certifications.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Formal professional licenses & certs</p>
            </div>
          </div>

          {/* Skill Evidence Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Verification & Evidence Breakdown</h4>
            <div className="divide-y border rounded-xl overflow-hidden bg-background">
              {evidenceItems.slice(0, 10).map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-foreground">{item.skillName}</span>
                      <p className="text-[11px] text-muted-foreground">{item.evidenceSource}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.status === 'VERIFIED' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold">
                        ✓ Verified {item.assessmentScore}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Resume Claim
                      </Badge>
                    )}

                    {item.status !== 'VERIFIED' && (
                      <Button 
                        onClick={() => navigate('/tools/skill-assessment')}
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 gap-1 font-semibold"
                      >
                        Verify Skill
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
