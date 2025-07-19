import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ResumeEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const ResumeEditor = ({ content, onChange }: ResumeEditorProps) => {
  const [formData, setFormData] = useState(content || {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: '',
      website: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: []
    },
    projects: [],
    certifications: []
  });

  const updateField = (section: string, field: string, value: any) => {
    const updated = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(updated);
    onChange(updated);
  };

  const updateArrayField = (section: string, index: number, field: string, value: any) => {
    const updated = { ...formData };
    updated[section][index][field] = value;
    setFormData(updated);
    onChange(updated);
  };

  const addArrayItem = (section: string, template: any) => {
    const updated = {
      ...formData,
      [section]: [...(formData[section] || []), template]
    };
    setFormData(updated);
    onChange(updated);
  };

  const removeArrayItem = (section: string, index: number) => {
    const updated = {
      ...formData,
      [section]: formData[section].filter((_: any, i: number) => i !== index)
    };
    setFormData(updated);
    onChange(updated);
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
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.personalInfo?.fullName || ''}
                onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.personalInfo?.email || ''}
                onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.personalInfo?.phone || ''}
                onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.personalInfo?.location || ''}
                onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="text-sm font-medium">LinkedIn</label>
              <Input
                value={formData.personalInfo?.linkedin || ''}
                onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)}
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Website</label>
              <Input
                value={formData.personalInfo?.website || ''}
                onChange={(e) => updateField('personalInfo', 'website', e.target.value)}
                placeholder="yourwebsite.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Professional Summary</label>
            <Textarea
              value={formData.personalInfo?.summary || ''}
              onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
              placeholder="Write a compelling professional summary..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Professional Experience</CardTitle>
              <CardDescription>Add your work experience</CardDescription>
            </div>
            <Button
              onClick={() => addArrayItem('experience', {
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                description: '',
                achievements: [],
                technologies: []
              })}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.experience?.map((exp: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArrayItem('experience', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    value={exp.title || ''}
                    onChange={(e) => updateArrayField('experience', index, 'title', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={exp.company || ''}
                    onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={exp.location || ''}
                    onChange={(e) => updateArrayField('experience', index, 'location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      value={exp.startDate || ''}
                      onChange={(e) => updateArrayField('experience', index, 'startDate', e.target.value)}
                      placeholder="MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      value={exp.endDate || ''}
                      onChange={(e) => updateArrayField('experience', index, 'endDate', e.target.value)}
                      placeholder="MM/YYYY or Present"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={exp.description || ''}
                  onChange={(e) => updateArrayField('experience', index, 'description', e.target.value)}
                  placeholder="Describe your role and achievements..."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </div>
            <Button
              onClick={() => addArrayItem('education', {
                degree: '',
                school: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: '',
                honors: '',
                relevantCoursework: []
              })}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.education?.map((edu: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArrayItem('education', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Degree</label>
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">School</label>
                  <Input
                    value={edu.school || ''}
                    onChange={(e) => updateArrayField('education', index, 'school', e.target.value)}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={edu.location || ''}
                    onChange={(e) => updateArrayField('education', index, 'location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Start Year</label>
                    <Input
                      value={edu.startDate || ''}
                      onChange={(e) => updateArrayField('education', index, 'startDate', e.target.value)}
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Year</label>
                    <Input
                      value={edu.endDate || ''}
                      onChange={(e) => updateArrayField('education', index, 'endDate', e.target.value)}
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>List your technical and soft skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Technical Skills</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.skills?.technical?.map((skill: any, index: number) => {
                // Extract skill name from object or use string directly
                const skillName = typeof skill === 'string' ? skill : skill?.skill || skill?.name || String(skill);
                return (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skillName}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          skills: {
                            ...formData.skills,
                            technical: formData.skills.technical.filter((_: any, i: number) => i !== index)
                          }
                        };
                        setFormData(updated);
                        onChange(updated);
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                );
              }) || []}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add a technical skill..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const skill = input.value.trim();
                    if (skill) {
                      const updated = {
                        ...formData,
                        skills: {
                          ...formData.skills,
                          technical: [...(formData.skills?.technical || []), skill]
                        }
                      };
                      setFormData(updated);
                      onChange(updated);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      {formData.professionalSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Summary</label>
              <Textarea
                value={formData.professionalSummary?.content || ''}
                onChange={(e) => updateField('professionalSummary', 'content', e.target.value)}
                placeholder="Write your professional summary..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {formData.certifications && formData.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Professional certifications and licenses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.certifications?.map((cert: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('certifications', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Certification Name</label>
                    <Input
                      value={cert.name || ''}
                      onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issuing Organization</label>
                    <Input
                      value={cert.issuingOrganization || cert.issuer || ''}
                      onChange={(e) => updateArrayField('certifications', index, 'issuingOrganization', e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issue Date</label>
                    <Input
                      value={cert.issueDate || cert.date || ''}
                      onChange={(e) => updateArrayField('certifications', index, 'issueDate', e.target.value)}
                      placeholder="MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input
                      value={cert.expiryDate || ''}
                      onChange={(e) => updateArrayField('certifications', index, 'expiryDate', e.target.value)}
                      placeholder="MM/YYYY (if applicable)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {formData.projects && formData.projects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Notable projects you have worked on</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.projects?.map((project: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('projects', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Project Title</label>
                    <Input
                      value={project.title || ''}
                      onChange={(e) => updateArrayField('projects', index, 'title', e.target.value)}
                      placeholder="E-commerce Platform"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Technologies</label>
                    <Input
                      value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || ''}
                      onChange={(e) => updateArrayField('projects', index, 'technologies', e.target.value.split(', '))}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={project.description || ''}
                    onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                    placeholder="Describe the project and your contributions..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};