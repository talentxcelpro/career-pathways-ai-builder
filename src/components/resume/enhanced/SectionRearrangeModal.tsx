
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, User, FileText, Briefcase, GraduationCap, Code } from 'lucide-react';

interface SectionRearrangeModalProps {
  sections: string[];
  onSave: (newOrder: string[]) => void;
  onCancel: () => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  personalInfo: <User className="h-4 w-4" />,
  professionalSummary: <FileText className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  skills: <Code className="h-4 w-4" />,
};

const sectionLabels: Record<string, string> = {
  personalInfo: 'Personal Information',
  professionalSummary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
  volunteer: 'Volunteer Work',
  tools: 'Tools & Software',
};

export const SectionRearrangeModal: React.FC<SectionRearrangeModalProps> = ({
  sections,
  onSave,
  onCancel
}) => {
  const [orderedSections, setOrderedSections] = useState(sections);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedSections(items);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Drag and drop to reorder the sections in your resume
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {orderedSections.map((sectionId, index) => (
                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            {sectionIcons[sectionId] || <FileText className="h-4 w-4" />}
                            <span className="text-sm font-medium">
                              {sectionLabels[sectionId] || sectionId}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(orderedSections)}>
          Save Order
        </Button>
      </div>
    </div>
  );
};
