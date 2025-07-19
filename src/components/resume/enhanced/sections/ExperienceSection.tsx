
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Briefcase, Calendar, MapPin, X } from "lucide-react";
import { Experience } from "@/types/enhanced-resume";

interface ExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  data,
  onChange,
}) => {
  const addExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      description: "",
      achievements: [""],
      skills: [],
    };
    onChange([...data, newExperience]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
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
          <Card key={experience.id} className="p-6 border-l-4 border-l-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Experience #{index + 1}
              </div>
              <Button
                onClick={() => removeExperience(experience.id)}
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
                  onChange={(e) => updateExperience(experience.id, "title", e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor={`company-${experience.id}`}>Company *</Label>
                <Input
                  id={`company-${experience.id}`}
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                  placeholder="e.g., Google Inc."
                />
              </div>
              <div>
                <Label htmlFor={`location-${experience.id}`}>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`location-${experience.id}`}
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, "location", e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${experience.id}`}
                  checked={experience.isCurrentRole}
                  onCheckedChange={(checked) => updateExperience(experience.id, "isCurrentRole", checked)}
                />
                <Label htmlFor={`current-${experience.id}`} className="text-sm">
                  I currently work here
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`start-date-${experience.id}`}>Start Date *</Label>
                <Input
                  id={`start-date-${experience.id}`}
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, "startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`end-date-${experience.id}`}>End Date</Label>
                <Input
                  id={`end-date-${experience.id}`}
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, "endDate", e.target.value)}
                  disabled={experience.isCurrentRole}
                  placeholder={experience.isCurrentRole ? "Present" : ""}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
              <Textarea
                id={`description-${experience.id}`}
                value={experience.description}
                onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                placeholder="Brief description of your role and responsibilities..."
                rows={3}
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Key Achievements & Responsibilities</Label>
                <Button
                  onClick={() => addAchievement(experience.id)}
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
                        onChange={(e) => updateAchievement(experience.id, achIndex, e.target.value)}
                        placeholder="• Describe a specific achievement with quantifiable results..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    {experience.achievements.length > 1 && (
                      <Button
                        onClick={() => removeAchievement(experience.id, achIndex)}
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
              <Label>Skills Used (Optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {experience.skills.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <Button
                      onClick={() => {
                        const newSkills = experience.skills.filter((_, i) => i !== skillIndex);
                        updateExperience(experience.id, "skills", newSkills);
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
                  placeholder="Add skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !experience.skills.includes(value)) {
                        updateExperience(experience.id, "skills", [...experience.skills, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </Card>
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
