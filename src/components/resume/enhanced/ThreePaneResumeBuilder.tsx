import React, { useState, useCallback } from 'react';
import { EditorResume } from '@/types/editor-resume';
import { 
  User, FileText, Briefcase, GraduationCap, Code, 
  FolderOpen, Award, Trophy, Heart, Users, Wrench
} from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionsList } from './three-pane/SectionsList';
import { DynamicEditor } from './three-pane/DynamicEditor';
import { LivePreview } from './three-pane/LivePreview';
import { TopToolbar } from './three-pane/TopToolbar';
import { TemplateSidebar } from './three-pane/TemplateSidebar';
import { UploadResumeDialog } from './three-pane/UploadResumeDialog';
import { ATSCheckDialog } from './three-pane/ATSCheckDialog';
import { ImproveSectionDialog } from './three-pane/ImproveSectionDialog';
import { useAutoSave } from '@/hooks/useAutoSave';
import { VoiceInput } from '../voice/VoiceInput';
import { ResumeAnalytics } from '../analytics/ResumeAnalytics';
import { RealtimeCollaboration } from '../collaboration/RealtimeCollaboration';

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

interface SortablePaneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const SortablePane: React.FC<SortablePaneProps> = ({ id, children, className = '' }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} relative group`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-background/90 backdrop-blur-sm rounded p-2 shadow-md border">
          <div className="w-4 h-4 text-muted-foreground">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <circle cx="5" cy="5" r="1" fill="currentColor"/>
              <circle cx="10" cy="5" r="1" fill="currentColor"/>
              <circle cx="15" cy="5" r="1" fill="currentColor"/>
              <circle cx="5" cy="10" r="1" fill="currentColor"/>
              <circle cx="10" cy="10" r="1" fill="currentColor"/>
              <circle cx="15" cy="10" r="1" fill="currentColor"/>
              <circle cx="5" cy="15" r="1" fill="currentColor"/>
              <circle cx="10" cy="15" r="1" fill="currentColor"/>
              <circle cx="15" cy="15" r="1" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export const ThreePaneResumeBuilder: React.FC<ThreePaneResumeBuilderProps> = ({
  data,
  onChange,
  onSave
}) => {
  const [selectedSection, setSelectedSection] = useState<SectionType>('personalInfo');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [paneOrder, setPaneOrder] = useState(['templates', 'sections', 'editor', 'preview']);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [improveOpen, setImproveOpen] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        icon: <Heart className="h-4 w-4" />,
        itemCount: data.volunteerExperience.length,
        hasMultipleItems: true
      },
      {
        id: 'interests',
        name: 'Interests',
        icon: <Users className="h-4 w-4" />,
        itemCount: data.interests.length,
        hasMultipleItems: false
      },
      {
        id: 'references',
        name: 'References',
        icon: <Users className="h-4 w-4" />,
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
    setAtsOpen(true);
  }, []);

  const handleImproveSection = useCallback(() => {
    setImproveOpen(true);
  }, []);

  const handleExport = useCallback((format: 'pdf' | 'docx') => {
    console.log('Exporting as:', format);
  }, []);

  const handleUploadResume = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  const handleResumeUploaded = useCallback((uploadedData: EditorResume) => {
    onChange(uploadedData);
  }, [onChange]);

  const handleVoiceCommand = useCallback((command: string, commandData: any) => {
    const newData = { ...data };
    
    switch (command) {
      case 'add_experience':
        newData.experience.push({
          id: crypto.randomUUID(),
          title: commandData.title || '',
          company: commandData.company || '',
          location: '',
          startDate: commandData.startDate || '',
          endDate: commandData.endDate || '',
          description: '',
          achievements: [],
          technologies: []
        });
        break;
        
      case 'add_education':
        newData.education.push({
          id: crypto.randomUUID(),
          degree: commandData.degree || '',
          institution: commandData.institution || '',
          location: '',
          startDate: '',
          endDate: '',
          description: commandData.field || '',
          achievements: []
        });
        break;
        
      case 'add_skills':
        if (commandData.skills) {
          newData.skills.technical.push(...commandData.skills);
        }
        break;
        
      case 'add_project':
        newData.projects.push({
          id: crypto.randomUUID(),
          name: commandData.name || '',
          description: commandData.description || '',
          technologies: commandData.technologies || [],
          link: ''
        });
        break;
        
      case 'update_summary':
        newData.personalInfo.summary = commandData.summary || '';
        break;
        
      case 'update_name':
        newData.personalInfo.fullName = commandData.name || '';
        break;
        
      case 'export':
        handleExport(commandData.format);
        return;
        
      default:
        return;
    }
    
    onChange(newData);
  }, [data, onChange, handleExport]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = paneOrder.indexOf(active.id as string);
    const newIndex = paneOrder.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      setPaneOrder(arrayMove(paneOrder, oldIndex, newIndex));
    }
  };

  const sections = getSectionInfo(data);

  const renderPane = (paneId: string) => {
    switch (paneId) {
      case 'templates':
        return (
          <SortablePane id="templates" className="w-80 border-r border-border bg-card">
            <TemplateSidebar
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateChange}
            />
          </SortablePane>
        );
      case 'sections':
        return (
          <SortablePane id="sections" className="w-80 border-r border-border bg-card">
            <SectionsList
              sections={sections}
              selectedSection={selectedSection}
              onSectionSelect={handleSectionSelect}
              onSectionReorder={handleSectionReorder}
            />
          </SortablePane>
        );
      case 'editor':
        return (
          <SortablePane id="editor" className="flex-1 border-r border-border bg-background overflow-auto">
            <DynamicEditor
              data={data}
              onChange={onChange}
              selectedSection={selectedSection}
              selectedItemIndex={selectedItemIndex}
              onItemIndexChange={setSelectedItemIndex}
            />
          </SortablePane>
        );
      case 'preview':
        return (
          <SortablePane id="preview" className="w-96 bg-muted/50 overflow-auto">
            <LivePreview
              data={data}
              templateId={selectedTemplate}
            />
          </SortablePane>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
        onATSCheck={handleATSCheck}
        onImproveSection={handleImproveSection}
        onExport={handleExport}
        onUploadResume={handleUploadResume}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        onToggleVoice={() => setShowVoiceInput(!showVoiceInput)}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        onToggleCollaboration={() => setShowCollaboration(!showCollaboration)}
        showVoice={showVoiceInput}
        showAnalytics={showAnalytics}
        showCollaboration={showCollaboration}
      />
      
      {/* Voice Input Panel */}
      {showVoiceInput && (
        <div className="border-t border-border bg-card p-4">
          <VoiceInput
            onTranscript={(transcript) => console.log('Voice transcript:', transcript)}
            onCommand={handleVoiceCommand}
            placeholder="Say commands like 'Add experience at Google as Software Engineer' or 'Export as PDF'"
          />
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="border-t border-border bg-card p-4 max-h-96 overflow-y-auto">
          <ResumeAnalytics resume={data} />
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <div className="border-t border-border bg-card p-4 max-h-96 overflow-y-auto">
          <RealtimeCollaboration 
            resume={data} 
            onResumeChange={onChange}
            isOwner={true}
          />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          <SortableContext items={paneOrder} strategy={horizontalListSortingStrategy}>
            {paneOrder.map(paneId => renderPane(paneId))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 scale-105 shadow-2xl border-2 border-primary/50 rounded-lg overflow-hidden">
              <div className="bg-background p-4 text-center font-medium">
                {activeId === 'templates' && '📄 Templates'}
                {activeId === 'sections' && '📝 Resume Sections'}
                {activeId === 'editor' && '✏️ Editor'}
                {activeId === 'preview' && '👁️ Live Preview'}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Upload Resume Dialog */}
      <UploadResumeDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onResumeUploaded={handleResumeUploaded}
      />

      {/* ATS Check Dialog */}
      <ATSCheckDialog
        open={atsOpen}
        onOpenChange={setAtsOpen}
        resume={data}
      />

      {/* Improve Section Dialog */}
      <ImproveSectionDialog
        open={improveOpen}
        onOpenChange={setImproveOpen}
        resume={data}
        selectedSection={
          (selectedSection === 'experience' ? 'experience' :
           selectedSection === 'skills' ? 'skills' :
           selectedSection === 'projects' ? 'projects' : 'summary')
        }
        selectedItemIndex={selectedItemIndex}
        onApply={onChange}
      />
    </div>
  );
};