import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorResume } from '@/types/editor-resume';
import { SectionType } from '../ThreePaneResumeBuilder';
import { PersonalInfoSection } from '../sections/PersonalInfoSection';
import { ExperienceSection } from '../sections/ExperienceSection';
import { EducationSection } from '../sections/EducationSection';
import { SkillsSection } from '../sections/SkillsSection';
import { ProjectsSection } from '../sections/ProjectsSection';
import { CertificationsSection } from '../sections/CertificationsSection';
import { AwardsSection } from '../sections/AwardsSection';
import { VolunteerSection } from '../sections/VolunteerSection';
import { ReferencesSection } from '../sections/ReferencesSection';
import { SummarySection } from '../sections/SummarySection';
import { InterestsSection } from '../sections/InterestsSection';

interface DynamicEditorProps {
  data: EditorResume;
  onChange: (data: EditorResume) => void;
  selectedSection: SectionType;
  selectedItemIndex: number;
  onItemIndexChange: (index: number) => void;
}

export const DynamicEditor: React.FC<DynamicEditorProps> = ({
  data,
  onChange,
  selectedSection,
  selectedItemIndex,
  onItemIndexChange
}) => {
  const getSectionTitle = (sectionType: SectionType): string => {
    const titles: Record<SectionType, string> = {
      personalInfo: 'Personal Information',
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications',
      awards: 'Awards',
      volunteerExperience: 'Volunteer Experience',
      interests: 'Interests',
      references: 'References'
    };
    return titles[sectionType];
  };

  const renderSectionEditor = () => {
    switch (selectedSection) {
      case 'personalInfo':
        return (
          <PersonalInfoSection
            data={data.personalInfo}
            onChange={(personalInfo) => onChange({ ...data, personalInfo })}
          />
        );
      
      case 'summary':
        return (
          <SummarySection
            data={data.personalInfo.summary}
            onChange={(summary) => onChange({ 
              ...data, 
              personalInfo: { ...data.personalInfo, summary } 
            })}
          />
        );
      
      case 'experience':
        return (
          <ExperienceSection
            data={data.experience}
            onChange={(experience) => onChange({ ...data, experience })}
          />
        );
      
      case 'education':
        return (
          <EducationSection
            data={data.education}
            onChange={(education) => onChange({ ...data, education })}
          />
        );
      
      case 'skills':
        return (
          <SkillsSection
            data={data.skills}
            onChange={(skills) => onChange({ ...data, skills })}
          />
        );
      
      case 'projects':
        return (
          <ProjectsSection
            data={data.projects}
            onChange={(projects) => onChange({ ...data, projects })}
          />
        );
      
      case 'certifications':
        return (
          <CertificationsSection
            data={data.certifications}
            onChange={(certifications) => onChange({ ...data, certifications })}
            selectedItemIndex={selectedItemIndex}
            onItemIndexChange={onItemIndexChange}
          />
        );
      
      case 'awards':
        return (
          <AwardsSection
            data={data.awards}
            onChange={(awards) => onChange({ ...data, awards })}
            selectedItemIndex={selectedItemIndex}
            onItemIndexChange={onItemIndexChange}
          />
        );
      
      case 'volunteerExperience':
        return (
          <VolunteerSection
            data={data.volunteerExperience}
            onChange={(volunteerExperience) => onChange({ ...data, volunteerExperience })}
            selectedItemIndex={selectedItemIndex}
            onItemIndexChange={onItemIndexChange}
          />
        );
      
      case 'interests':
        return (
          <InterestsSection
            data={data.interests}
            onChange={(interests) => onChange({ ...data, interests })}
          />
        );
      
      case 'references':
        return (
          <ReferencesSection
            data={data.references}
            onChange={(references) => onChange({ ...data, references })}
            selectedItemIndex={selectedItemIndex}
            onItemIndexChange={onItemIndexChange}
          />
        );
      
      default:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <p>Select a section to start editing</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <h2 className="text-xl font-semibold">{getSectionTitle(selectedSection)}</h2>
      </div>
      
      <div className="p-6 overflow-auto">
        {renderSectionEditor()}
      </div>
    </div>
  );
};