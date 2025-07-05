import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

interface DraggableSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({ 
  id, 
  title, 
  description, 
  children, 
  actions 
}) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={`${isDragging ? 'z-50' : ''} relative`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <GripVertical className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};