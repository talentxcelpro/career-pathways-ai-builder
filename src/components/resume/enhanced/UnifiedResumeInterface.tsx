
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResumeHeader } from './ResumeHeader';
import { DraggableSection } from '../DraggableSection';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Download, Eye, EyeOff, Plus } from "lucide-react";

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({ mode }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [resumeData, setResumeData] = useState({
    personalInfo: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills']
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (mode === 'edit' && id && id.startsWith('new-')) {
      // Initialize new resume
      setResumeData({
        personalInfo: {},
        summary: '',
        experience: [],
        education: [],
        skills: [],
        sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills']
      });
    } else if (mode === 'edit' && id) {
      loadResume();
    }
  }, [id, mode]);

  const loadResume = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data?.content) {
        setResumeData(data.content as any);
        setLastSaved(new Date(data.updated_at));
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    }
  };

  const saveResume = useCallback(async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const resumeId = id?.startsWith('new-') ? undefined : id;
      
      if (resumeId) {
        // Update existing resume
        const { error } = await supabase
          .from('ai_resumes')
          .update({
            content: resumeData as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', resumeId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new resume
        const { data, error } = await supabase
          .from('ai_resumes')
          .insert({
            user_id: user.id,
            title: 'New Resume',
            content: resumeData as any,
            ats_score: 75
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Update URL to use the new ID
        navigate(`/resume-builder/edit/${data.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      setHasChanges(false);
      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, user, id, navigate]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setResumeData(prev => {
        const oldIndex = prev.sectionOrder.indexOf(active.id);
        const newIndex = prev.sectionOrder.indexOf(over.id);
        
        return {
          ...prev,
          sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex)
        };
      });
      setHasChanges(true);
    }
  };

  const updateResumeData = (section: string, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const handleEnhancementApplied = (enhancedData: any) => {
    setResumeData(enhancedData);
    setHasChanges(true);
    toast.success('AI enhancements applied successfully!');
  };

  const addSection = (sectionType: string) => {
    setResumeData(prev => ({
      ...prev,
      sectionOrder: [...prev.sectionOrder, sectionType]
    }));
    setHasChanges(true);
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personalInfo':
        return (
          <DraggableSection
            id="personalInfo"
            title="Personal Information"
            description="Your contact details and basic information"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={(resumeData.personalInfo as any)?.fullName || ''}
                    onChange={(e) => updateResumeData('personalInfo', { ...resumeData.personalInfo, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={(resumeData.personalInfo as any)?.email || ''}
                    onChange={(e) => updateResumeData('personalInfo', { ...resumeData.personalInfo, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={(resumeData.personalInfo as any)?.phone || ''}
                    onChange={(e) => updateResumeData('personalInfo', { ...resumeData.personalInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={(resumeData.personalInfo as any)?.location || ''}
                    onChange={(e) => updateResumeData('personalInfo', { ...resumeData.personalInfo, location: e.target.value })}
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            </div>
          </DraggableSection>
        );
      
      case 'summary':
        return (
          <DraggableSection
            id="summary"
            title="Professional Summary"
            description="A brief overview of your career and achievements"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={resumeData.summary}
                  onChange={(e) => updateResumeData('summary', e.target.value)}
                  placeholder="Write a brief summary of your professional background and key achievements..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </DraggableSection>
        );
      
      case 'experience':
        return (
          <DraggableSection
            id="experience"
            title="Work Experience"
            description="Your professional work history"
          >
            <div className="space-y-4">
              <div>
                <Label>Work Experience</Label>
                <Textarea
                  value={Array.isArray(resumeData.experience) ? resumeData.experience.join('\n') : ''}
                  onChange={(e) => updateResumeData('experience', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Add your work experience (one per line)..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </DraggableSection>
        );
      
      case 'education':
        return (
          <DraggableSection
            id="education"
            title="Education"
            description="Your educational background"
          >
            <div className="space-y-4">
              <div>
                <Label>Education</Label>
                <Textarea
                  value={Array.isArray(resumeData.education) ? resumeData.education.join('\n') : ''}
                  onChange={(e) => updateResumeData('education', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Add your education (one per line)..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </DraggableSection>
        );
      
      case 'skills':
        return (
          <DraggableSection
            id="skills"
            title="Skills"
            description="Your technical and soft skills"
          >
            <div className="space-y-4">
              <div>
                <Label>Skills</Label>
                <Textarea
                  value={Array.isArray(resumeData.skills) ? resumeData.skills.join('\n') : ''}
                  onChange={(e) => updateResumeData('skills', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Add your skills (one per line)..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </DraggableSection>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ResumeHeader
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={saveResume}
        resumeData={resumeData}
        onEnhancementApplied={handleEnhancementApplied}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Editor Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Resume Builder</h2>
                <p className="text-slate-600">Drag and drop sections to reorder them</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              
            >
              <SortableContext items={resumeData.sectionOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                  {resumeData.sectionOrder.map((sectionId) => (
                    <div key={sectionId}>
                      {renderSection(sectionId)}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Card className="mt-6 border-dashed border-2 border-slate-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 mb-4">Add more sections to your resume</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => addSection('projects')}>
                    Projects
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('certifications')}>
                    Certifications
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection('languages')}>
                    Languages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2">
              <div className="sticky top-24">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <Badge variant="outline" className="mb-2">Live Preview</Badge>
                      <p className="text-sm text-slate-600">This is how your resume will look</p>
                    </div>
                    <Separator className="mb-6" />
                    
                    {/* Resume Preview Content */}
                    <div className="space-y-6 text-sm">
                      {resumeData.sectionOrder.map((sectionId) => (
                        <div key={sectionId} className="preview-section">
                          {sectionId === 'personalInfo' && resumeData.personalInfo && (
                            <div className="text-center mb-6">
                              <h1 className="text-xl font-bold text-slate-900">
                                {(resumeData.personalInfo as any)?.fullName || 'Your Name'}
                              </h1>
                              <p className="text-slate-600">
                                {(resumeData.personalInfo as any)?.email || 'your.email@example.com'}
                              </p>
                            </div>
                          )}
                          
                          {sectionId === 'summary' && resumeData.summary && (
                            <div className="mb-4">
                              <h3 className="font-semibold text-slate-900 mb-2">Professional Summary</h3>
                              <p className="text-slate-700">{resumeData.summary}</p>
                            </div>
                          )}
                          
                          {/* Add other section previews as needed */}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
