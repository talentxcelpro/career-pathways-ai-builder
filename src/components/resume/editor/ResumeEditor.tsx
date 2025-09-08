import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  User, 
  Briefcase, 
  GraduationCap,
  Code,
  Award,
  Globe,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ResumeData } from '../preview/ResumePreview';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  className?: string;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  className = ''
}) => {
  const [skillInput, setSkillInput] = useState('');
  
  const updateData = useCallback((updates: Partial<ResumeData>) => {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  const updateProfile = useCallback((field: string, value: string) => {
    updateData({
      profile: { ...data.profile, [field]: value }
    });
  }, [data.profile, updateData]);

  const addSkill = useCallback(() => {
    if (skillInput.trim()) {
      const newSkills = [...(data.skills || []), skillInput.trim()];
      updateData({ skills: newSkills });
      setSkillInput('');
    }
  }, [skillInput, data.skills, updateData]);

  const removeSkill = useCallback((index: number) => {
    const newSkills = [...(data.skills || [])];
    newSkills.splice(index, 1);
    updateData({ skills: newSkills });
  }, [data.skills, updateData]);

  const addExperience = useCallback(() => {
    const newExperience = [
      ...data.experience,
      { title: '', company: '', startDate: '', endDate: '', bullets: [''], current: false }
    ];
    updateData({ experience: newExperience });
  }, [data.experience, updateData]);

  const updateExperience = useCallback((index: number, field: string, value: any) => {
    const newExperience = [...data.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    updateData({ experience: newExperience });
  }, [data.experience, updateData]);

  const removeExperience = useCallback((index: number) => {
    const newExperience = [...data.experience];
    newExperience.splice(index, 1);
    updateData({ experience: newExperience });
  }, [data.experience, updateData]);

  const addEducation = useCallback(() => {
    const newEducation = [
      ...data.education,
      { school: '', degree: '', year: '', gpa: '' }
    ];
    updateData({ education: newEducation });
  }, [data.education, updateData]);

  const updateEducation = useCallback((index: number, field: string, value: string) => {
    const newEducation = [...data.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateData({ education: newEducation });
  }, [data.education, updateData]);

  const removeEducation = useCallback((index: number) => {
    const newEducation = [...data.education];
    newEducation.splice(index, 1);
    updateData({ education: newEducation });
  }, [data.education, updateData]);

  const addProject = useCallback(() => {
    const newProjects = [
      ...(data.projects || []),
      { name: '', description: '', technologies: [], link: '' }
    ];
    updateData({ projects: newProjects });
  }, [data.projects, updateData]);

  const updateProject = useCallback((index: number, field: string, value: any) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    updateData({ projects: newProjects });
  }, [data.projects, updateData]);

  const removeProject = useCallback((index: number) => {
    const newProjects = [...(data.projects || [])];
    newProjects.splice(index, 1);
    updateData({ projects: newProjects });
  }, [data.projects, updateData]);

  const DatePicker = ({ date, onDateChange, placeholder }: { 
    date: string; 
    onDateChange: (date: string) => void; 
    placeholder: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dateValue = date ? new Date(date) : undefined;

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(new Date(date), "MMM yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onDateChange(selectedDate.toISOString().split('T')[0]);
                setIsOpen(false);
              }
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            More
          </TabsTrigger>
        </TabsList>

        {/* Profile Section */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={data.profile.name || ''}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.profile.email || ''}
                    onChange={(e) => updateProfile('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={data.profile.phone || ''}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={data.profile.location || ''}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={data.profile.website || ''}
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="www.johndoe.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={data.profile.linkedin || ''}
                    onChange={(e) => updateProfile('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={data.summary || ''}
                  onChange={(e) => updateData({ summary: e.target.value })}
                  placeholder="Brief overview of your professional background and career objectives..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Section */}
        <TabsContent value="experience" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Professional Experience</h3>
            <Button onClick={addExperience} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Experience
            </Button>
          </div>
          
          {data.experience.map((exp, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title || ''}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="TechCorp Inc."
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <DatePicker
                      date={exp.startDate || ''}
                      onDateChange={(date) => updateExperience(index, 'startDate', date)}
                      placeholder="Start date"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={exp.current || false}
                          onCheckedChange={(checked) => updateExperience(index, 'current', checked)}
                        />
                        <span className="text-sm">Currently working here</span>
                      </div>
                      {!exp.current && (
                        <DatePicker
                          date={exp.endDate || ''}
                          onDateChange={(date) => updateExperience(index, 'endDate', date)}
                          placeholder="End date"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Key Achievements & Responsibilities</Label>
                  {exp.bullets?.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2 mt-2">
                      <Textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...(exp.bullets || [])];
                          newBullets[bulletIndex] = e.target.value;
                          updateExperience(index, 'bullets', newBullets);
                        }}
                        placeholder="Describe your achievements and responsibilities..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newBullets = [...(exp.bullets || [])];
                          newBullets.splice(bulletIndex, 1);
                          updateExperience(index, 'bullets', newBullets);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newBullets = [...(exp.bullets || []), ''];
                      updateExperience(index, 'bullets', newBullets);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Bullet Point
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Education Section */}
        <TabsContent value="education" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button onClick={addEducation} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Education
            </Button>
          </div>
          
          {data.education.map((edu, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Education #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={edu.school || ''}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      placeholder="University of Technology"
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    <Input
                      value={edu.year || ''}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Projects Section */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Projects</h3>
            <Button onClick={addProject} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </div>
          
          {data.projects?.map((project, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      value={project.name || ''}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="E-commerce Platform"
                    />
                  </div>
                  <div>
                    <Label>Project Link (Optional)</Label>
                    <Input
                      value={project.link || ''}
                      onChange={(e) => updateProject(index, 'link', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={project.description || ''}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    placeholder="Describe the project, your role, and key achievements..."
                  />
                </div>
                
                <div>
                  <Label>Technologies Used</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies?.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          onClick={() => {
                            const newTechs = [...(project.technologies || [])];
                            newTechs.splice(techIndex, 1);
                            updateProject(index, 'technologies', newTechs);
                          }}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter technology (e.g., React, Python)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value) {
                            const newTechs = [...(project.technologies || []), value];
                            updateProject(index, 'technologies', newTechs);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || []}
        </TabsContent>

        {/* Skills Section */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Enter a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill();
                    }
                  }}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {data.skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Sections */}
        <TabsContent value="additional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Certifications section coming soon...
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Languages section coming soon...
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Awards section coming soon...
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Volunteer Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Volunteer section coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};