import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GraduationCap, Calendar, MapPin, X, GripVertical } from "lucide-react";
import { EditorEducationItem } from "@/types/editor-resume";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EducationSectionProps {
  data: EditorEducationItem[];
  onChange: (data: EditorEducationItem[]) => void;
}

interface SortableEducationItemProps {
  education: EditorEducationItem;
  index: number;
  onUpdate: (id: string, field: keyof EditorEducationItem, value: any) => void;
  onRemove: (id: string) => void;
  onAddAchievement: (id: string, achievement: string) => void;
  onRemoveAchievement: (id: string, achievement: string) => void;
}

const SortableEducationItem: React.FC<SortableEducationItemProps> = ({
  education,
  index,
  onUpdate,
  onRemove,
  onAddAchievement,
  onRemoveAchievement
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: education.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 border-l-4 border-l-secondary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
          <Calendar className="h-4 w-4" />
          Education #{index + 1}
        </div>
        <Button
          onClick={() => onRemove(education.id)}
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`degree-${education.id}`}>Degree *</Label>
          <Input
            id={`degree-${education.id}`}
            value={education.degree}
            onChange={(e) => onUpdate(education.id, "degree", e.target.value)}
            placeholder="e.g., Bachelor of Science in Computer Science"
          />
        </div>
        <div>
          <Label htmlFor={`institution-${education.id}`}>School/University *</Label>
          <Input
            id={`institution-${education.id}`}
            value={education.institution}
            onChange={(e) => onUpdate(education.id, "institution", e.target.value)}
            placeholder="e.g., Stanford University"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor={`location-${education.id}`}>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`location-${education.id}`}
              value={education.location}
              onChange={(e) => onUpdate(education.id, "location", e.target.value)}
              placeholder="e.g., Stanford, CA"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`start-date-${education.id}`}>Start Date</Label>
          <Input
            id={`start-date-${education.id}`}
            type="month"
            value={education.startDate}
            onChange={(e) => onUpdate(education.id, "startDate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`end-date-${education.id}`}>End Date</Label>
          <Input
            id={`end-date-${education.id}`}
            type="month"
            value={education.endDate}
            onChange={(e) => onUpdate(education.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor={`description-${education.id}`}>Description (Optional)</Label>
        <Input
          id={`description-${education.id}`}
          value={education.description}
          onChange={(e) => onUpdate(education.id, "description", e.target.value)}
          placeholder="Brief description or notable achievements"
        />
      </div>

      <div>
        <Label>Achievements/Honors (Optional)</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {education.achievements.map((achievement, achievementIndex) => (
            <Badge key={achievementIndex} variant="outline" className="flex items-center gap-1">
              {achievement}
              <Button
                onClick={() => onRemoveAchievement(education.id, achievement)}
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add achievement and press Enter..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = e.currentTarget.value.trim();
              if (value) {
                onAddAchievement(education.id, value);
                e.currentTarget.value = '';
              }
            }
          }}
        />
      </div>
    </Card>
  );
};

export const EducationSection: React.FC<EducationSectionProps> = ({
  data,
  onChange,
}) => {
  const addEducation = () => {
    const newEducation: EditorEducationItem = {
      id: crypto.randomUUID(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      achievements: [],
    };
    onChange([...data, newEducation]);
  };

  const updateEducation = (id: string, field: keyof EditorEducationItem, value: any) => {
    onChange(
      data.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  const addAchievement = (educationId: string, achievement: string) => {
    const education = data.find((edu) => edu.id === educationId);
    if (education && achievement.trim() && !education.achievements.includes(achievement.trim())) {
      const newAchievements = [...education.achievements, achievement.trim()];
      updateEducation(educationId, "achievements", newAchievements);
    }
  };

  const removeAchievement = (educationId: string, achievement: string) => {
    const education = data.find((edu) => edu.id === educationId);
    if (education) {
      const newAchievements = education.achievements.filter(a => a !== achievement);
      updateEducation(educationId, "achievements", newAchievements);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </CardTitle>
        <Button onClick={addEducation} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((education, index) => (
          <SortableEducationItem
            key={education.id}
            education={education}
            index={index}
            onUpdate={updateEducation}
            onRemove={removeEducation}
            onAddAchievement={addAchievement}
            onRemoveAchievement={removeAchievement}
          />
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No education added yet.</p>
            <p className="text-sm">Click "Add Education" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};