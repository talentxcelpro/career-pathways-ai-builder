
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Resume, ResumeExperience, ResumeEducation, ResumeSkill } from '@/types/resume';

interface ResumeEditorProps {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ resume, onChange }) => {
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resume,
      personalInfo: { ...resume.personalInfo, [field]: value }
    });
  };

  const updateSummary = (summary: string) => {
    onChange({ ...resume, summary });
  };

  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    onChange({
      ...resume,
      experience: [...resume.experience, newExp]
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onChange({
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resume,
      experience: resume.experience.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: ''
    };
    onChange({
      ...resume,
      education: [...resume.education, newEdu]
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...resume,
      education: resume.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = (category: 'technical' | 'soft' | 'language') => {
    const newSkill: ResumeSkill = {
      id: Date.now().toString(),
      name: '',
      category
    };
    onChange({
      ...resume,
      skills: [...resume.skills, newSkill]
    });
  };

  const updateSkill = (id: string, field: string, value: string) => {
    onChange({
      ...resume,
      skills: resume.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeSkill = (id: string) => {
    onChange({
      ...resume,
      skills: resume.skills.filter(skill => skill.id !== id)
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
            <Input
              placeholder="Full Name"
              value={resume.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={resume.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={resume.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            />
            <Input
              placeholder="Location"
              value={resume.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
            />
            <Input
              placeholder="Website (optional)"
              value={resume.personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
            />
            <Input
              placeholder="LinkedIn (optional)"
              value={resume.personalInfo.linkedin || ''}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write a compelling summary of your professional background..."
            value={resume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button onClick={addExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.experience.map((exp, index) => (
            <div key={exp.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Experience {index + 1}</span>
                </div>
                <Button 
                  onClick={() => removeExperience(exp.id)} 
                  variant="ghost" 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                />
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                />
                <Input
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  />
                  <Input
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    disabled={exp.current}
                  />
                </div>
              </div>
              
              <Textarea
                placeholder="Describe your role and achievements..."
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button onClick={addEducation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Education {index + 1}</span>
                <Button 
                  onClick={() => removeEducation(edu.id)} 
                  variant="ghost" 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                />
                <Input
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                />
                <Input
                  placeholder="Location"
                  value={edu.location}
                  onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                />
                <Input
                  placeholder="Graduation Year"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {['technical', 'soft', 'language'].map((category) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium capitalize">{category} Skills</h4>
                <Button 
                  onClick={() => addSkill(category as any)} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {category}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resume.skills
                  .filter(skill => skill.category === category)
                  .map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSkill(skill.id)}
                    >
                      {skill.name}
                      <Trash2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
              </div>
              
              <Input
                placeholder={`Add ${category} skill and press Enter`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addSkill(category as any);
                      const newSkillId = Date.now().toString();
                      updateSkill(newSkillId, 'name', value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
