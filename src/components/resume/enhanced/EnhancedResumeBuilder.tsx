
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Eye, Sparkles, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SectionManager } from './SectionManager';
import { ResumePreview } from './ResumePreview';
import { EnhancementPanel } from './EnhancementPanel';
import { ATSScoreCard } from './ATSScoreCard';
import { 
  EnhancedResumeData, 
  DEFAULT_SECTION_CONFIG, 
  ResumeSection, 
  SECTION_METADATA 
} from "@/types/enhanced-resume";

interface EnhancedResumeBuilderProps {
  initialData?: Partial<EnhancedResumeData>;
  onSave?: (data: EnhancedResumeData) => void;
  onExport?: (data: EnhancedResumeData) => void;
}

export const EnhancedResumeBuilder: React.FC<EnhancedResumeBuilderProps> = ({
  initialData,
  onSave,
  onExport
}) => {
  const [resumeData, setResumeData] = useState<EnhancedResumeData>(() => {
    const defaultData: EnhancedResumeData = {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        linkedin: '',
        website: '',
        github: ''
      },
      professionalSummary: {
        content: '',
        keyHighlights: []
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      awards: [],
      languages: [],
      publications: [],
      references: [],
      volunteerWork: [],
      trainings: [],
      tools: {
        development: [],
        design: [],
        analytics: [],
        productivity: [],
        other: []
      },
      careerObjectives: {
        statement: '',
        goals: []
      },
      sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
      sectionConfig: DEFAULT_SECTION_CONFIG,
      selectedTemplate: 'modern',
      customization: {
        colorScheme: 'blue',
        fontFamily: 'Inter',
        fontSize: 12,
        spacing: 'normal'
      }
    };

    if (initialData) {
      return {
        ...defaultData,
        ...initialData,
        personalInfo: {
          ...defaultData.personalInfo,
          ...initialData.personalInfo
        },
        professionalSummary: {
          ...defaultData.professionalSummary,
          ...initialData.professionalSummary
        },
        customization: {
          ...defaultData.customization,
          ...initialData.customization
        }
      };
    }

    return defaultData;
  });

  const [activeTab, setActiveTab] = useState('build');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [atsScore, setAtsScore] = useState(75);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      handleSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [resumeData]);

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      await onSave?.(resumeData);
      setSaveStatus('saved');
      toast.success('Resume saved successfully');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to save resume');
      console.error('Save error:', error);
    }
  };

  const handleExport = async () => {
    try {
      await onExport?.(resumeData);
      toast.success('Resume exported successfully');
    } catch (error) {
      toast.error('Failed to export resume');
      console.error('Export error:', error);
    }
  };

  const handleDataChange = (section: keyof EnhancedResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSectionOrderChange = (newOrder: string[]) => {
    setResumeData(prev => ({
      ...prev,
      sectionOrder: newOrder
    }));
  };

  const handleSectionConfigChange = (newConfig: ResumeSection[]) => {
    setResumeData(prev => ({
      ...prev,
      sectionConfig: newConfig
    }));
  };

  const handleEnhanceSection = async (sectionType: string, content: any) => {
    setIsEnhancing(true);
    try {
      // Simulate AI enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock enhanced content
      const enhancedContent = {
        ...content,
        enhanced: true,
        improvements: ['Added action verbs', 'Quantified achievements', 'Improved formatting']
      };
      
      handleDataChange(sectionType as keyof EnhancedResumeData, enhancedContent);
      toast.success(`${sectionType} enhanced successfully`);
    } catch (error) {
      toast.error('Enhancement failed');
      console.error('Enhancement error:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculateProgress = () => {
    const requiredSections = ['personalInfo', 'experience'];
    const completedSections = requiredSections.filter(section => {
      const data = resumeData[section as keyof EnhancedResumeData];
      if (Array.isArray(data)) {
        return data.length > 0;
      }
      if (typeof data === 'object' && data !== null) {
        return Object.values(data).some(value => 
          value !== '' && value !== null && value !== undefined
        );
      }
      return false;
    });
    
    return (completedSections.length / requiredSections.length) * 100;
  };

  const renderSectionContent = (sectionType: string) => {
    const metadata = SECTION_METADATA[sectionType as keyof typeof SECTION_METADATA];
    
    if (!metadata) return null;

    switch (sectionType) {
      case 'personalInfo':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    fullName: e.target.value
                  })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    email: e.target.value
                  })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    phone: e.target.value
                  })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    location: e.target.value
                  })}
                  placeholder="New York, NY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={resumeData.personalInfo.summary}
                onChange={(e) => handleDataChange('personalInfo', {
                  ...resumeData.personalInfo,
                  summary: e.target.value
                })}
                placeholder="Brief professional summary..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={resumeData.personalInfo.linkedin || ''}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    linkedin: e.target.value
                  })}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={resumeData.personalInfo.website || ''}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    website: e.target.value
                  })}
                  placeholder="www.johndoe.com"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={resumeData.personalInfo.github || ''}
                  onChange={(e) => handleDataChange('personalInfo', {
                    ...resumeData.personalInfo,
                    github: e.target.value
                  })}
                  placeholder="github.com/johndoe"
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Section editor for {metadata.title} will be implemented here</p>
          </div>
        );
    }
  };

  const enabledSections = resumeData.sectionConfig?.filter(section => section.enabled) || [];
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-gray-600">Create and customize your professional resume</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-32" />
                <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {enabledSections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {SECTION_METADATA[section.id]?.title || section.title}
                        {section.required && <Badge variant="destructive">Required</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderSectionContent(section.id)}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-6">
                <ATSScoreCard score={atsScore} />
                <ResumePreview data={resumeData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections">
            <SectionManager
              sections={resumeData.sectionConfig || DEFAULT_SECTION_CONFIG}
              onSectionOrderChange={handleSectionOrderChange}
              onSectionConfigChange={handleSectionConfigChange}
            />
          </TabsContent>

          <TabsContent value="enhance">
            <EnhancementPanel
              data={resumeData}
              onEnhance={handleEnhanceSection}
              isEnhancing={isEnhancing}
            />
          </TabsContent>

          <TabsContent value="preview">
            <ResumePreview data={resumeData} fullPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
