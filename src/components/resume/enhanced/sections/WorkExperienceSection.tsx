import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Calendar, Building2 } from "lucide-react";
import { WorkExperience } from "@/types/enhanced-resume";

interface WorkExperienceSectionProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  data,
  onChange,
}) => {
  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      current: false,
      description: "",
      achievements: [],
      skills: [],
      technologies: [],
    };
    onChange([...data, newExperience]);
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
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
    updateExperience(experienceId, "achievements", [
      ...data.find(exp => exp.id === experienceId)?.achievements || [],
      ""
    ]);
  };

  const updateAchievement = (experienceId: string, index: number, value: string) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = [...experience.achievements];
      newAchievements[index] = value;
      updateExperience(experienceId, "achievements", newAchievements);
    }
  };

  const removeAchievement = (experienceId: string, index: number) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.filter((_, i) => i !== index);
      updateExperience(experienceId, "achievements", newAchievements);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Work Experience
        </CardTitle>
        <Button onClick={addExperience} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((experience, index) => (
          <Card key={experience.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`job-title-${experience.id}`}>Job Title *</Label>
                      <Input
                        id={`job-title-${experience.id}`}
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
                        placeholder="e.g., Tech Corp Inc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`location-${experience.id}`}>Location</Label>
                      <Input
                        id={`location-${experience.id}`}
                        value={experience.location}
                        onChange={(e) => updateExperience(experience.id, "location", e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`start-date-${experience.id}`}>Start Date</Label>
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
                        disabled={experience.current}
                        placeholder={experience.current ? "Present" : ""}
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id={`current-role-${experience.id}`}
                          checked={experience.current}
                          onChange={(e) => {
                            updateExperience(experience.id, "current", e.target.checked);
                            if (e.target.checked) {
                              updateExperience(experience.id, "endDate", "");
                            }
                          }}
                        />
                        <Label htmlFor={`current-role-${experience.id}`} className="text-sm">
                          I currently work here
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => removeExperience(experience.id)}
                  size="sm"
                  variant="outline"
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
                <Textarea
                  id={`description-${experience.id}`}
                  value={experience.description}
                  onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                  placeholder="Describe your role and responsibilities..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Key Achievements</Label>
                  <Button
                    onClick={() => addAchievement(experience.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Achievement
                  </Button>
                </div>
                {experience.achievements.map((achievement, achievementIndex) => (
                  <div key={achievementIndex} className="flex gap-2 mb-2">
                    <Input
                      value={achievement}
                      onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                      placeholder="e.g., Increased team productivity by 30%"
                    />
                    <Button
                      onClick={() => removeAchievement(experience.id, achievementIndex)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor={`technologies-${experience.id}`}>Technologies Used</Label>
                <Input
                  id={`technologies-${experience.id}`}
                  value={experience.technologies.join(", ")}
                  onChange={(e) => updateExperience(experience.id, "technologies", 
                    e.target.value.split(",").map(tech => tech.trim()).filter(Boolean)
                  )}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};