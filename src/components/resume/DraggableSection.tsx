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
    <Card ref={setNodeRef} style={style} className={`${isDragging ? 'z-50 shadow-2xl' : ''} relative transition-all duration-200 hover:shadow-lg border-slate-200`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-2 hover:bg-slate-100 rounded-lg transition-colors group"
              aria-label={`Drag to reorder ${title}`}
            >
              <GripVertical className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-slate-500 text-sm mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};