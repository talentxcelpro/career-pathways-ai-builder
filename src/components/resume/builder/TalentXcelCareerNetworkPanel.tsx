import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCheck, 
  Users, 
  Search, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Building2, 
  Radio, 
  Share2, 
  TrendingUp, 
  MessageSquare,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface TalentXcelCareerNetworkPanelProps {
  resumeData: any;
  onUpdateOpportunities?: (opportunitiesData: any) => void;
}

export const TalentXcelCareerNetworkPanel: React.FC<TalentXcelCareerNetworkPanelProps> = ({
  resumeData,
  onUpdateOpportunities
}) => {
  const [subTab, setSubTab] = useState('profile');
  const [openStatus, setOpenStatus] = useState<'actively' | 'open' | 'not_looking'>('open');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 30 Days');
  const [expectedSalary, setExpectedSalary] = useState('$120,000 - $140,000');

  // Compute discoverability scores from real resumeData — no hardcoded values
  const skillCount = (resumeData?.skills || []).length;
  const expCount = (resumeData?.experience || []).length;
  const certCount = (resumeData?.certifications || []).length;
  const projCount = (resumeData?.projects || []).length;
  const hasSummary = (resumeData?.personalInfo?.summary || '').length > 80;
  const hasName = !!(resumeData?.personalInfo?.fullName);
  const hasEmail = !!(resumeData?.personalInfo?.email);

  // Recruiter searchability: headline + skills completeness
  const recruiterSearchability = Math.min(100, Math.max(0, Math.round(
    hasName && hasSummary && skillCount >= 5
      ? 60 + (skillCount * 2) + (hasSummary ? 15 : 0)
      : hasName ? 30 + (skillCount * 3) : 0
  )));

  // Skill searchability: proportion of skills vs ideal (15)
  const skillSearchability = skillCount === 0 ? 0 : Math.min(100, Math.max(0, Math.round((skillCount / 15) * 100)));

  // Job matchability: needs summary + experience + skills
  const jobMatchability = Math.min(100, Math.max(0, Math.round(
    hasSummary && expCount > 0 && skillCount > 3
      ? 50 + expCount * 5 + skillCount * 2
      : hasSummary ? 40 : expCount > 0 ? 30 : 0
  )));

  // Evidence coverage: certs + projects
  const evidenceCoverage = certCount === 0 && projCount === 0
    ? 0
    : Math.min(100, Math.max(0, (certCount * 15) + (projCount * 12)));

  // Profile completeness: field presence (constrained 0 to 100)
  const completedFields = [
    hasName, hasEmail, hasSummary, expCount > 0, skillCount > 0,
    (resumeData?.education || []).length > 0
  ].filter(Boolean).length;
  const profileCompletenessScore = Math.min(100, Math.max(0, Math.round((completedFields / 6) * 100)));

  // Real projects from canonical data
  const realProjects = resumeData?.projects || [];

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            TX
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">TalentXcel Career &amp; Network Profile</CardTitle>
            <p className="text-xs text-muted-foreground">3rd Primary Professional Identity Surface (Career + Network + Discoverability + Evidence)</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
          Live Career Operating Layer
        </Badge>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
          <TabsList className="w-full justify-start bg-muted/30 p-1 border border-border/50 rounded-lg mb-6 overflow-x-auto">
            <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5 py-1.5 px-3">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs font-semibold gap-1.5 py-1.5 px-3">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Network
            </TabsTrigger>
            <TabsTrigger value="discoverability" className="text-xs font-semibold gap-1.5 py-1.5 px-3">
              <Search className="w-3.5 h-3.5 text-amber-500" />
              Discoverability
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="text-xs font-semibold gap-1.5 py-1.5 px-3">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              Open to Opportunities
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs font-semibold gap-1.5 py-1.5 px-3">
              <Share2 className="w-3.5 h-3.5 text-purple-500" />
              Posts &amp; Project Cards
            </TabsTrigger>
          </TabsList>

          {/* SUB-TAB 1: PROFILE */}
          <TabsContent value="profile" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Profile Strength</span>
                {profileCompletenessScore > 0 ? (
                  <>
                    <p className="text-lg font-bold text-primary">{profileCompletenessScore}%</p>
                    <Progress value={profileCompletenessScore} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">{completedFields} of 6 core sections complete</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Add career information to measure</p>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Career Skill Depth</span>
                {skillSearchability > 0 ? (
                  <>
                    <p className="text-lg font-bold text-emerald-600">{skillSearchability}%</p>
                    <Progress value={skillSearchability} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">{skillCount} of 15 recommended skills preserved</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Add skills to measure</p>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Evidence Strength</span>
                {evidenceCoverage > 0 ? (
                  <>
                    <p className="text-lg font-bold text-blue-600">{evidenceCoverage}%</p>
                    <Progress value={evidenceCoverage} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">Based on {projCount} projects + {certCount} certs</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-muted-foreground">—</p>
                    <p className="text-[10px] text-muted-foreground italic">No verified evidence yet</p>
                  </>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Recruiter Discoverability</span>
                {recruiterSearchability > 0 ? (
                  <>
                    <p className="text-lg font-bold text-purple-600">{recruiterSearchability}%</p>
                    <Progress value={recruiterSearchability} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">Headline, summary &amp; skill density score</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Complete profile to measure</p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Canonical Identity Summary</h4>
              <p className="text-xs text-foreground leading-relaxed">
                {resumeData?.personalInfo?.summary || "Accomplished professional with proven track record in end-to-end technical & operational execution."}
              </p>
            </div>
          </TabsContent>

          {/* SUB-TAB 2: NETWORK */}
          <TabsContent value="network" className="space-y-4 mt-0">
            {/* Honest empty state — no fake connection counts */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-muted/10 text-xs">
              <Users className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Your professional network starts here.</p>
                <p className="text-muted-foreground mt-0.5">Build your TalentXcel network to unlock peer discovery, referrals, and career opportunities driven by your career identity.</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suggested Connections Based on Your Skills</h4>
              {skillCount > 0 ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-border/60 bg-background flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Professionals with shared skills: {(resumeData?.skills || []).slice(0, 2).map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}</p>
                      <p className="text-muted-foreground">Connection suggestions will appear as your network grows.</p>
                    </div>
                    <Button onClick={() => toast.info('Network discovery will be available once your profile is published')} size="sm" variant="outline" className="h-7 text-xs font-semibold gap-1 shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                      Explore
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-3">Add skills to your profile to unlock skill-based connection suggestions.</p>
              )}
            </div>
          </TabsContent>

          {/* SUB-TAB 3: DISCOVERABILITY */}
          <TabsContent value="discoverability" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Recruiter Searchability</span>
                {recruiterSearchability > 0 ? (
                  <p className="text-base font-bold text-emerald-600">{recruiterSearchability}%</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">—</p>
                )}
                <p className="text-[10px] text-muted-foreground">Source: headline + skill count + summary</p>
              </div>
              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Skill Searchability</span>
                {skillSearchability > 0 ? (
                  <p className="text-base font-bold text-blue-600">{skillSearchability}%</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">—</p>
                )}
                <p className="text-[10px] text-muted-foreground">Source: {skillCount} of 15 target skills</p>
              </div>
              <div className="p-3 rounded-lg border bg-background space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Job Matchability</span>
                {jobMatchability > 0 ? (
                  <p className="text-base font-bold text-purple-600">{jobMatchability}%</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">—</p>
                )}
                <p className="text-[10px] text-muted-foreground">Source: summary + experience + skills</p>
              </div>
            </div>

            {profileCompletenessScore < 80 && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Discoverability Recommendation
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {!hasSummary ? 'Add a professional summary to significantly boost your recruiter searchability. ' : ''}
                  {skillCount < 5 ? `Add ${5 - skillCount} more skills to reach minimum skill discoverability threshold. ` : ''}
                  {expCount === 0 ? 'Add work experience entries to enable job matchability scoring.' : ''}
                </p>
                <Button onClick={() => setSubTab('opportunities')} size="sm" variant="outline" className="h-7 text-xs font-semibold border-amber-400 text-amber-900 dark:text-amber-200">
                  Update Preferences
                </Button>
              </div>
            )}
          </TabsContent>

          {/* SUB-TAB 4: OPEN TO OPPORTUNITIES */}
          <TabsContent value="opportunities" className="space-y-4 mt-0">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
              <label className="text-xs font-bold text-foreground">Visibility &amp; Job Search Status</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { id: 'actively', title: 'Actively Looking', desc: 'High recruiter priority' },
                  { id: 'open', title: 'Open to Opportunities', desc: 'Passive discovery' },
                  { id: 'not_looking', title: 'Not Looking', desc: 'Private mode' }
                ].map(st => (
                  <Button
                    key={st.id}
                    type="button"
                    variant={openStatus === st.id ? 'default' : 'outline'}
                    className="flex flex-col items-start justify-center h-auto py-2.5 px-3 text-left"
                    onClick={() => {
                      setOpenStatus(st.id as any);
                      toast.success(`Job search status updated to: ${st.title}`);
                    }}
                  >
                    <span className="text-xs font-bold">{st.title}</span>
                    <span className="text-[10px] opacity-80">{st.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Notice Period</label>
                <Input value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className="h-8 text-xs bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Expected Compensation</label>
                <Input value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} className="h-8 text-xs bg-background" />
              </div>
            </div>
          </TabsContent>

          {/* SUB-TAB 5: ACTIVITY & PROJECT CARDS */}
          <TabsContent value="activity" className="space-y-4 mt-0">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shareable Project Networking Cards</h4>
              {realProjects.length > 0 ? (
                <div className="space-y-3">
                  {realProjects.map((proj: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/60 bg-background space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-bold text-xs text-foreground">{proj.name || proj.title || 'Untitled Project'}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">Project Card</Badge>
                      </div>
                      {proj.technologies && (
                        <p className="text-xs text-muted-foreground">{Array.isArray(proj.technologies) ? proj.technologies.join(' • ') : proj.technologies}</p>
                      )}
                      {proj.description && (
                        <p className="text-xs text-foreground leading-relaxed">{proj.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Button onClick={() => toast.success(`Project card link for "${proj.name || 'project'}" copied`)} size="sm" variant="outline" className="h-7 text-xs font-semibold gap-1">
                          <Share2 className="w-3 h-3" />
                          Share Project
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-semibold">No projects added yet.</p>
                  <p className="text-xs mt-1">Add projects in the BUILD tab to create shareable project cards for your TalentXcel network.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
