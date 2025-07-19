
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  Download, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Settings, 
  Palette,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Move
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

interface UnifiedResumeInterfaceProps {
  mode: 'create' | 'edit';
  resumeId?: string;
}

const defaultSections = [
  { id: 'personal', title: 'Personal Information', icon: User, required: true },
  { id: 'summary', title: 'Professional Summary', icon: FileText, required: false },
  { id: 'experience', title: 'Work Experience', icon: Briefcase, required: true },
  { id: 'education', title: 'Education', icon: GraduationCap, required: true },
  { id: 'skills', title: 'Skills', icon: Code, required: true },
  { id: 'projects', title: 'Projects', icon: FolderOpen, required: false },
  { id: 'certifications', title: 'Certifications', icon: Award, required: false },
  { id: 'languages', title: 'Languages', icon: Languages, required: false },
  { id: 'awards', title: 'Awards', icon: Award, required: false }
];

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({ 
  mode, 
  resumeId 
}) => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
      website: ''
    },
    professionalSummary: {
      content: '',
      careerBackground: '',
      keySkills: [],
      targetRoles: [],
      goals: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    projects: [],
    certifications: [],
    languages: [],
    awards: []
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [activeSections, setActiveSections] = useState(defaultSections);
  const [previewMode, setPreviewMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('preview');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');
  const [templateSettings, setTemplateSettings] = useState({
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#F59E0B'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    spacing: 'normal',
    layout: 'single-column'
  });


  const handleSectionReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeSections.findIndex(section => section.id === active.id);
      const newIndex = activeSections.findIndex(section => section.id === over.id);
      const newSections = arrayMove(activeSections, oldIndex, newIndex);
      setActiveSections(newSections);
      
    }
  };

  const updateResumeData = (updates: any) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Implementation for saving resume
      setLastSaved(new Date());
      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Implementation for exporting resume
    toast({
      title: "Export Started",
      description: "Your resume is being prepared for download.",
    });
  };

  const renderSectionEditor = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600 mb-6">Add your contact details and basic information</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State, Country"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio/Website</label>
                  <input
                    type="url"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                    value={resumeData.personalInfo.portfolio}
                    onChange={(e) => updateResumeData({
                      personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
              <p className="text-gray-600 mb-6">Write a compelling summary of your professional background</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Write a brief summary of your professional background and key achievements..."
                value={resumeData.professionalSummary.content}
                onChange={(e) => updateResumeData({
                  professionalSummary: { ...resumeData.professionalSummary, content: e.target.value }
                })}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Editor Coming Soon</h3>
            <p className="text-gray-600">This section editor is being developed.</p>
          </div>
        );
    }
  };

  const renderSimplePreview = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border max-h-96 overflow-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {resumeData.personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-gray-600">
          {resumeData.personalInfo.email || 'your.email@example.com'}
        </p>
        <p className="text-gray-600">
          {resumeData.personalInfo.phone || '+1 (555) 123-4567'}
        </p>
        <p className="text-gray-600">
          {resumeData.personalInfo.location || 'Your Location'}
        </p>
      </div>
      
      {resumeData.professionalSummary.content && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Professional Summary</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {resumeData.professionalSummary.content}
          </p>
        </div>
      )}
    </div>
  );

  const renderSectionButton = (section: any) => {
    const IconComponent = section.icon;
    return (
      <button
        key={section.id}
        onClick={() => setActiveSection(section.id)}
        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
          activeSection === section.id
            ? 'bg-blue-50 border border-blue-200 text-blue-900'
            : 'hover:bg-gray-50 text-gray-700 border border-transparent'
        }`}
      >
        <IconComponent className="h-5 w-5" />
        <span className="font-medium">{section.title}</span>
        {section.required && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Required</span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Resume' : 'Edit Resume'}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>•</span>
              <span>Auto-saved</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {previewMode ? (
        <div className="p-6">
          {renderSimplePreview()}
        </div>
      ) : (
        <div className="flex min-h-screen">
          {/* Left Sidebar */}
          <div className="w-64 border-r bg-gray-50/40">
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold text-gray-900 mb-2">Resume Sections</h2>
              <p className="text-sm text-gray-600">Click to edit sections</p>
            </div>
            <div className="p-4 space-y-2">
              {defaultSections.map(renderSectionButton)}
            </div>
          </div>

          {/* Center Editor */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-6">
              {renderSectionEditor()}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 border-l bg-white">
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 m-4 mb-0">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-auto p-4">
                <TabsContent value="preview" className="mt-0">
                  {renderSimplePreview()}
                </TabsContent>
                <TabsContent value="template" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Template</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['Modern', 'Classic'].map((template) => (
                          <button key={template} className="p-3 border rounded-lg text-sm">{template}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};
