
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Trash2, Edit } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface ResumeEditorProps {
  data: EnhancedResumeData;
  onChange: (data: EnhancedResumeData) => void;
  onEnhanceSection: (section: string) => void;
  isEnhancing: boolean;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onEnhanceSection,
  isEnhancing
}) => {
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
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
      ...data,
      experience: [...data.experience, newExp]
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = data.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const removeExperience = (index: number) => {
    onChange({
      ...data,
      experience: data.experience.filter((_, i) => i !== index)
    });
  };

  const addSkill = () => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: '',
      level: 'intermediate' as const,
      category: 'technical'
    };
    onChange({
      ...data,
      skills: [...data.skills, newSkill]
    });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = data.skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    );
    onChange({ ...data, skills: updated });
  };

  const removeSkill = (index: number) => {
    onChange({
      ...data,
      skills: data.skills.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column - Editor */}
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEnhanceSection('personalInfo')}
              disabled={isEnhancing}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              />
              <Input
                placeholder="Location"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Professional Summary"
              value={data.personalInfo.summary}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Experience</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEnhanceSection('experience')}
                disabled={isEnhancing}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={addExperience}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  />
                  <Input
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                  <Input
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Describe your role and achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Skills</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEnhanceSection('skills')}
                disabled={isEnhancing}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={addSkill}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-center gap-4">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Preview */}
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Resume Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-sm">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-bold">{data.personalInfo.fullName || 'Your Name'}</h1>
                <div className="text-muted-foreground mt-1">
                  {data.personalInfo.email} • {data.personalInfo.phone}
                  {data.personalInfo.location && ` • ${data.personalInfo.location}`}
                </div>
              </div>

              {/* Summary */}
              {data.personalInfo.summary && (
                <div>
                  <h2 className="font-semibold mb-2">Professional Summary</h2>
                  <p className="text-muted-foreground">{data.personalInfo.summary}</p>
                </div>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Experience</h2>
                  <div className="space-y-4">
                    {data.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{exp.title || 'Job Title'}</h3>
                            <p className="text-muted-foreground">{exp.company || 'Company Name'}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-muted-foreground mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.name} ({skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
