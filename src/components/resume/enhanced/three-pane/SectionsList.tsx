import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import { SectionType, SectionInfo } from '../ThreePaneResumeBuilder';

interface SectionsListProps {
  sections: SectionInfo[];
  selectedSection: SectionType;
  onSectionSelect: (sectionId: SectionType, itemIndex?: number) => void;
  onSectionReorder: (sectionIds: SectionType[]) => void;
}

interface SortableSectionItemProps {
  section: SectionInfo;
  isSelected: boolean;
  onSelect: (sectionId: SectionType) => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isSelected,
  onSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : 'bg-card hover:bg-muted/50 border-border'
      }`}
      onClick={() => onSelect(section.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-shrink-0 text-muted-foreground">
        {section.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{section.name}</h3>
      </div>
      
      <div className="flex-shrink-0 flex items-center gap-2">
        {section.itemCount > 0 && (
          <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
            {section.itemCount}
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(section.id);
          }}
        >
          <span className="text-xs">Edit</span>
        </Button>
      </div>
    </div>
  );
};

export const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  selectedSection,
  onSectionSelect,
  onSectionReorder
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over.id);
      
      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      onSectionReorder(reorderedSections.map(s => s.id));
    }
  };

  const handleAddSection = () => {
    // TODO: Implement add section functionality
    console.log('Add new section');
  };

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resume Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isSelected={selectedSection === section.id}
                onSelect={onSectionSelect}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSection}
          className="w-full mt-4 gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};