import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Trash2, GripVertical, Calendar, Users, TrendingUp } from "lucide-react";
import { WorkExperience } from "@/types/enhanced-resume";
import { DraggableSection } from "../../DraggableSection";

interface WorkExperienceSectionProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  data,
  onChange
}) => {
  const [newAchievement, setNewAchievement] = useState<{ [key: string]: string }>({});

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [],
      technologies: [],
      teamSize: undefined,
      reportingTo: ''
    };
    onChange([...data, newExp]);
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange(data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
  };

  const addAchievement = (expId: string) => {
    const achievement = newAchievement[expId]?.trim();
    if (achievement) {
      const exp = data.find(e => e.id === expId);
      if (exp) {
        updateExperience(expId, 'achievements', [...exp.achievements, achievement]);
        setNewAchievement({ ...newAchievement, [expId]: '' });
      }
    }
  };

  const removeAchievement = (expId: string, index: number) => {
    const exp = data.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, 'achievements', exp.achievements.filter((_, i) => i !== index));
    }
  };

  const addTechnology = (expId: string, tech: string) => {
    const exp = data.find(e => e.id === expId);
    if (exp && !exp.technologies?.includes(tech)) {
      updateExperience(expId, 'technologies', [...(exp.technologies || []), tech]);
    }
  };

  const removeTechnology = (expId: string, tech: string) => {
    const exp = data.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, 'technologies', exp.technologies?.filter(t => t !== tech) || []);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
          <Button onClick={addExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((exp, index) => (
              <DraggableSection
                key={exp.id}
                id={exp.id}
                title={exp.title || `Experience ${index + 1}`}
                description={exp.company || 'New position'}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              >
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job Title *</label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company *</label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="TechCorp Inc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reporting To</label>
                      <Input
                        value={exp.reportingTo || ''}
                        onChange={(e) => updateExperience(exp.id, 'reportingTo', e.target.value)}
                        placeholder="Engineering Manager"
                      />
                    </div>
                  </div>

                  {/* Dates and Current Position */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date *
                      </label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onCheckedChange={(checked) => {
                            updateExperience(exp.id, 'current', checked);
                            if (checked) {
                              updateExperience(exp.id, 'endDate', '');
                            }
                          }}
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-sm">
                          Current Position
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Size (Optional)
                      </label>
                      <Select
                        value={exp.teamSize?.toString() || ''}
                        onValueChange={(value) => updateExperience(exp.id, 'teamSize', value ? parseInt(value) : undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Individual contributor</SelectItem>
                          <SelectItem value="2">2-5 people</SelectItem>
                          <SelectItem value="6">6-10 people</SelectItem>
                          <SelectItem value="11">11-20 people</SelectItem>
                          <SelectItem value="21">21-50 people</SelectItem>
                          <SelectItem value="51">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="text-sm font-medium">Job Description</label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Describe your role, responsibilities, and overall impact..."
                      rows={3}
                    />
                  </div>

                  {/* Key Achievements */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Key Achievements
                    </label>
                    <div className="space-y-2 mt-2">
                      {exp.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex items-start gap-2">
                          <div className="text-sm bg-muted rounded p-3 flex-1">
                            {achievement}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(exp.id, achIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={newAchievement[exp.id] || ''}
                          onChange={(e) => setNewAchievement({ ...newAchievement, [exp.id]: e.target.value })}
                          placeholder="Increased team productivity by 40% through process optimization..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addAchievement(exp.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => addAchievement(exp.id)}
                          disabled={!newAchievement[exp.id]?.trim()}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Technologies/Skills Used */}
                  <div>
                    <label className="text-sm font-medium">Technologies & Tools</label>
                    <div className="mt-2">
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {exp.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                              {tech}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeTechnology(exp.id, tech)}
                              >
                                ×
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Input
                        placeholder="Add technologies used (React, Python, AWS, etc.)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const tech = input.value.trim();
                            if (tech) {
                              addTechnology(exp.id, tech);
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </DraggableSection>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Pro Tips for Work Experience
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use action verbs: Led, Developed, Implemented, Achieved</li>
            <li>• Quantify results: "Increased sales by 25%" instead of "Improved sales"</li>
            <li>• Focus on impact and achievements, not just responsibilities</li>
            <li>• List most recent positions first (reverse chronological order)</li>
            <li>• Include relevant technologies and tools you used</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};