
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

        {/* Experience and other sections temporarily disabled until types are fixed */}
        <div className="text-center py-8 text-muted-foreground">
          <p>Resume sections are being updated to the new format...</p>
        </div>
      </div>

    </div>
  );
};
