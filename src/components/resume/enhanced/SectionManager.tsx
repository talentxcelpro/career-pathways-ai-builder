
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  ResumeSection, 
  SectionGroup, 
  SECTION_GROUPS, 
  SECTION_METADATA, 
  ResumeSectionType 
} from "@/types/enhanced-resume";
import { SortableItem } from './SortableItem';
import { GripVertical, Eye, EyeOff, Plus, Settings } from "lucide-react";

interface SectionManagerProps {
  sections: ResumeSection[];
  onSectionOrderChange: (newOrder: string[]) => void;
  onSectionConfigChange: (newConfig: ResumeSection[]) => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  onSectionOrderChange,
  onSectionConfigChange
}) => {
  const [activeTab, setActiveTab] = useState('organize');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<ResumeSection | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    
    const section = sections.find(s => s.id === active.id);
    setDraggedSection(section || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setDraggedSection(null);
      return;
    }

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    
    const newSections = arrayMove(sections, oldIndex, newIndex);
    const newOrder = newSections.map(s => s.id);
    
    onSectionOrderChange(newOrder);
    onSectionConfigChange(newSections);
    
    setActiveId(null);
    setDraggedSection(null);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    onSectionConfigChange(updatedSections);
  };

  const addSection = (sectionType: ResumeSectionType) => {
    const existingSection = sections.find(s => s.id === sectionType);
    if (existingSection) {
      // Enable if it exists but is disabled
      if (!existingSection.enabled) {
        toggleSectionVisibility(sectionType);
      }
      return;
    }

    const metadata = SECTION_METADATA[sectionType];
    const newSection: ResumeSection = {
      id: sectionType,
      title: metadata.title,
      enabled: true,
      order: sections.length + 1
    };

    const updatedSections = [...sections, newSection];
    onSectionConfigChange(updatedSections);
    onSectionOrderChange(updatedSections.map(s => s.id));
  };

  const enabledSections = sections.filter(s => s.enabled);
  const disabledSections = sections.filter(s => !s.enabled);

  const renderSectionCard = (section: ResumeSection, isDragging = false) => {
    const metadata = SECTION_METADATA[section.id as ResumeSectionType];
    
    return (
      <Card className={`transition-all ${isDragging ? 'opacity-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: `var(--color-${metadata?.color || 'gray'})` }}
                />
                <span className="font-medium">{metadata?.title || section.title}</span>
              </div>
              {section.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSectionVisibility(section.id)}
              >
                {section.enabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {metadata?.description && (
            <p className="text-sm text-gray-600 mt-2 ml-8">
              {metadata.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manage Sections</h2>
          <p className="text-gray-600">Organize and customize your resume sections</p>
        </div>
        <Badge variant="outline">
          {enabledSections.length} of {sections.length} sections enabled
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="organize">Organize</TabsTrigger>
          <TabsTrigger value="add">Add Sections</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="organize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enabled Sections */}
            <div>
              <h3 className="text-lg font-medium mb-4">Enabled Sections</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={enabledSections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {enabledSections.map((section) => (
                      <SortableItem key={section.id} id={section.id}>
                        {renderSectionCard(section)}
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {draggedSection ? renderSectionCard(draggedSection, true) : null}
                </DragOverlay>
              </DndContext>
            </div>

            {/* Disabled Sections */}
            <div>
              <h3 className="text-lg font-medium mb-4">Disabled Sections</h3>
              <div className="space-y-3">
                {disabledSections.map((section) => (
                  <div key={section.id}>
                    {renderSectionCard(section)}
                  </div>
                ))}
                {disabledSections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>All sections are enabled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <div className="grid gap-6">
            {SECTION_GROUPS.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `var(--color-${group.color})` }}
                    />
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.sections.map((sectionType) => {
                      const metadata = SECTION_METADATA[sectionType];
                      const existingSection = sections.find(s => s.id === sectionType);
                      const isEnabled = existingSection?.enabled || false;
                      
                      return (
                        <div key={sectionType} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{metadata.title}</h4>
                            <Button
                              onClick={() => addSection(sectionType)}
                              size="sm"
                              variant={isEnabled ? "outline" : "default"}
                              disabled={isEnabled}
                            >
                              {isEnabled ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{metadata.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.map((section) => {
                  const metadata = SECTION_METADATA[section.id as ResumeSectionType];
                  return (
                    <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `var(--color-${metadata?.color || 'gray'})` }}
                        />
                        <span className="font-medium">{metadata?.title || section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${section.id}`} className="text-sm">
                          {section.enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`toggle-${section.id}`}
                          checked={section.enabled}
                          onCheckedChange={() => toggleSectionVisibility(section.id)}
                          disabled={section.required}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
