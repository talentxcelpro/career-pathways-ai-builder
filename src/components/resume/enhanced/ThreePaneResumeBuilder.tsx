import React, { useState, useCallback } from 'react';
import { EditorResume } from '@/types/editor-resume';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Plus, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderOpen, 
  Award, 
  Trophy,
  User,
  Bot,
  Download,
  Save,
  Check
} from 'lucide-react';
import { SectionsList } from './three-pane/SectionsList';
import { DynamicEditor } from './three-pane/DynamicEditor';
import { LivePreview } from './three-pane/LivePreview';
import { TopToolbar } from './three-pane/TopToolbar';
import { useAutoSave } from '@/hooks/useAutoSave';

interface ThreePaneResumeBuilderProps {
  data: EditorResume;
  onChange: (data: EditorResume) => void;
  onSave?: (data: EditorResume) => Promise<void>;
}

export type SectionType = 
  | 'personalInfo'
  | 'summary' 
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteerExperience'
  | 'interests'
  | 'references';

export interface SectionInfo {
  id: SectionType;
  name: string;
  icon: React.ReactNode;
  itemCount: number;
  hasMultipleItems: boolean;
}

export const ThreePaneResumeBuilder: React.FC<ThreePaneResumeBuilderProps> = ({
  data,
  onChange,
  onSave
}) => {
  const [selectedSection, setSelectedSection] = useState<SectionType>('personalInfo');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const { saveStatus, lastSaved } = useAutoSave({
    data,
    saveFunction: onSave,
    delay: 30000,
    enabled: !!onSave
  });

  const getSectionInfo = useCallback((data: EditorResume): SectionInfo[] => {
    return [
      {
        id: 'personalInfo',
        name: 'Personal Info',
        icon: <User className="h-4 w-4" />,
        itemCount: 1,
        hasMultipleItems: false
      },
      {
        id: 'summary',
        name: 'Summary',
        icon: <FileText className="h-4 w-4" />,
        itemCount: data.personalInfo.summary ? 1 : 0,
        hasMultipleItems: false
      },
      {
        id: 'experience',
        name: 'Experience',
        icon: <Briefcase className="h-4 w-4" />,
        itemCount: data.experience.length,
        hasMultipleItems: true
      },
      {
        id: 'education',
        name: 'Education',
        icon: <GraduationCap className="h-4 w-4" />,
        itemCount: data.education.length,
        hasMultipleItems: true
      },
      {
        id: 'skills',
        name: 'Skills',
        icon: <Wrench className="h-4 w-4" />,
        itemCount: data.skills.technical.length + data.skills.soft.length + data.skills.tools.length + data.skills.languages.length,
        hasMultipleItems: false
      },
      {
        id: 'projects',
        name: 'Projects',
        icon: <FolderOpen className="h-4 w-4" />,
        itemCount: data.projects.length,
        hasMultipleItems: true
      },
      {
        id: 'certifications',
        name: 'Certifications',
        icon: <Award className="h-4 w-4" />,
        itemCount: data.certifications.length,
        hasMultipleItems: true
      },
      {
        id: 'awards',
        name: 'Awards',
        icon: <Trophy className="h-4 w-4" />,
        itemCount: data.awards.length,
        hasMultipleItems: true
      },
      {
        id: 'volunteerExperience',
        name: 'Volunteer',
        icon: <User className="h-4 w-4" />,
        itemCount: data.volunteerExperience.length,
        hasMultipleItems: true
      },
      {
        id: 'interests',
        name: 'Interests',
        icon: <User className="h-4 w-4" />,
        itemCount: data.interests.length,
        hasMultipleItems: false
      },
      {
        id: 'references',
        name: 'References',
        icon: <User className="h-4 w-4" />,
        itemCount: data.references.length,
        hasMultipleItems: true
      }
    ];
  }, []);

  const handleSectionReorder = useCallback((sectionIds: SectionType[]) => {
    const updatedSettings = {
      ...data.settings,
      sectionOrder: sectionIds
    };
    onChange({
      ...data,
      settings: updatedSettings
    });
  }, [data, onChange]);

  const handleSectionSelect = useCallback((sectionId: SectionType, itemIndex: number = 0) => {
    setSelectedSection(sectionId);
    setSelectedItemIndex(itemIndex);
  }, []);

  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    const updatedSettings = {
      ...data.settings,
      templateId
    };
    onChange({
      ...data,
      settings: updatedSettings
    });
  }, [data, onChange]);

  const handleATSCheck = useCallback(() => {
    // TODO: Implement ATS check functionality
    console.log('Running ATS check...');
  }, []);

  const handleImproveSection = useCallback(() => {
    // TODO: Implement AI improve section functionality
    console.log('Improving section:', selectedSection);
  }, [selectedSection]);

  const handleExport = useCallback((format: 'pdf' | 'docx') => {
    // TODO: Implement export functionality
    console.log('Exporting as:', format);
  }, []);

  const sections = getSectionInfo(data);

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
        onATSCheck={handleATSCheck}
        onImproveSection={handleImproveSection}
        onExport={handleExport}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Sections List */}
        <div className="w-80 border-r border-border bg-card">
          <SectionsList
            sections={sections}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
            onSectionReorder={handleSectionReorder}
          />
        </div>

        {/* Center Pane - Dynamic Editor */}
        <div className="flex-1 border-r border-border bg-background overflow-auto">
          <DynamicEditor
            data={data}
            onChange={onChange}
            selectedSection={selectedSection}
            selectedItemIndex={selectedItemIndex}
            onItemIndexChange={setSelectedItemIndex}
          />
        </div>

        {/* Right Pane - Live Preview */}
        <div className="w-96 bg-muted/30 overflow-auto">
          <LivePreview
            data={data}
            templateId={selectedTemplate}
          />
        </div>
      </div>
    </div>
  );
};