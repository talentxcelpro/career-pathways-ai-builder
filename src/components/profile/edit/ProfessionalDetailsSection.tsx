import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Briefcase, Calendar } from 'lucide-react';

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  location: string;
}

interface ProfessionalDetailsSectionProps {
  formData: {
    industry: string;
    experience_years: number;
    current_company: string;
    work_experiences?: WorkExperience[];
  };
  onFieldChange: (field: string, value: string | number | WorkExperience[]) => void;
}

export const ProfessionalDetailsSection: React.FC<ProfessionalDetailsSectionProps> = ({ 
  formData, 
  onFieldChange 
}) => {
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(
    (formData.work_experiences || []).map(exp => ({
      ...exp,
      isCurrent: Boolean(exp.isCurrent ?? (exp as any).is_current ?? false)
    }))
  );

  // Sync state if parent formData loads asynchronously from server
  useEffect(() => {
    if (formData.work_experiences && formData.work_experiences.length > 0) {
      setWorkExperiences(
        formData.work_experiences.map(exp => ({
          ...exp,
          isCurrent: Boolean(exp.isCurrent ?? (exp as any).is_current ?? false)
        }))
      );
    }
  }, [formData.work_experiences]);

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      location: ''
    };
    setWorkExperiences(prev => {
      const updated = [...prev, newExperience];
      onFieldChange('work_experiences', updated);
      return updated;
    });
  };

  const removeExperience = (id: string) => {
    setWorkExperiences(prev => {
      const updated = prev.filter(exp => exp.id !== id);
      onFieldChange('work_experiences', updated);
      return updated;
    });
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setWorkExperiences(prev => {
      const updated = prev.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      );
      onFieldChange('work_experiences', updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>Your industry and overall experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => onFieldChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Media">Media & Entertainment</SelectItem>
                  <SelectItem value="Non-profit">Non-profit</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Total Years of Experience</label>
              <Input
                type="number"
                value={formData.experience_years}
                onChange={(e) => onFieldChange('experience_years', parseInt(e.target.value) || 0)}
                placeholder="5"
                min="0"
                max="50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Current Company</label>
              <Input
                value={formData.current_company}
                onChange={(e) => onFieldChange('current_company', e.target.value)}
                placeholder="Company name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
            <CardDescription>
              Add your work history to showcase your career progression
            </CardDescription>
          </div>
          <Button 
            onClick={addExperience}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {workExperiences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No work experience added yet</p>
              <p className="text-sm">Click "Add Experience" to get started</p>
            </div>
          ) : (
            workExperiences.map((experience, index) => (
              <div key={experience.id} className="space-y-4">
                {index > 0 && <Separator />}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Experience {index + 1}
                    </Badge>
                    {experience.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => removeExperience(experience.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Name *</label>
                    <Input
                      value={experience.company}
                      onChange={(e) => updateExperience(experience.id, { company: e.target.value })}
                      placeholder="e.g. Google, Microsoft, Startup Inc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title *</label>
                    <Input
                      value={experience.position}
                      onChange={(e) => updateExperience(experience.id, { position: e.target.value })}
                      placeholder="e.g. Software Engineer, Marketing Manager"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(experience.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <div className="space-y-2">
                      <Input
                        type="month"
                        value={experience.isCurrent ? '' : (experience.endDate || '')}
                        onChange={(e) => updateExperience(experience.id, { endDate: e.target.value })}
                        disabled={Boolean(experience.isCurrent)}
                        placeholder={experience.isCurrent ? "Present" : undefined}
                        className={experience.isCurrent ? "bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed opacity-75" : ""}
                      />
                      <label className="flex items-center space-x-2 text-sm cursor-pointer select-none py-1 group">
                        <input
                          type="checkbox"
                          checked={Boolean(experience.isCurrent)}
                          onChange={(e) => {
                            const isNowCurrent = e.target.checked;
                            updateExperience(experience.id, {
                              isCurrent: isNowCurrent,
                              endDate: isNowCurrent ? '' : experience.endDate
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                          I currently work here
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      value={experience.location}
                      onChange={(e) => updateExperience(experience.id, { location: e.target.value })}
                      placeholder="e.g. New York, NY or Remote"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={experience.description}
                      onChange={(e) => updateExperience(experience.id, { description: e.target.value })}
                      placeholder="Describe your key responsibilities, achievements, and impact in this role..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};