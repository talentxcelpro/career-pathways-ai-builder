
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GraduationCap, Calendar, MapPin, X } from "lucide-react";
import { Education } from "@/types/enhanced-resume";

interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  data,
  onChange,
}) => {
  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      honors: "",
      relevantCoursework: [],
    };
    onChange([...data, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange(
      data.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const removeEducation = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  const addCoursework = (educationId: string, course: string) => {
    const education = data.find((edu) => edu.id === educationId);
    if (education && course.trim() && !education.relevantCoursework?.includes(course.trim())) {
      const newCoursework = [...(education.relevantCoursework || []), course.trim()];
      updateEducation(educationId, "relevantCoursework", newCoursework);
    }
  };

  const removeCoursework = (educationId: string, course: string) => {
    const education = data.find((edu) => edu.id === educationId);
    if (education) {
      const newCoursework = (education.relevantCoursework || []).filter(c => c !== course);
      updateEducation(educationId, "relevantCoursework", newCoursework);
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
          <Card key={education.id} className="p-6 border-l-4 border-l-secondary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Education #{index + 1}
              </div>
              <Button
                onClick={() => removeEducation(education.id)}
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
                  onChange={(e) => updateEducation(education.id, "degree", e.target.value)}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor={`school-${education.id}`}>School/University *</Label>
                <Input
                  id={`school-${education.id}`}
                  value={education.school}
                  onChange={(e) => updateEducation(education.id, "school", e.target.value)}
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
                    onChange={(e) => updateEducation(education.id, "location", e.target.value)}
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
                  onChange={(e) => updateEducation(education.id, "startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`end-date-${education.id}`}>End Date</Label>
                <Input
                  id={`end-date-${education.id}`}
                  type="month"
                  value={education.endDate}
                  onChange={(e) => updateEducation(education.id, "endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`gpa-${education.id}`}>GPA (Optional)</Label>
                <Input
                  id={`gpa-${education.id}`}
                  value={education.gpa || ""}
                  onChange={(e) => updateEducation(education.id, "gpa", e.target.value)}
                  placeholder="e.g., 3.8/4.0"
                />
              </div>
              <div>
                <Label htmlFor={`honors-${education.id}`}>Honors/Awards (Optional)</Label>
                <Input
                  id={`honors-${education.id}`}
                  value={education.honors || ""}
                  onChange={(e) => updateEducation(education.id, "honors", e.target.value)}
                  placeholder="e.g., Magna Cum Laude"
                />
              </div>
            </div>

            <div>
              <Label>Relevant Coursework (Optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {(education.relevantCoursework || []).map((course, courseIndex) => (
                  <Badge key={courseIndex} variant="outline" className="flex items-center gap-1">
                    {course}
                    <Button
                      onClick={() => removeCoursework(education.id, course)}
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
                placeholder="Add relevant coursework and press Enter..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addCoursework(education.id, value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          </Card>
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
