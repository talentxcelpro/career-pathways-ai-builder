import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Plus, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  Info
} from "lucide-react";
import { 
  ResumeSection, 
  SectionGroup, 
  SECTION_GROUPS, 
  SECTION_METADATA,
  ResumeSectionType 
} from "@/types/enhanced-resume";
import { DraggableSection } from "../DraggableSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionManagerProps {
  sections: ResumeSection[];
  onSectionsUpdate: (sections: ResumeSection[]) => void;
  className?: string;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  onSectionsUpdate,
  className = ""
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<SectionGroup>>(
    new Set(['basicInfo', 'professional'])
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group sections by their group
  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.group]) {
      acc[section.group] = [];
    }
    acc[section.group].push(section);
    return acc;
  }, {} as Record<SectionGroup, ResumeSection[]>);

  // Sort sections within each group by order
  Object.keys(groupedSections).forEach(group => {
    groupedSections[group as SectionGroup].sort((a, b) => a.order - b.order);
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        // Update order numbers
        const updatedSections = newSections.map((section, index) => ({
          ...section,
          order: index + 1
        }));
        onSectionsUpdate(updatedSections);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    onSectionsUpdate(updatedSections);
  };

  const toggleGroup = (group: SectionGroup) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const enableAllInGroup = (group: SectionGroup) => {
    const updatedSections = sections.map(section =>
      section.group === group
        ? { ...section, enabled: true }
        : section
    );
    onSectionsUpdate(updatedSections);
  };

  const disableAllInGroup = (group: SectionGroup) => {
    const updatedSections = sections.map(section =>
      section.group === group && !SECTION_METADATA[section.type].required
        ? { ...section, enabled: false }
        : section
    );
    onSectionsUpdate(updatedSections);
  };

  const getEnabledCount = (group: SectionGroup) => {
    return groupedSections[group]?.filter(section => section.enabled).length || 0;
  };

  const getTotalCount = (group: SectionGroup) => {
    return groupedSections[group]?.length || 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Section Manager
          </h3>
          <p className="text-sm text-muted-foreground">
            Enable, disable, and reorder resume sections
          </p>
        </div>
        <Badge variant="outline">
          {sections.filter(s => s.enabled).length} / {sections.length} enabled
        </Badge>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {Object.entries(SECTION_GROUPS).map(([groupKey, groupInfo]) => {
            const group = groupKey as SectionGroup;
            const groupSections = groupedSections[group] || [];
            const isExpanded = expandedGroups.has(group);
            const enabledCount = getEnabledCount(group);
            const totalCount = getTotalCount(group);

            return (
              <Card key={group} className={`border-2 ${groupInfo.color}`}>
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                          <div>
                            <CardTitle className="text-base">{groupInfo.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {groupInfo.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
                            {enabledCount} / {totalCount}
                          </Badge>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      enableAllInGroup(group);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Enable all sections</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      disableAllInGroup(group);
                                    }}
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Disable optional sections</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <SortableContext
                        items={groupSections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {groupSections.map((section) => {
                            const metadata = SECTION_METADATA[section.type];
                            return (
                              <DraggableSection
                                key={section.id}
                                id={section.id}
                                title={metadata.title}
                                description={metadata.description}
                                actions={
                                  <div className="flex items-center gap-2">
                                    {metadata.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Info className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <div className="space-y-2">
                                            <p className="font-medium">{metadata.title}</p>
                                            <p className="text-xs">{metadata.description}</p>
                                            <div>
                                              <p className="text-xs font-medium">Recommended for:</p>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {metadata.recommendedFor.map(role => (
                                                  <Badge key={role} variant="outline" className="text-xs">
                                                    {role}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <Switch
                                      checked={section.enabled}
                                      onCheckedChange={() => toggleSection(section.id)}
                                      disabled={metadata.required}
                                    />
                                  </div>
                                }
                              >
                                <div className="text-sm text-muted-foreground">
                                  {section.enabled ? 'Section is visible in resume' : 'Section is hidden'}
                                </div>
                              </DraggableSection>
                            );
                          })}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};