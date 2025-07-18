
import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Eye, Save, Palette } from "lucide-react";
import { VisualSectionBlock } from "./VisualSectionBlock";
import { TemplateGallery } from "./TemplateGallery";
import { VisualPreview } from "./VisualPreview";
import { ColorCustomizer } from "./ColorCustomizer";
import { ContentAnalyzer } from "./ContentAnalyzer";
import { TalentXcelHeader } from "./TalentXcelHeader";

interface SectionData {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'languages';
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface VisualResumeBuilderProps {
  initialData?: any;
  onSave?: (data: any) => void;
  onExport?: (format: 'pdf' | 'docx') => void;
}

export const VisualResumeBuilder: React.FC<VisualResumeBuilderProps> = ({
  initialData,
  onSave,
  onExport
}) => {
  const [sections, setSections] = useState<SectionData[]>([
    { id: '1', type: 'personal', title: 'Personal Information', content: {}, order: 1, isVisible: true },
    { id: '2', type: 'summary', title: 'Professional Summary', content: '', order: 2, isVisible: true },
    { id: '3', type: 'experience', title: 'Work Experience', content: [], order: 3, isVisible: true },
    { id: '4', type: 'education', title: 'Education', content: [], order: 4, isVisible: true },
    { id: '5', type: 'skills', title: 'Skills', content: [], order: 5, isVisible: true },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');
  const [customization, setCustomization] = useState({
    colorScheme: 'blue',
    fontFamily: 'Inter',
    fontSize: 'medium',
    spacing: 'normal',
    layout: 'classic'
  });
  const [activePanel, setActivePanel] = useState<'editor' | 'templates' | 'colors' | 'analyzer'>('editor');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  }, []);

  const addSection = (type: SectionData['type']) => {
    const newSection: SectionData = {
      id: Date.now().toString(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: type === 'experience' || type === 'education' || type === 'projects' ? [] : '',
      order: sections.length + 1,
      isVisible: true
    };
    setSections([...sections, newSection]);
  };

  const updateSectionContent = (id: string, content: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isVisible: !section.isVisible } : section
    ));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSave = () => {
    const resumeData = {
      sections,
      template: selectedTemplate,
      customization,
      lastModified: new Date().toISOString()
    };
    onSave?.(resumeData);
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    onExport?.(format);
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-background">
        <TalentXcelHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              ← Back to Editor
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('docx')}>
                <Download className="w-4 h-4 mr-2" />
                Download DOCX
              </Button>
            </div>
          </div>
          <VisualPreview
            sections={sections}
            template={selectedTemplate}
            customization={customization}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TalentXcelHeader />
      
      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Controls */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={activePanel === 'editor' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActivePanel('editor')}
              >
                Editor
              </Button>
              <Button
                variant={activePanel === 'templates' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActivePanel('templates')}
              >
                Templates
              </Button>
              <Button
                variant={activePanel === 'colors' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActivePanel('colors')}
              >
                <Palette className="w-4 h-4" />
              </Button>
              <Button
                variant={activePanel === 'analyzer' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setActivePanel('analyzer')}
              >
                Score
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activePanel === 'editor' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Resume Sections</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <VisualSectionBlock
                          key={section.id}
                          section={section}
                          onContentChange={(content) => updateSectionContent(section.id, content)}
                          onToggleVisibility={() => toggleSectionVisibility(section.id)}
                          onRemove={() => removeSection(section.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {activePanel === 'templates' && (
              <TemplateGallery
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
              />
            )}

            {activePanel === 'colors' && (
              <ColorCustomizer
                customization={customization}
                onCustomizationChange={setCustomization}
              />
            )}

            {activePanel === 'analyzer' && (
              <ContentAnalyzer
                sections={sections}
                template={selectedTemplate}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-muted/30">
          <div className="p-4 border-b bg-card">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Live Preview</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" onClick={() => setIsPreviewMode(true)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Full Preview
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 h-full overflow-y-auto">
            <div className="max-w-[21cm] mx-auto bg-white shadow-lg">
              <VisualPreview
                sections={sections}
                template={selectedTemplate}
                customization={customization}
                isEditor={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
