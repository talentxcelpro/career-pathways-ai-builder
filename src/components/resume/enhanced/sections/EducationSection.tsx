import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Education } from "@/types/enhanced-resume";
import { Separator } from "@/components/ui/separator";

interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  data,
  onChange
}) => {
  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      degree: '',
      field: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      relevantCoursework: [],
      thesis: '',
      advisor: ''
    };
    onChange([...data, newEducation]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange(data.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    ));
  };

  const removeEducation = (id: string) => {
    onChange(data.filter(edu => edu.id !== id));
  };

  const updateCoursework = (id: string, coursework: string) => {
    const courses = coursework.split(',').map(c => c.trim()).filter(c => c);
    updateEducation(id, { relevantCoursework: courses });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Education</h3>
        </div>
        <Button onClick={addEducation} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No education entries yet</p>
            <Button onClick={addEducation} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Education
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <Card key={education.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Education #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(education.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`degree-${education.id}`}>Degree *</Label>
                    <Input
                      id={`degree-${education.id}`}
                      value={education.degree}
                      onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-${education.id}`}>Field of Study *</Label>
                    <Input
                      id={`field-${education.id}`}
                      value={education.field}
                      onChange={(e) => updateEducation(education.id, { field: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`school-${education.id}`}>Institution *</Label>
                    <Input
                      id={`school-${education.id}`}
                      value={education.school}
                      onChange={(e) => updateEducation(education.id, { school: e.target.value })}
                      placeholder="e.g., University of California"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`location-${education.id}`}>Location</Label>
                    <Input
                      id={`location-${education.id}`}
                      value={education.location}
                      onChange={(e) => updateEducation(education.id, { location: e.target.value })}
                      placeholder="e.g., Berkeley, CA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${education.id}`}>Start Date</Label>
                    <Input
                      id={`startDate-${education.id}`}
                      type="month"
                      value={education.startDate}
                      onChange={(e) => updateEducation(education.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`endDate-${education.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${education.id}`}
                      type="month"
                      value={education.endDate}
                      onChange={(e) => updateEducation(education.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`gpa-${education.id}`}>GPA</Label>
                    <Input
                      id={`gpa-${education.id}`}
                      value={education.gpa}
                      onChange={(e) => updateEducation(education.id, { gpa: e.target.value })}
                      placeholder="e.g., 3.8/4.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`honors-${education.id}`}>Honors/Awards</Label>
                    <Input
                      id={`honors-${education.id}`}
                      value={education.honors}
                      onChange={(e) => updateEducation(education.id, { honors: e.target.value })}
                      placeholder="e.g., Summa Cum Laude"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`coursework-${education.id}`}>Relevant Coursework</Label>
                  <Input
                    id={`coursework-${education.id}`}
                    value={education.relevantCoursework?.join(', ') || ''}
                    onChange={(e) => updateCoursework(education.id, e.target.value)}
                    placeholder="e.g., Data Structures, Algorithms, Machine Learning"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple courses with commas
                  </p>
                  {education.relevantCoursework && education.relevantCoursework.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {education.relevantCoursework.map((course, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`thesis-${education.id}`}>Thesis/Capstone</Label>
                    <Input
                      id={`thesis-${education.id}`}
                      value={education.thesis}
                      onChange={(e) => updateEducation(education.id, { thesis: e.target.value })}
                      placeholder="Title of thesis or capstone project"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`advisor-${education.id}`}>Advisor</Label>
                    <Input
                      id={`advisor-${education.id}`}
                      value={education.advisor}
                      onChange={(e) => updateEducation(education.id, { advisor: e.target.value })}
                      placeholder="Name of thesis advisor"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};