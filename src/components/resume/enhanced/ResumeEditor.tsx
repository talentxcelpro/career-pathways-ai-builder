
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, User, Briefcase, GraduationCap, Award, Code, FileText } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableSection } from "@/components/resume/DraggableSection";

interface ResumeEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  // Section management
  const [sectionOrder, setSectionOrder] = useState([
    'personalInfo',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'awards'
  ]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Update functions
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...(data.experience || [])];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    onChange({
      ...data,
      experience: newExperience
    });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...(data.experience || []),
        {
          id: `exp-${Date.now()}`,
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const newExperience = [...(data.experience || [])];
    newExperience.splice(index, 1);
    onChange({
      ...data,
      experience: newExperience
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...(data.education || [])];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    onChange({
      ...data,
      education: newEducation
    });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...(data.education || []),
        {
          id: `edu-${Date.now()}`,
          degree: '',
          school: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const newEducation = [...(data.education || [])];
    newEducation.splice(index, 1);
    onChange({
      ...data,
      education: newEducation
    });
  };

  const updateSkills = (newSkills: string[]) => {
    onChange({
      ...data,
      skills: newSkills
    });
  };

  const addSkill = () => {
    const currentSkills = Array.isArray(data.skills) ? data.skills : [];
    updateSkills([...currentSkills, '']);
  };

  const updateSkill = (index: number, value: string) => {
    const currentSkills = Array.isArray(data.skills) ? [...data.skills] : [];
    currentSkills[index] = value;
    updateSkills(currentSkills);
  };

  const removeSkill = (index: number) => {
    const currentSkills = Array.isArray(data.skills) ? [...data.skills] : [];
    currentSkills.splice(index, 1);
    updateSkills(currentSkills);
  };

  const updateProjects = (index: number, field: string, value: string) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    onChange({
      ...data,
      projects: newProjects
    });
  };

  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        {
          id: `proj-${Date.now()}`,
          title: '',
          description: '',
          technologies: [],
          startDate: '',
          endDate: '',
          url: ''
        }
      ]
    });
  };

  const removeProject = (index: number) => {
    const newProjects = [...(data.projects || [])];
    newProjects.splice(index, 1);
    onChange({
      ...data,
      projects: newProjects
    });
  };

  // Section renderers
  const renderPersonalInfoSection = () => (
    <DraggableSection
      id="personalInfo"
      title="Personal Information"
      description="Your basic contact information"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={data?.personalInfo?.fullName || ''}
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data?.personalInfo?.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data?.personalInfo?.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data?.personalInfo?.location || ''}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder="Enter your location"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={data?.personalInfo?.summary || ''}
            onChange={(e) => updatePersonalInfo('summary', e.target.value)}
            placeholder="Enter your professional summary"
            rows={4}
          />
        </div>
      </div>
    </DraggableSection>
  );

  const renderExperienceSection = () => (
    <DraggableSection
      id="experience"
      title="Experience"
      description="Your work history and achievements"
      actions={
        <Button onClick={addExperience} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      }
    >
      <div className="space-y-4">
        {data?.experience?.map((exp: any, index: number) => (
          <div key={exp.id || index} className="border rounded-lg p-4 space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm text-muted-foreground">Experience {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={exp.title || ''}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  value={exp.startDate || ''}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  value={exp.endDate || ''}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={exp.description || ''}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                placeholder="Describe your role and achievements"
                rows={3}
              />
            </div>
          </div>
        ))}
        {(!data?.experience || data.experience.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No experience added yet. Click "Add Experience" to get started.</p>
          </div>
        )}
      </div>
    </DraggableSection>
  );

  const renderEducationSection = () => (
    <DraggableSection
      id="education"
      title="Education"
      description="Your educational background"
      actions={
        <Button onClick={addEducation} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      }
    >
      <div className="space-y-4">
        {data?.education?.map((edu: any, index: number) => (
          <div key={edu.id || index} className="border rounded-lg p-4 space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm text-muted-foreground">Education {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Degree</Label>
                <Input
                  value={edu.degree || ''}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="Enter degree"
                />
              </div>
              <div>
                <Label>School</Label>
                <Input
                  value={edu.school || ''}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  value={edu.startDate || ''}
                  onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  value={edu.endDate || ''}
                  onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                  placeholder="MM/YYYY"
                />
              </div>
            </div>
          </div>
        ))}
        {(!data?.education || data.education.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No education added yet. Click "Add Education" to get started.</p>
          </div>
        )}
      </div>
    </DraggableSection>
  );

  const renderSkillsSection = () => (
    <DraggableSection
      id="skills"
      title="Skills"
      description="Your technical and professional skills"
      actions={
        <Button onClick={addSkill} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      }
    >
      <div className="space-y-4">
        {Array.isArray(data?.skills) && data.skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.skills.map((skill: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  placeholder="Enter a skill"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet. Click "Add Skill" to get started.</p>
          </div>
        )}
      </div>
    </DraggableSection>
  );

  const renderProjectsSection = () => (
    <DraggableSection
      id="projects"
      title="Projects"
      description="Your notable projects and work"
      actions={
        <Button onClick={addProject} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      }
    >
      <div className="space-y-4">
        {data?.projects?.map((project: any, index: number) => (
          <div key={project.id || index} className="border rounded-lg p-4 space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm text-muted-foreground">Project {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Project Title</Label>
                <Input
                  value={project.title || ''}
                  onChange={(e) => updateProjects(index, 'title', e.target.value)}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label>URL (optional)</Label>
                <Input
                  value={project.url || ''}
                  onChange={(e) => updateProjects(index, 'url', e.target.value)}
                  placeholder="Project website or repository"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={project.description || ''}
                onChange={(e) => updateProjects(index, 'description', e.target.value)}
                placeholder="Describe the project and your role"
                rows={3}
              />
            </div>
          </div>
        ))}
        {(!data?.projects || data.projects.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No projects added yet. Click "Add Project" to get started.</p>
          </div>
        )}
      </div>
    </DraggableSection>
  );

  const renderCertificationsSection = () => (
    <DraggableSection
      id="certifications"
      title="Certifications"
      description="Your professional certifications"
    >
      <div className="text-center py-8 text-muted-foreground">
        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Certifications section coming soon</p>
      </div>
    </DraggableSection>
  );

  const renderAwardsSection = () => (
    <DraggableSection
      id="awards"
      title="Awards"
      description="Your achievements and recognition"
    >
      <div className="text-center py-8 text-muted-foreground">
        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Awards section coming soon</p>
      </div>
    </DraggableSection>
  );

  const sectionRenderers = {
    personalInfo: renderPersonalInfoSection,
    experience: renderExperienceSection,
    education: renderEducationSection,
    skills: renderSkillsSection,
    projects: renderProjectsSection,
    certifications: renderCertificationsSection,
    awards: renderAwardsSection,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Drag & Drop Sections</h3>
        </div>
        <p className="text-sm text-blue-700">
          Customize your resume layout by dragging sections to reorder them. Click the grip icon to move sections around.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {sectionOrder.map((sectionId) => {
              const renderer = sectionRenderers[sectionId as keyof typeof sectionRenderers];
              return renderer ? renderer() : null;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
