import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Briefcase, Calendar, MapPin, X, GripVertical } from "lucide-react";
import { EditorExperienceItem } from "@/types/editor-resume";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExperienceSectionProps {
  data: EditorExperienceItem[];
  onChange: (data: EditorExperienceItem[]) => void;
}

interface SortableExperienceItemProps {
  experience: EditorExperienceItem;
  index: number;
  onUpdate: (id: string, field: keyof EditorExperienceItem, value: any) => void;
  onRemove: (id: string) => void;
  onAddAchievement: (id: string) => void;
  onUpdateAchievement: (id: string, index: number, value: string) => void;
  onRemoveAchievement: (id: string, index: number) => void;
}

const SortableExperienceItem: React.FC<SortableExperienceItemProps> = ({
  experience,
  index,
  onUpdate,
  onRemove,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 border-l-4 border-l-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
          <Calendar className="h-4 w-4" />
          Experience #{index + 1}
        </div>
        <Button
          onClick={() => onRemove(experience.id)}
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`title-${experience.id}`}>Job Title *</Label>
          <Input
            id={`title-${experience.id}`}
            value={experience.title}
            onChange={(e) => onUpdate(experience.id, "title", e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div>
          <Label htmlFor={`company-${experience.id}`}>Company *</Label>
          <Input
            id={`company-${experience.id}`}
            value={experience.company}
            onChange={(e) => onUpdate(experience.id, "company", e.target.value)}
            placeholder="e.g., Google Inc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor={`location-${experience.id}`}>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`location-${experience.id}`}
              value={experience.location}
              onChange={(e) => onUpdate(experience.id, "location", e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`start-date-${experience.id}`}>Start Date *</Label>
          <Input
            id={`start-date-${experience.id}`}
            type="month"
            value={experience.startDate}
            onChange={(e) => onUpdate(experience.id, "startDate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`end-date-${experience.id}`}>End Date</Label>
          <Input
            id={`end-date-${experience.id}`}
            type="month"
            value={experience.endDate}
            onChange={(e) => onUpdate(experience.id, "endDate", e.target.value)}
            disabled={experience.endDate === ''}
            placeholder={experience.endDate === '' ? "Present" : ""}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id={`current-${experience.id}`}
          checked={experience.endDate === ''}
          onCheckedChange={(checked) => onUpdate(experience.id, "endDate", checked ? '' : new Date().toISOString().slice(0, 7))}
        />
        <Label htmlFor={`current-${experience.id}`} className="text-sm">
          I currently work here
        </Label>
      </div>

      <div className="mb-4">
        <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
        <Textarea
          id={`description-${experience.id}`}
          value={experience.description}
          onChange={(e) => onUpdate(experience.id, "description", e.target.value)}
          placeholder="Brief description of your role and responsibilities..."
          rows={3}
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Key Achievements & Responsibilities</Label>
          <Button
            onClick={() => onAddAchievement(experience.id)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Achievement
          </Button>
        </div>
        <div className="space-y-2">
          {experience.achievements.map((achievement, achIndex) => (
            <div key={achIndex} className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={achievement}
                  onChange={(e) => onUpdateAchievement(experience.id, achIndex, e.target.value)}
                  placeholder="• Describe a specific achievement with quantifiable results..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              {experience.achievements.length > 1 && (
                <Button
                  onClick={() => onRemoveAchievement(experience.id, achIndex)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive self-start mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Technologies Used (Optional)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {experience.technologies.map((tech, techIndex) => (
            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
              {tech}
              <Button
                onClick={() => {
                  const newTech = experience.technologies.filter((_, i) => i !== techIndex);
                  onUpdate(experience.id, "technologies", newTech);
                }}
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Input
            className="w-32 h-6 text-xs"
            placeholder="Add technology..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !experience.technologies.includes(value)) {
                  onUpdate(experience.id, "technologies", [...experience.technologies, value]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  data,
  onChange,
}) => {
  const addExperience = () => {
    const newExperience: EditorExperienceItem = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      achievements: [""],
      technologies: [],
    };
    onChange([...data, newExperience]);
  };

  const updateExperience = (id: string, field: keyof EditorExperienceItem, value: any) => {
    onChange(
      data.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const addAchievement = (experienceId: string) => {
    const experience = data.find((exp) => exp.id === experienceId);
    if (experience) {
      updateExperience(experienceId, "achievements", [...experience.achievements, ""]);
    }
  };

  const updateAchievement = (experienceId: string, index: number, value: string) => {
    const experience = data.find((exp) => exp.id === experienceId);
    if (experience) {
      const newAchievements = [...experience.achievements];
      newAchievements[index] = value;
      updateExperience(experienceId, "achievements", newAchievements);
    }
  };

  const removeAchievement = (experienceId: string, index: number) => {
    const experience = data.find((exp) => exp.id === experienceId);
    if (experience && experience.achievements.length > 1) {
      const newAchievements = experience.achievements.filter((_, i) => i !== index);
      updateExperience(experienceId, "achievements", newAchievements);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
        <Button onClick={addExperience} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((experience, index) => (
          <SortableExperienceItem
            key={experience.id}
            experience={experience}
            index={index}
            onUpdate={updateExperience}
            onRemove={removeExperience}
            onAddAchievement={addAchievement}
            onUpdateAchievement={updateAchievement}
            onRemoveAchievement={removeAchievement}
          />
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};