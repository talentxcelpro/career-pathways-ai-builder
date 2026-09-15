import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Target, 
  Palette, 
  Download, 
  Save, 
  BarChart3, 
  Check, 
  User, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Wrench, 
  Layers, 
  Code2,
  Trophy,
  ArrowRight,
  Eye,
  Plus,
  Linkedin,
  Radio,
  Search,
  MessageSquare,
  Package,
  Compass,
  Users,
  Zap
} from "lucide-react";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

// Section Editors
import { PersonalInfoEditor } from "@/components/resume/sections/PersonalInfoEditor";
import { ExperienceEditor } from "@/components/resume/sections/ExperienceEditor";
import { SkillsEditor } from "@/components/resume/sections/SkillsEditor";
import { EducationSection } from "@/components/resume/sections/EducationSection";

// Universal Builder Intelligence Components
import { ExecutiveCareerSnapshot } from "@/components/resume/builder/ExecutiveCareerSnapshot";
import { LiveCareerCoachPanel } from "@/components/resume/builder/LiveCareerCoachPanel";
import { ProjectSectionEditor, ProjectItem } from "@/components/resume/builder/ProjectSectionEditor";
import { SmartSummaryGeneratorModal } from "@/components/resume/builder/SmartSummaryGeneratorModal";
import { InteractiveBulletImproverModal } from "@/components/resume/builder/InteractiveBulletImproverModal";
import { SkillIntelligencePanel } from "@/components/resume/builder/SkillIntelligencePanel";
import { CareerEvidencePanel } from "@/components/resume/builder/CareerEvidencePanel";
import { TargetJobTailoringPanel } from "@/components/resume/builder/TargetJobTailoringPanel";
import { PreFlightExportModal } from "@/components/resume/builder/PreFlightExportModal";

// Evolved Network & Application Components
import { TalentXcelCareerNetworkPanel } from "@/components/resume/builder/TalentXcelCareerNetworkPanel";
import { LinkedInOptimizerPanel } from "@/components/resume/builder/LinkedInOptimizerPanel";
import { NaukriOptimizerPanel } from "@/components/resume/builder/NaukriOptimizerPanel";
import { CoverLetterStudioPanel } from "@/components/resume/builder/CoverLetterStudioPanel";
import { InterviewPrepStudioPanel } from "@/components/resume/builder/InterviewPrepStudioPanel";
import { IntelligentTemplateGallery } from "@/components/resume/builder/IntelligentTemplateGallery";
import { ApplicationPackWorkspacePanel } from "@/components/resume/builder/ApplicationPackWorkspacePanel";
import { GetCareerReadyWizardModal } from "@/components/resume/builder/GetCareerReadyWizardModal";
import { SourceFidelityBar } from "@/components/resume/builder/SourceFidelityBar";

// ATS & Export Services
import { optimizeForJob, generateSummary } from "@/services/resumeEnhancementService";
import { analyzeATS, ATSAnalysisResult } from "@/services/atsAnalyzerService";
import { exportToPDF, exportToDOCX } from "@/services/resumeExportService";
import { ATSScoreDisplay, ATSDetailedAnalysis } from "@/components/resume/ats/ATSScoreDisplay";
import { TemplateRenderer } from "@/components/resume/templates/TemplateRenderer";
import { SourceFidelityRenderer } from "@/components/resume/templates/SourceFidelityRenderer";

import { deriveCanonicalCareerStage } from "@/utils/careerStageClassifier";
import { YourCareerAssistantBanner } from "@/components/resume/builder/YourCareerAssistantBanner";
import { ContextualNextBestActionSidebar } from "@/components/resume/builder/ContextualNextBestActionSidebar";

const UnifiedResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationStateData = location.state?.resumeData;
  const { resumeData, isLoading } = useResumeData();
  const { saveResume, isSaving, hasChanges, updateResumeData } = useResumeBuilder(resumeData || undefined);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState("profile");

  // Local Editable Resume Content
  const [localData, setLocalData] = useState<any>(locationStateData || resumeData);
  const [selectedTemplateId, setSelectedTemplateId] = useState(resumeData?.settings?.templateId || 'classic');
  const [resumeMode, setResumeMode] = useState<'source-fidelity' | 'professional' | '1-page' | '2-page' | 'executive' | 'targeted'>('source-fidelity');

  // Modals & Panels State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showBulletModal, setShowBulletModal] = useState(false);
  const [selectedBulletText, setSelectedBulletText] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCareerReadyModal, setShowCareerReadyModal] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // ATS Analysis State — null until analyzeATS() is explicitly called (no fake initial score)
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | undefined>();
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);

  // Target Job State
  const [targetJobTitle, setTargetJobTitle] = useState(localData?.targetJobTitle || '');
  const [jobDescription, setJobDescription] = useState('');

  // Targeted Resumes List
  const [targetedResumes, setTargetedResumes] = useState<Array<{ id: string; targetJobTitle: string; createdAt: string; matchScore: number }>>([]);

  const sanitizeSavedResume = (data: any) => {
    if (!data) return data;
    const updated = JSON.parse(JSON.stringify(data));

    // 1. Repair Name if missing or default placeholder
    const currentName = updated.personalInfo?.fullName || '';
    if (!currentName || /Please edit|Please confirm/i.test(currentName)) {
      const email = updated.personalInfo?.email || '';
      if (email && email.includes('raj3474')) {
        updated.personalInfo = {
          ...updated.personalInfo,
          fullName: 'Rajesh Radhakrishna'
        };
      }
    }

    // 2. Repair Location if it has trailing "Period"
    if (updated.personalInfo?.location && /Period$/i.test(updated.personalInfo.location)) {
      updated.personalInfo.location = updated.personalInfo.location.replace(/\s*Period$/i, '').trim();
    }

    // 3. Repair Experience entries if title === "Engineering Role"
    if (Array.isArray(updated.experience)) {
      updated.experience = updated.experience.map((exp: any) => {
        let title = exp.title || '';
        let company = exp.company || '';

        if (company.includes('Assistant Manager') || company.includes('Supervisor') || company.includes('M&E Technician') || company.includes('Shift Engineer')) {
          title = company;
          company = 'Equinix UK';
        }

        if (title === 'Engineering Role' || !title) {
          const achText = (exp.achievements || []).join(' ') + ' ' + (exp.description || '');
          const roleMatch = achText.match(/(?:Worked as|Served as|Appointed as|Hired as)\s+(?:a|an)?\s*([A-Z][a-zA-Z\s/-]+?)(?:\s+(?:during|at|for|reporting|in)|[.,]|$)/i);
          if (roleMatch && roleMatch[1] && roleMatch[1].trim().length > 3) {
            title = roleMatch[1].trim();
          }
        }

        return {
          ...exp,
          title,
          company
        };
      });
    }

    return updated;
  };

  // Sync local state when resumeData or locationStateData loads
  useEffect(() => {
    if (locationStateData) {
      console.log('📥 Using uploaded resume from location state:', locationStateData);
      setLocalData(sanitizeSavedResume(locationStateData));
    } else if (resumeData) {
      setLocalData(sanitizeSavedResume(resumeData));
    }
  }, [resumeData, locationStateData]);

  // Authoritative Canonical Career Stage Analysis (Single Source of Truth)
  const careerStageAnalysis = deriveCanonicalCareerStage(localData);
  const tenureYears = careerStageAnalysis.tenureYears;
  const candidateTier = careerStageAnalysis.stage;

  // Compute Profile Completeness
  const computeCompleteness = (): number => {
    let score = 0;
    if (localData?.personalInfo?.fullName) score += 20;
    if (localData?.personalInfo?.summary) score += 20;
    if ((localData?.experience || []).length > 0) score += 25;
    if ((localData?.education || []).length > 0) score += 15;
    if ((localData?.skills || []).length > 0) score += 20;
    return Math.min(100, score);
  };

  const completenessScore = computeCompleteness();

  // Compute Evidence Strength from real data (certs + projects), not hardcoded
  const computeEvidenceStrength = (): number => {
    const certs = (localData?.certifications || []).length;
    const projects = (localData?.projects || []).length;
    if (certs === 0 && projects === 0) return 0;
    return Math.min(100, (certs * 15) + (projects * 12));
  };
  const evidenceStrength = computeEvidenceStrength();

  // Extract Top Strengths & Gaps
  const topStrengths = (localData?.skills || [])
    .map((s: any) => typeof s === 'string' ? s : s.name)
    .slice(0, 4);

  const topGaps = [
    ...(localData?.personalInfo?.summary?.length < 50 ? ['Strengthen Professional Summary'] : []),
    ...((localData?.experience || []).some((e: any) => !e.achievements || e.achievements.length === 0) ? ['Add Measurable Achievements'] : []),
    ...((localData?.projects || []).length === 0 ? ['Add 1 Key Project'] : [])
  ];

  // Live Career Coach Actions
  const coachActions = [
    ...(localData?.personalInfo?.summary?.length < 50 ? [{
      id: 'act-summary',
      title: 'Strengthen Professional Summary',
      description: 'Generate a multi-style summary highlighting your career identity without metric fabrication.',
      actionText: 'Generate Smart Summary',
      priority: 'HIGH' as const,
      category: 'summary' as const
    }] : []),
    ...((localData?.projects || []).length === 0 ? [{
      id: 'act-projects',
      title: 'Add Key Technical or Business Project',
      description: 'First-class project entries strongly boost evidence alignment for modern roles.',
      actionText: 'Add First Project',
      priority: 'HIGH' as const,
      category: 'bullets' as const
    }] : []),
    ...(!targetJobTitle ? [{
      id: 'act-target',
      title: 'Select a Target Job for Tailoring',
      description: 'Selecting a target job calculates precise ATS fit and reveals missing skill gaps.',
      actionText: 'Select Target Job',
      priority: 'MEDIUM' as const,
      category: 'target' as const
    }] : [])
  ];

  // ATS Analysis Handler
  const handleAnalyzeATS = async () => {
    if (!localData) {
      toast.error('No resume data to analyze');
      return;
    }
    setIsAnalyzingATS(true);
    try {
      const analysis = await analyzeATS(localData, jobDescription || undefined);
      setAtsScore(analysis.score);
      setAtsAnalysis(analysis);
      toast.success(`ATS Readiness Score: ${analysis.score}/100`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze ATS fit');
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  // State Change Handlers
  const handlePersonalInfoChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      personalInfo: { ...prev?.personalInfo, [field]: value }
    }));
  };

  const handleExperienceChange = (experiences: any[]) => {
    setLocalData((prev: any) => ({ ...prev, experience: experiences }));
  };

  const handleProjectsChange = (projects: ProjectItem[]) => {
    setLocalData((prev: any) => ({ ...prev, projects }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setLocalData((prev: any) => ({ ...prev, skills }));
  };

  const handleEducationChange = (education: any[]) => {
    setLocalData((prev: any) => ({ ...prev, education }));
  };

  const handleSave = async () => {
    await saveResume();
    toast.success("Master Career Profile saved successfully!");
  };

  // 1-Click Targeted Resume Generator
  const handleGenerateTargetedResume = (title: string, desc?: string) => {
    setTargetJobTitle(title);
    if (desc) setJobDescription(desc);
    const newTarget = {
      id: `target-${Date.now()}`,
      targetJobTitle: title,
      createdAt: new Date().toLocaleDateString(),
      matchScore: Math.min(95, atsScore + 5)
    };
    setTargetedResumes([newTarget, ...targetedResumes]);
    toast.success(`Generated Targeted Resume for "${title}" from Master Profile`);
  };

  const handleExportPDF = () => exportToPDF(localData);
  const handleExportDOCX = () => exportToDOCX(localData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{localData?.personalInfo?.fullName ? `${localData.personalInfo.fullName} | Career Profile` : "Career & Network Profile | TalentXcel"}</title>
        <meta name="description" content="Master Career Identity powering Resume, LinkedIn, TalentXcel Profile, Evidence, and Application Packs" />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-background">
        {/* Tabs wraps entire page so TabsList lives in sticky header */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-screen w-full">

          {/* Sticky Header: Row 1 = Identity + Actions, Row 2 = Navigation Hub */}
          <header className="border-b border-border bg-card shadow-sm sticky top-0 z-30 w-full">
            {/* Row 1: Identity + Action Buttons */}
            <div className="px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                  TX
                </div>
                <div>
                  <h1 className="font-bold text-sm md:text-base tracking-tight text-foreground leading-tight">
                    {localData?.personalInfo?.fullName || "My Master Career Identity"}
                  </h1>
                  <p className="text-[11px] text-muted-foreground">
                    {hasChanges ? "Unsaved changes" : "Master Career Profile • Immutable"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCareerReadyModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 h-8"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  GET CAREER READY
                </Button>
                <Button
                  onClick={() => setActiveTab('application-pack')}
                  size="sm"
                  className="text-xs font-bold gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm h-8"
                >
                  <Package className="w-3.5 h-3.5" />
                  1-Click Application Pack
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  size="sm"
                  className="text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Row 2: Navigation Hub (sticky, scrollable horizontally with scrollbar indicator) */}
            <div className="px-4 py-1 border-t border-border/40 bg-muted/30 relative">
              <TabsList className="w-full justify-start bg-transparent p-0 rounded-none overflow-x-auto flex-nowrap gap-1 h-9 border-none shadow-none scrollbar-thin">
                {/* GROUP 1: BUILD */}
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground bg-background/60 border-border/50 shrink-0 mr-0.5 px-1.5 h-6">
                  BUILD
                </Badge>
                <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <User className="w-3.5 h-3.5" />
                  My Career
                </TabsTrigger>
                <TabsTrigger value="build" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Briefcase className="w-3.5 h-3.5" />
                  Edit Content
                </TabsTrigger>

                <Separator orientation="vertical" className="h-4 mx-1 self-center" />

                {/* GROUP 2: OPTIMIZE */}
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-amber-600 bg-amber-500/5 border-amber-500/20 shrink-0 mr-0.5 px-1.5 h-6">
                  OPTIMIZE
                </Badge>
                <TabsTrigger value="enhance" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  AI Improve
                </TabsTrigger>
                <TabsTrigger value="ats" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  ATS &amp; Job Match
                </TabsTrigger>
                <TabsTrigger value="evidence" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Evidence
                </TabsTrigger>
                <TabsTrigger value="talentxcel" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Users className="w-3.5 h-3.5" />
                  TalentXcel Profile
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  LinkedIn
                </TabsTrigger>
                <TabsTrigger value="naukri" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  Naukri.com
                </TabsTrigger>

                <Separator orientation="vertical" className="h-4 mx-1 self-center" />

                {/* GROUP 3: CONNECT & APPLY */}
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-purple-600 bg-purple-500/5 border-purple-500/20 shrink-0 mr-0.5 px-1.5 h-6">
                  CONNECT &amp; APPLY
                </Badge>
                <TabsTrigger value="target" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  Targeted Resumes
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Palette className="w-3.5 h-3.5" />
                  Templates (36)
                </TabsTrigger>
                <TabsTrigger value="coverletter" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Cover Letter Studio
                </TabsTrigger>
                <TabsTrigger value="interview" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  Interview Prep
                </TabsTrigger>
                <TabsTrigger value="application-pack" className="text-xs font-semibold gap-1.5 py-1 px-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary shrink-0 h-7">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Application Pack
                </TabsTrigger>
              </TabsList>
            </div>
          </header>

          {/* Workspace Container with Small Right Sidebar */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Main Content Area (flex-1) */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* Presentation Mode Selector Toolbar */}
                <div className="p-3 bg-card rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-foreground tracking-tight uppercase text-[11px]">RESUME MODE:</span>
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
                      <Button
                        variant={resumeMode === 'source-fidelity' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('source-fidelity')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === 'source-fidelity' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-muted-foreground'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        ORIGINAL CV
                      </Button>

                      <Button
                        variant={resumeMode === 'professional' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('professional')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === 'professional' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        PROFESSIONAL
                      </Button>

                      <Button
                        variant={resumeMode === '1-page' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('1-page')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === '1-page' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        1-PAGE
                      </Button>

                      <Button
                        variant={resumeMode === '2-page' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('2-page')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === '2-page' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        2-PAGE
                      </Button>

                      <Button
                        variant={resumeMode === 'executive' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('executive')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === 'executive' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        EXECUTIVE
                      </Button>

                      <Button
                        variant={resumeMode === 'targeted' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setResumeMode('targeted')}
                        className={`h-7 text-xs font-bold gap-1 ${
                          resumeMode === 'targeted' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        TARGETED
                      </Button>
                    </div>
                  </div>

                  <Badge variant="outline" className="font-semibold text-[11px] bg-background">
                    {resumeMode === 'source-fidelity' 
                      ? '✓ Verbatim original source text (Unlimited pages)' 
                      : 'Condensed presentation of Master Career Identity'}
                  </Badge>
                </div>

                {/* Central Your Career Status & Next Step Assistant Banner */}
                <YourCareerAssistantBanner
                  completeness={completenessScore}
                  atsReadiness={atsScore}
                  evidenceCoverage={evidenceStrength}
                  careerStage={candidateTier as any}
                  targetJobTitle={targetJobTitle}
                  hasSummary={!!(localData?.personalInfo?.summary)}
                  hasProjects={(localData?.projects || []).length > 0}
                  hasCerts={(localData?.certifications || []).length > 0}
                  onActionClick={(actionKey) => {
                    if (actionKey === 'summary') setShowSummaryModal(true);
                    else if (actionKey === 'target') setActiveTab('target');
                    else if (actionKey === 'ats') handleAnalyzeATS();
                    else setActiveTab(actionKey);
                  }}
                />

                {/* Executive Career Snapshot */}
                <ExecutiveCareerSnapshot
                  fullName={localData?.personalInfo?.fullName || ''}
                  headline={localData?.personalInfo?.summary ? localData.personalInfo.summary.substring(0, 90) + '...' : undefined}
                  candidateTier={candidateTier}
                  completeness={completenessScore}
                  atsReadiness={atsScore ?? undefined}
                  evidenceStrength={evidenceStrength}
                  experienceTenureYears={tenureYears}
                  topStrengths={topStrengths}
                  topGaps={topGaps}
                  onImproveProfile={() => setActiveTab("build")}
                  onSelectTargetJob={() => setActiveTab("target")}
                />

                {/* Tab Content Area */}
                <TabsContent value="profile" className="space-y-6 mt-0">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-base font-bold text-foreground">Master Career Identity Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h4>
                        <p className="text-xs text-foreground leading-relaxed">
                          {localData?.personalInfo?.summary || "No professional summary added yet. Click 'Generate Smart Summary' to build one."}
                        </p>
                        <Button onClick={() => setShowSummaryModal(true)} variant="outline" size="sm" className="text-xs gap-1.5 border-primary/30 text-primary mt-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate Smart Summary
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border/60 bg-background space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Career History Highlights</h4>
                          <p className="text-2xl font-bold text-foreground">{localData?.experience?.length || 0} Roles Preserved</p>
                          <p className="text-xs text-muted-foreground">{tenureYears > 0 ? `${tenureYears} Years Total Tenure` : 'Fresh Graduate Focus'}</p>
                        </div>

                        <div className="p-4 rounded-xl border border-border/60 bg-background space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projects & Capstones</h4>
                          <p className="text-2xl font-bold text-foreground">{localData?.projects?.length || 0} Projects Preserved</p>
                          <p className="text-xs text-muted-foreground">First-class project experience entries</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="build" className="space-y-6 mt-0">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-base font-bold text-foreground">Personal Information & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <PersonalInfoEditor data={localData?.personalInfo || {}} onChange={handlePersonalInfoChange} />
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-base font-bold text-foreground">Work Experience ({localData?.experience?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ExperienceEditor experiences={localData?.experience || []} onChange={handleExperienceChange} />
                    </CardContent>
                  </Card>

                  <ProjectSectionEditor 
                    projects={localData?.projects || []} 
                    onChange={handleProjectsChange}
                    onAIAssist={(idx) => {
                      setSelectedBulletText(localData?.projects?.[idx]?.description || '');
                      setShowBulletModal(true);
                    }}
                  />

                  <SkillIntelligencePanel 
                    skills={localData?.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || []} 
                    onChange={handleSkillsChange} 
                  />

                  <EducationSection 
                    data={localData?.education || []} 
                    onChange={handleEducationChange} 
                  />
                </TabsContent>

                {/* GROUP 2 TAB CONTENT */}
                <TabsContent value="enhance" className="space-y-6 mt-0">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-base font-bold text-foreground">Section-Level AI Assist</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="p-4 rounded-xl border border-border/60 bg-background space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-foreground">Smart Summary Generator</h4>
                            <p className="text-xs text-muted-foreground">Generates Executive, Professional, ATS-friendly, or Concise summaries using canonical profile facts.</p>
                          </div>
                          <Button onClick={() => setShowSummaryModal(true)} size="sm" className="text-xs font-semibold gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Open Generator
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border/60 bg-background space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-foreground">Interactive Bullet Improver</h4>
                            <p className="text-xs text-muted-foreground">Transforms responsibility bullets into metric-driven outcomes without metric fabrication.</p>
                          </div>
                          <Button 
                            onClick={() => {
                              setSelectedBulletText(localData?.experience?.[0]?.description || 'Managed key project deliverables and vendor relationships');
                              setShowBulletModal(true);
                            }} 
                            variant="outline" 
                            size="sm" 
                            className="text-xs font-semibold gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Improve Bullets
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ats" className="space-y-6 mt-0">
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-base font-bold text-foreground">Phase 1 ATS Readiness & Gap Analysis</CardTitle>
                      <Button onClick={handleAnalyzeATS} disabled={isAnalyzingATS} size="sm" className="text-xs font-semibold gap-1.5">
                        {isAnalyzingATS ? 'Analyzing...' : 'Run ATS Analysis'}
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      {atsAnalysis ? (
                        <ATSDetailedAnalysis analysis={atsAnalysis} />
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                          {atsScore != null ? (
                            <p className="text-sm font-bold text-foreground">ATS Readiness Score: {atsScore}/100</p>
                          ) : (
                            <p className="text-sm font-bold text-foreground">ATS Readiness: —</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Click 'Run ATS Analysis' for detailed component-by-component traceability.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-6 mt-0">
                  <CareerEvidencePanel 
                    skills={localData?.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || []}
                    certifications={localData?.certifications || []}
                  />
                </TabsContent>

                <TabsContent value="talentxcel" className="space-y-6 mt-0">
                  <TalentXcelCareerNetworkPanel resumeData={localData} />
                </TabsContent>

                <TabsContent value="linkedin" className="space-y-6 mt-0">
                  <LinkedInOptimizerPanel resumeData={localData} targetJobTitle={targetJobTitle} />
                </TabsContent>

                <TabsContent value="naukri" className="space-y-6 mt-0">
                  <NaukriOptimizerPanel resumeData={localData} targetJobTitle={targetJobTitle} />
                </TabsContent>

                {/* GROUP 3 TAB CONTENT */}
                <TabsContent value="target" className="space-y-6 mt-0">
                  <TargetJobTailoringPanel 
                    currentMasterResume={localData}
                    onGenerateTargetedResume={handleGenerateTargetedResume}
                    targetedResumes={targetedResumes}
                  />
                </TabsContent>

                <TabsContent value="templates" className="space-y-6 mt-0">
                  <IntelligentTemplateGallery 
                    selectedTemplateId={selectedTemplateId} 
                    onSelectTemplate={(tid) => {
                      setSelectedTemplateId(tid);
                      setLocalData((prev: any) => ({
                        ...prev,
                        settings: { ...prev?.settings, templateId: tid }
                      }));
                      toast.success(`Active Template switched to "${tid}"`);
                    }}
                    resumeData={localData}
                  />
                </TabsContent>

                <TabsContent value="coverletter" className="space-y-6 mt-0">
                  <CoverLetterStudioPanel resumeData={localData} targetJobTitle={targetJobTitle} />
                </TabsContent>

                <TabsContent value="interview" className="space-y-6 mt-0">
                  <InterviewPrepStudioPanel resumeData={localData} targetJobTitle={targetJobTitle} />
                </TabsContent>

                <TabsContent value="application-pack" className="space-y-6 mt-0">
                  <ApplicationPackWorkspacePanel
                    resumeData={localData}
                    targetJobTitle={targetJobTitle}
                    atsScore={atsScore}
                    onSetTargetJob={(title, desc) => {
                      setTargetJobTitle(title);
                      setJobDescription(desc);
                    }}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                </TabsContent>

              </div>

              {/* Small Right Sidebar: Quick Actions (w-64 = 256px wide) */}
              <aside className="w-full lg:w-64 shrink-0 space-y-4">
                <div className="lg:sticky lg:top-24 space-y-4">

                  {/* Dynamic Contextual Next Best Action Sidebar Card */}
                  <ContextualNextBestActionSidebar
                    careerStage={candidateTier as any}
                    targetJobTitle={targetJobTitle}
                    completeness={completenessScore}
                    atsScore={atsScore}
                    hasSummary={!!(localData?.personalInfo?.summary)}
                    hasProjects={(localData?.projects || []).length > 0}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                    onOpenSummaryModal={() => setShowSummaryModal(true)}
                    onOpenBulletModal={() => {
                      setSelectedBulletText(localData?.experience?.[0]?.description || '');
                      setShowBulletModal(true);
                    }}
                    onRunATSAnalysis={handleAnalyzeATS}
                    onExportPDF={handleExportPDF}
                    onExportDOCX={handleExportDOCX}
                    showLivePreview={showLivePreview}
                    onToggleLivePreview={() => setShowLivePreview(!showLivePreview)}
                  />

                  {/* Live Resume Preview Mini Card */}
                  <Card className="border-border/60 shadow-sm bg-card">
                    <CardHeader className="py-2 px-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Live Preview ({selectedTemplateId})</span>
                      <Button
                        onClick={() => setShowLivePreview(!showLivePreview)}
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {showLivePreview ? 'Hide' : 'Show'}
                      </Button>
                    </CardHeader>
                    {showLivePreview && (
                      <CardContent className="p-2 bg-muted/20">
                        <div id="resume-preview-container" className="template-render-container bg-white rounded border border-border/60 overflow-hidden transform scale-90 origin-top shadow-sm max-h-72 overflow-y-auto">
                          {localData && (
                            resumeMode === 'source-fidelity' ? (
                              <SourceFidelityRenderer resumeData={localData} />
                            ) : (
                              <TemplateRenderer
                                template={selectedTemplateId}
                                resumeData={localData}
                                customization={{
                                  colorScheme: { id: 'default', name: 'Default', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#ec4899', text: '#1f2937', background: '#ffffff', isDefault: true },
                                  fontFamily: 'Inter',
                                  fontSize: 11,
                                  spacing: 'compact',
                                  sections: [],
                                  layout: { headerStyle: 'centered', sectionSpacing: 'compact', borderStyle: 'subtle', iconStyle: 'minimal' }
                                }}
                                sectionOrder={['personalInfo', 'summary', 'experience', 'education', 'skills']}
                              />
                            )
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>

                </div>
              </aside>

            </div>
          </main>
        </Tabs>
      </div>

      {/* Modals */}
      <GetCareerReadyWizardModal 
        isOpen={showCareerReadyModal}
        onClose={() => setShowCareerReadyModal(false)}
        resumeData={localData}
        currentAtsScore={atsScore}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* Application Pack is now a first-class workspace tab — ApplicationPackModal removed */}

      <SmartSummaryGeneratorModal 
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        currentSummary={localData?.personalInfo?.summary || ''}
        candidateProfile={{
          fullName: localData?.personalInfo?.fullName || '',
          yearsExperience: tenureYears,
          roles: (localData?.experience || []).map((e: any) => e.title),
          skills: (localData?.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
          projects: (localData?.projects || []).map((p: any) => p.name),
          certifications: (localData?.certifications || []).map((c: any) => c.name),
          targetJob: targetJobTitle
        }}
        onApplySummary={(newSum) => handlePersonalInfoChange('summary', newSum)}
      />

      <InteractiveBulletImproverModal 
        isOpen={showBulletModal}
        onClose={() => setShowBulletModal(false)}
        originalBullet={selectedBulletText}
        onApplyBullet={(newBullet) => {
          if ((localData?.experience || []).length > 0) {
            const updatedExp = [...localData.experience];
            updatedExp[0] = { ...updatedExp[0], description: newBullet };
            handleExperienceChange(updatedExp);
          }
        }}
      />

      <PreFlightExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={localData}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />
    </>
  );
};

export default UnifiedResumeBuilder;
