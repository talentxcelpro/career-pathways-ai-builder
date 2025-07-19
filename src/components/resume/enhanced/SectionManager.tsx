
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  GripVertical, 
  Plus, 
  Eye, 
  EyeOff, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Heart 
} from "lucide-react";

interface SectionManagerProps {
  resumeData: any;
  onUpdateData: (updates: any) => void;
  onClose: () => void;
}

const availableSections = [
  { id: 'personalInfo', title: 'Personal Information', icon: User, required: true },
  { id: 'summary', title: 'Professional Summary', icon: User, required: false },
  { id: 'experience', title: 'Work Experience', icon: Briefcase, required: false },
  { id: 'education', title: 'Education', icon: GraduationCap, required: false },
  { id: 'skills', title: 'Skills', icon: Award, required: false },
  { id: 'projects', title: 'Projects', icon: Code, required: false },
  { id: 'certifications', title: 'Certifications', icon: Award, required: false },
  { id: 'volunteer', title: 'Volunteer Experience', icon: Heart, required: false },
  { id: 'languages', title: 'Languages', icon: Award, required: false },
  { id: 'awards', title: 'Awards & Achievements', icon: Award, required: false }
];

export const SectionManager: React.FC<SectionManagerProps> = ({
  resumeData,
  onUpdateData,
  onClose
}) => {
  const [sectionOrder, setSectionOrder] = useState(() => {
    // Get current sections in order
    const currentSections = availableSections.filter(section => 
      resumeData[section.id] || section.required
    );
    return currentSections.map(section => section.id);
  });

  const [visibleSections, setVisibleSections] = useState(() => {
    return new Set(Object.keys(resumeData).filter(key => 
      availableSections.some(section => section.id === key)
    ));
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(sectionOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setSectionOrder(newOrder);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const newVisible = new Set(visibleSections);
    if (newVisible.has(sectionId)) {
      newVisible.delete(sectionId);
    } else {
      newVisible.add(sectionId);
    }
    setVisibleSections(newVisible);
  };

  const addSection = (sectionId: string) => {
    if (!visibleSections.has(sectionId)) {
      setVisibleSections(new Set([...visibleSections, sectionId]));
      setSectionOrder([...sectionOrder, sectionId]);
      
      // Initialize empty data for the section
      const updates: any = {};
      if (sectionId === 'projects') {
        updates.projects = [];
      } else if (sectionId === 'certifications') {
        updates.certifications = [];
      } else if (sectionId === 'volunteer') {
        updates.volunteer = [];
      } else if (sectionId === 'languages') {
        updates.languages = [];
      } else if (sectionId === 'awards') {
        updates.awards = [];
      }
      
      onUpdateData(updates);
    }
  };

  const applySectionOrder = () => {
    // Apply the new section order and visibility
    const orderedData: any = {};
    
    sectionOrder.forEach(sectionId => {
      if (visibleSections.has(sectionId) && resumeData[sectionId]) {
        orderedData[sectionId] = resumeData[sectionId];
      }
    });

    onUpdateData({ ...resumeData, ...orderedData, _sectionOrder: sectionOrder });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Resume Sections</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Current Sections */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Current Sections</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {sectionOrder.map((sectionId, index) => {
                      const section = availableSections.find(s => s.id === sectionId);
                      if (!section) return null;

                      const Icon = section.icon;
                      const isVisible = visibleSections.has(sectionId);

                      return (
                        <Draggable key={sectionId} draggableId={sectionId} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'shadow-lg' : ''} ${!isVisible ? 'opacity-50' : ''}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:cursor-grabbing"
                                    >
                                      <GripVertical className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Icon className="h-5 w-5 text-slate-600" />
                                    <div>
                                      <h4 className="font-medium">{section.title}</h4>
                                      {section.required && (
                                        <Badge variant="secondary" className="text-xs">Required</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleSectionVisibility(sectionId)}
                                      disabled={section.required}
                                    >
                                      {isVisible ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Available Sections to Add */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Add Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSections
                .filter(section => !visibleSections.has(section.id))
                .map(section => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => addSection(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })
              }
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={applySectionOrder}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
