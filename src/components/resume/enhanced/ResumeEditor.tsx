
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ResumeEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...(data.experience || [])];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    onChange({
      ...data,
      experience: newExperience
    });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...(data.experience || []),
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const newExperience = [...(data.experience || [])];
    newExperience.splice(index, 1);
    onChange({
      ...data,
      experience: newExperience
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...(data.education || [])];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    onChange({
      ...data,
      education: newEducation
    });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...(data.education || []),
        {
          degree: '',
          school: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const newEducation = [...(data.education || [])];
    newEducation.splice(index, 1);
    onChange({
      ...data,
      education: newEducation
    });
  };

  const updateSkills = (skills: string[]) => {
    onChange({
      ...data,
      skills: skills
    });
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={data?.personalInfo?.fullName || ''}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data?.personalInfo?.email || ''}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={data?.personalInfo?.phone || ''}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={data?.personalInfo?.location || ''}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="Enter your location"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={data?.personalInfo?.summary || ''}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder="Enter your professional summary"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Experience</CardTitle>
          <Button onClick={addExperience} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.experience?.map((exp: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Experience {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title || ''}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    placeholder="MM/YYYY or Present"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Describe your role and achievements"
                  rows={3}
                />
              </div>
            </div>
          ))}
          {(!data?.experience || data.experience.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No experience added yet. Click "Add Experience" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button onClick={addEducation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.education?.map((edu: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Enter degree"
                  />
                </div>
                <div>
                  <Label>School</Label>
                  <Input
                    value={edu.school || ''}
                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
              </div>
            </div>
          ))}
          {(!data?.education || data.education.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No education added yet. Click "Add Education" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
