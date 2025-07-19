import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GripVertical, Lightbulb, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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
      website: '',
      portfolio: ''
    },
    professionalSummary: {
      content: '',
      careerBackground: '',
      keySkills: [],
      targetRoles: [],
      goals: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: []
    },
    projects: [],
    certifications: [],
    awards: [],
    languages: [],
    hobbies: [],
    additional: {
      declaration: '',
      references: [],
      availableUponRequest: false
    }
  });

  const calculateCompletionPercentage = (data: any): number => {
    let score = 0;
    const maxScore = 100;
    
    // Personal info (20 points)
    if (data.personalInfo?.fullName) score += 5;
    if (data.personalInfo?.email) score += 5;
    if (data.personalInfo?.phone) score += 5;
    if (data.personalInfo?.location) score += 5;
    
    // Professional summary (15 points)
    if (data.professionalSummary?.content || data.personalInfo?.summary) score += 15;
    
    // Experience (30 points)
    const expCount = data.experience?.length || 0;
    score += Math.min(expCount * 10, 30);
    
    // Education (15 points)
    if (data.education?.length > 0) score += 15;
    
    // Skills (10 points)
    const skillCount = (data.skills?.technical?.length || 0) + (data.skills?.soft?.length || 0);
    score += Math.min(skillCount * 2, 10);
    
    // Additional sections (10 points)
    if (data.certifications?.length > 0) score += 3;
    if (data.projects?.length > 0) score += 3;
    if (data.awards?.length > 0) score += 2;
    if (data.languages?.length > 0) score += 2;
    
    return Math.min(score, maxScore);
  };

  // Sync formData with content changes
  useEffect(() => {
    if (content && JSON.stringify(content) !== JSON.stringify(formData)) {
      setFormData(content);
    }
  }, [content]);

  const completionPercentage = calculateCompletionPercentage(formData);

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
      {/* Completion Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Resume Completion
              </CardTitle>
              <CardDescription>
                Complete all sections for maximum ATS compatibility
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-2" />
          {completionPercentage < 80 && (
            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Add more sections like experience, skills, and certifications to improve your resume score.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
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
            <div>
              <label className="text-sm font-medium">Portfolio</label>
              <Input
                value={formData.personalInfo?.portfolio || ''}
                onChange={(e) => updateField('personalInfo', 'portfolio', e.target.value)}
                placeholder="portfolio.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Professional Summary</label>
            <Textarea
              value={formData.personalInfo?.summary || formData.professionalSummary?.content || ''}
              onChange={(e) => {
                updateField('personalInfo', 'summary', e.target.value);
                updateField('professionalSummary', 'content', e.target.value);
              }}
              placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
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

      {/* Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Showcase your key projects and achievements</CardDescription>
            </div>
            <Button
              onClick={() => addArrayItem('projects', {
                id: `proj_${Date.now()}`,
                title: '',
                description: '',
                technologies: [],
                startDate: '',
                endDate: '',
                githubUrl: '',
                liveUrl: '',
                role: '',
                achievements: []
              })}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
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
                  <label className="text-sm font-medium">Your Role</label>
                  <Input
                    value={project.role || ''}
                    onChange={(e) => updateArrayField('projects', index, 'role', e.target.value)}
                    placeholder="Lead Developer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input
                    value={project.githubUrl || ''}
                    onChange={(e) => updateArrayField('projects', index, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Live Demo URL</label>
                  <Input
                    value={project.liveUrl || ''}
                    onChange={(e) => updateArrayField('projects', index, 'liveUrl', e.target.value)}
                    placeholder="https://project-demo.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                  placeholder="Describe the project, your contributions, and impact..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Technologies Used</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.technologies?.map((tech: string, techIndex: number) => (
                    <Badge key={techIndex} variant="outline" className="flex items-center gap-1">
                      {tech}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          const updated = { ...formData };
                          updated.projects[index].technologies = project.technologies.filter((_: any, i: number) => i !== techIndex);
                          setFormData(updated);
                          onChange(updated);
                        }}
                      >
                        ×
                      </Button>
                    </Badge>
                  )) || []}
                </div>
                <div className="mt-2">
                  <Input
                    placeholder="Add technology (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const tech = input.value.trim();
                        if (tech) {
                          const updated = { ...formData };
                          updated.projects[index].technologies = [...(project.technologies || []), tech];
                          setFormData(updated);
                          onChange(updated);
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Awards */}
      {formData.awards && formData.awards.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Awards & Achievements</CardTitle>
                <CardDescription>Recognition and honors received</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.awards?.map((award: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('awards', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Award Name</label>
                    <Input
                      value={award.name || ''}
                      onChange={(e) => updateArrayField('awards', index, 'name', e.target.value)}
                      placeholder="Employee of the Year"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issuing Organization</label>
                    <Input
                      value={award.issuer || ''}
                      onChange={(e) => updateArrayField('awards', index, 'issuer', e.target.value)}
                      placeholder="Company Name"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Received</label>
                    <Input
                      value={award.date || ''}
                      onChange={(e) => updateArrayField('awards', index, 'date', e.target.value)}
                      placeholder="MM/YYYY"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={award.description || ''}
                    onChange={(e) => updateArrayField('awards', index, 'description', e.target.value)}
                    placeholder="Description of the award and achievement..."
                    rows={2}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {formData.languages && formData.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Languages you speak and proficiency levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.languages?.map((lang: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{lang.language}</div>
                    <Badge variant="secondary">{lang.proficiency}</Badge>
                  </div>
                  {lang.certifications && lang.certifications.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Certifications: {lang.certifications.join(', ')}
                    </div>
                  )}
                </div>
              ))}
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