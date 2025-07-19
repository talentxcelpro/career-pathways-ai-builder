
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Palette, 
  Type, 
  Layout, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  Sparkles,
  Settings,
  Wand2
} from "lucide-react";

interface ResumeLeftSidebarProps {
  resumeData: any;
  onUpdateData: (updates: any) => void;
  onShowSectionManager: () => void;
  onAnalyzeResume: () => void;
  isAnalyzing: boolean;
}

export const ResumeLeftSidebar: React.FC<ResumeLeftSidebarProps> = ({
  resumeData,
  onUpdateData,
  onShowSectionManager,
  onAnalyzeResume,
  isAnalyzing
}) => {
  const [activeSection, setActiveSection] = useState('personal');

  const sectionIcons = {
    personal: User,
    experience: Briefcase,
    education: GraduationCap,
    skills: Award,
    projects: Layout,
    certifications: Award
  };

  const updatePersonalInfo = (field: string, value: string) => {
    onUpdateData({
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    });
  };

  return (
    <Tabs defaultValue="sections" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="ai">AI Tools</TabsTrigger>
      </TabsList>

      <TabsContent value="sections" className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">Resume Sections</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowSectionManager}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Accordion type="single" collapsible value={activeSection} onValueChange={setActiveSection}>
            {/* Personal Information */}
            <AccordionItem value="personal">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Info
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.personalInfo?.fullName || ''}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">Professional Title</Label>
                  <Input
                    id="title"
                    value={resumeData.personalInfo?.title || ''}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personalInfo?.email || ''}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personalInfo?.phone || ''}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.personalInfo?.location || ''}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary" className="text-xs">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={resumeData.personalInfo?.summary || ''}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                    placeholder="Brief professional summary..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Experience */}
            <AccordionItem value="experience">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Work Experience
                  <Badge variant="outline" className="text-xs">
                    {resumeData.experience?.length || 0}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {resumeData.experience?.map((exp: any, index: number) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg">
                      <div className="space-y-2">
                        <Input
                          value={exp.title || ''}
                          onChange={(e) => {
                            const updated = [...(resumeData.experience || [])];
                            updated[index] = { ...exp, title: e.target.value };
                            onUpdateData({ experience: updated });
                          }}
                          placeholder="Job Title"
                          className="h-8 text-sm font-medium"
                        />
                        <Input
                          value={exp.company || ''}
                          onChange={(e) => {
                            const updated = [...(resumeData.experience || [])];
                            updated[index] = { ...exp, company: e.target.value };
                            onUpdateData({ experience: updated });
                          }}
                          placeholder="Company Name"
                          className="h-8 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={exp.startDate || ''}
                            onChange={(e) => {
                              const updated = [...(resumeData.experience || [])];
                              updated[index] = { ...exp, startDate: e.target.value };
                              onUpdateData({ experience: updated });
                            }}
                            placeholder="Start Date"
                            className="h-8 text-xs"
                          />
                          <Input
                            value={exp.endDate || ''}
                            onChange={(e) => {
                              const updated = [...(resumeData.experience || [])];
                              updated[index] = { ...exp, endDate: e.target.value };
                              onUpdateData({ experience: updated });
                            }}
                            placeholder="End Date"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExp = {
                        title: '',
                        company: '',
                        startDate: '',
                        endDate: '',
                        description: ''
                      };
                      onUpdateData({
                        experience: [...(resumeData.experience || []), newExp]
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Skills */}
            <AccordionItem value="skills">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Skills
                  <Badge variant="outline" className="text-xs">
                    {resumeData.skills?.length || 0}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {resumeData.skills?.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => {
                          const updated = [...(resumeData.skills || [])];
                          updated[index] = e.target.value;
                          onUpdateData({ skills: updated });
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = [...(resumeData.skills || [])];
                          updated.splice(index, 1);
                          onUpdateData({ skills: updated });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateData({
                        skills: [...(resumeData.skills || []), '']
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Skill
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </TabsContent>

      <TabsContent value="design" className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Template & Design</h3>
          
          <div className="space-y-2">
            <Label className="text-xs">Template</Label>
            <div className="grid grid-cols-2 gap-2">
              {['modern', 'classic', 'creative', 'minimal'].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  className="h-16 flex flex-col items-center justify-center text-xs"
                >
                  <Layout className="h-4 w-4 mb-1" />
                  {template}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Color Scheme</Label>
            <div className="flex gap-2">
              {['blue', 'green', 'purple', 'red'].map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded border-2 cursor-pointer bg-${color}-500`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Font</Label>
            <div className="space-y-1">
              {['Inter', 'Roboto', 'Open Sans', 'Lato'].map((font) => (
                <Button
                  key={font}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  <Type className="h-4 w-4 mr-2" />
                  {font}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="ai" className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">AI-Powered Tools</h3>
          
          <Button
            onClick={onAnalyzeResume}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'AI Resume Analysis'}
          </Button>

          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Wand2 className="h-4 w-4 mr-2" />
              Improve Content
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              ATS Optimization
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Palette className="h-4 w-4 mr-2" />
              Grammar Check
            </Button>
          </div>

          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">AI Premium</span>
            </div>
            <p className="text-xs text-amber-700 mb-2">
              Unlock advanced AI features for professional resume optimization.
            </p>
            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
              Upgrade Now
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
