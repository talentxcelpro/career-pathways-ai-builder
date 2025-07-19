
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Download, Share, Eye, Sparkles, Target, BarChart3, Palette } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { ResumeHeader } from './ResumeHeader';
import { DraggableSection } from '../DraggableSection';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { IntelligentResumePreview } from './IntelligentResumePreview';
import { ContentIntelligencePanel } from './ContentIntelligencePanel';
import { TemplateSelector } from './TemplateSelector';
import { ATSOptimizer } from './ATSOptimizer';
import { ResumeAnalytics } from './ResumeAnalytics';
import { ExportOptions } from './ExportOptions';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { useResumeAnalytics } from '@/hooks/useResumeAnalytics';
import { useContentIntelligence } from '@/hooks/useContentIntelligence';

interface EnhancedResumeBuilderProps {
  initialData?: EnhancedResumeData;
  onSave?: (data: EnhancedResumeData) => Promise<void>;
  onExport?: (data: EnhancedResumeData) => Promise<void>;
  mode?: 'create' | 'edit';
}

export const EnhancedResumeBuilder: React.FC<EnhancedResumeBuilderProps> = ({
  initialData,
  onSave,
  onExport,
  mode = 'create'
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    resumeData,
    updateResumeData,
    isSaving,
    hasChanges,
    saveResume,
    exportResume
  } = useResumeBuilder(initialData);

  const {
    overallScore,
    atsScore,
    suggestions,
    refreshAnalysis
  } = useResumeAnalytics(resumeData);

  const {
    grammarIssues,
    contentSuggestions,
    industryKeywords,
    runContentAnalysis
  } = useContentIntelligence(resumeData);

  useEffect(() => {
    if (resumeData) {
      refreshAnalysis();
      runContentAnalysis();
    }
  }, [resumeData]);

  const handleSave = useCallback(async () => {
    try {
      await saveResume();
      if (onSave) {
        await onSave(resumeData);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save resume:', error);
    }
  }, [saveResume, onSave, resumeData]);

  const handleExport = useCallback(async (format: string) => {
    try {
      await exportResume(format);
      if (onExport) {
        await onExport(resumeData);
      }
    } catch (error) {
      console.error('Failed to export resume:', error);
    }
  }, [exportResume, onExport, resumeData]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ResumeHeader
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        resumeData={resumeData}
        onEnhancementApplied={updateResumeData}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(atsScore)}`}>
                {atsScore}%
              </div>
              <div className="text-sm text-gray-600">ATS Compatible</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {suggestions.length}
              </div>
              <div className="text-sm text-gray-600">Improvements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {grammarIssues.length}
              </div>
              <div className="text-sm text-gray-600">Grammar Issues</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-full mb-6">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger value="optimize" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Optimize</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <div className="space-y-6">
                  <DraggableSection
                    id="personalInfo"
                    title="Personal Information"
                    description="Your contact details and professional summary"
                  >
                    <PersonalInfoSection
                      data={resumeData.personalInfo}
                      onChange={(data) => updateResumeData({ personalInfo: data })}
                    />
                  </DraggableSection>

                  <DraggableSection
                    id="experience"
                    title="Work Experience"
                    description="Your professional work history and achievements"
                  >
                    <ExperienceSection
                      data={resumeData.experience}
                      onChange={(data) => updateResumeData({ experience: data })}
                    />
                  </DraggableSection>

                  <DraggableSection
                    id="education"
                    title="Education"
                    description="Your educational background and qualifications"
                  >
                    <EducationSection
                      data={resumeData.education}
                      onChange={(data) => updateResumeData({ education: data })}
                    />
                  </DraggableSection>

                  <DraggableSection
                    id="skills"
                    title="Skills"
                    description="Your technical and soft skills"
                  >
                    <SkillsSection
                      data={resumeData.skills}
                      onChange={(data) => updateResumeData({ skills: data })}
                    />
                  </DraggableSection>

                  <DraggableSection
                    id="projects"
                    title="Projects"
                    description="Notable projects and achievements"
                  >
                    <ProjectsSection
                      data={resumeData.projects}
                      onChange={(data) => updateResumeData({ projects: data })}
                    />
                  </DraggableSection>
                </div>
              </TabsContent>

              <TabsContent value="design">
                <TemplateSelector
                  selectedTemplate={resumeData.selectedTemplate}
                  customization={resumeData.customization}
                  onTemplateChange={(template) => updateResumeData({ selectedTemplate: template })}
                  onCustomizationChange={(customization) => updateResumeData({ customization })}
                />
              </TabsContent>

              <TabsContent value="optimize">
                <ATSOptimizer
                  resumeData={resumeData}
                  onOptimize={updateResumeData}
                  atsScore={atsScore}
                  suggestions={suggestions}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <ResumeAnalytics
                  resumeData={resumeData}
                  overallScore={overallScore}
                  atsScore={atsScore}
                  suggestions={suggestions}
                />
              </TabsContent>

              <TabsContent value="export">
                <ExportOptions
                  resumeData={resumeData}
                  onExport={handleExport}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="w-full mb-4"
                >
                  {isPreviewMode ? "Exit Preview" : "Preview Resume"}
                </Button>
                <IntelligentResumePreview
                  data={resumeData}
                  template={resumeData.selectedTemplate}
                  customization={resumeData.customization}
                  compact={!isPreviewMode}
                />
              </CardContent>
            </Card>

            <ContentIntelligencePanel
              grammarIssues={grammarIssues}
              suggestions={contentSuggestions}
              industryKeywords={industryKeywords}
              onApplySuggestion={(suggestion) => {
                // Apply suggestion logic here
                console.log('Applying suggestion:', suggestion);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
