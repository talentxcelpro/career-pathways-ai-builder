
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Eye, EyeOff, Trash2, Edit3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SectionData {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'languages';
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface VisualSectionBlockProps {
  section: SectionData;
  onContentChange: (content: any) => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
}

export const VisualSectionBlock: React.FC<VisualSectionBlockProps> = ({
  section,
  onContentChange,
  onToggleVisibility,
  onRemove
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const getSectionIcon = (type: string) => {
    const icons = {
      personal: '👤',
      summary: '📝',
      experience: '💼',
      education: '🎓',
      skills: '⚡',
      projects: '🚀',
      achievements: '🏆',
      languages: '🌍'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getContentPreview = () => {
    if (typeof section.content === 'string') {
      return section.content.substring(0, 50) + (section.content.length > 50 ? '...' : '');
    }
    if (Array.isArray(section.content)) {
      return `${section.content.length} item${section.content.length !== 1 ? 's' : ''}`;
    }
    return 'Click to edit';
  };

  const renderEditor = () => {
    switch (section.type) {
      case 'summary':
        return (
          <div className="space-y-3">
            <Textarea
              value={section.content || ''}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write a compelling professional summary..."
              rows={4}
              className="resize-none"
            />
            <Button size="sm" variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Enhance
            </Button>
          </div>
        );

      case 'personal':
        return (
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Full Name"
              value={section.content?.fullName || ''}
              onChange={(e) => onContentChange({ ...section.content, fullName: e.target.value })}
            />
            <Input
              placeholder="Job Title"
              value={section.content?.title || ''}
              onChange={(e) => onContentChange({ ...section.content, title: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={section.content?.email || ''}
              onChange={(e) => onContentChange({ ...section.content, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={section.content?.phone || ''}
              onChange={(e) => onContentChange({ ...section.content, phone: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={section.content?.location || ''}
              onChange={(e) => onContentChange({ ...section.content, location: e.target.value })}
              className="col-span-2"
            />
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Add skills (comma separated)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value.trim()) {
                    const newSkills = [...(section.content || []), value.trim()];
                    onContentChange(newSkills);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {(section.content || []).map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {skill}
                  <button
                    onClick={() => {
                      const newSkills = section.content.filter((_: any, i: number) => i !== index);
                      onContentChange(newSkills);
                    }}
                    className="ml-2 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <Textarea
            value={typeof section.content === 'string' ? section.content : ''}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={`Add your ${section.type} details...`}
            rows={3}
          />
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`transition-all duration-200 ${isDragging ? 'shadow-lg' : ''} ${!section.isVisible ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 hover:bg-muted rounded"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSectionIcon(section.type)}</span>
                <div>
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <p className="text-xs text-muted-foreground">{getContentPreview()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleVisibility}
              >
                {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isEditing && (
          <CardContent className="pt-0">
            {renderEditor()}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
