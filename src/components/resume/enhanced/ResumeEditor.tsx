
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Trash2, Edit } from 'lucide-react';
import { EditorResume } from '@/types/editor-resume';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ResumeEditorProps {
  data: EditorResume;
  onChange: (data: EditorResume) => void;
  onEnhanceSection: (section: string) => void;
  isEnhancing: boolean;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onEnhanceSection,
  isEnhancing
}) => {
  const updatePersonalInfo = (personalInfo: typeof data.personalInfo) => {
    onChange({ ...data, personalInfo });
  };

  const updateExperience = (experience: typeof data.experience) => {
    onChange({ ...data, experience });
  };

  const updateEducation = (education: typeof data.education) => {
    onChange({ ...data, education });
  };

  const updateSkills = (skills: typeof data.skills) => {
    onChange({ ...data, skills });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resume Editor</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEnhanceSection('all')}
            disabled={isEnhancing}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <PersonalInfoSection
          data={data.personalInfo}
          onChange={updatePersonalInfo}
        />

        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={data.experience.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
            <ExperienceSection
              data={data.experience}
              onChange={updateExperience}
            />
          </SortableContext>
        </DndContext>

        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={data.education.map(edu => edu.id)} strategy={verticalListSortingStrategy}>
            <EducationSection
              data={data.education}
              onChange={updateEducation}
            />
          </SortableContext>
        </DndContext>

        <SkillsSection
          data={data.skills}
          onChange={updateSkills}
        />

        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={data.projects.map(proj => proj.id)} strategy={verticalListSortingStrategy}>
            <ProjectsSection
              data={data.projects}
              onChange={(projects) => onChange({ ...data, projects })}
            />
          </SortableContext>
        </DndContext>
      </div>

    </div>
  );
};
