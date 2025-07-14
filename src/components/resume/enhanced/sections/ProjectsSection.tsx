import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FolderOpen, ExternalLink, Github } from "lucide-react";
import { Project } from "@/types/enhanced-resume";

interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  data,
  onChange
}) => {
  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      status: 'completed',
      url: '',
      github: '',
      role: '',
      teamSize: 1,
      impact: ''
    };
    onChange([...data, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onChange(data.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const removeProject = (id: string) => {
    onChange(data.filter(project => project.id !== id));
  };

  const updateTechnologies = (id: string, techStr: string) => {
    const technologies = techStr.split(',').map(t => t.trim()).filter(t => t);
    updateProject(id, { technologies });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Projects</h3>
        </div>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={addProject} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((project, index) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Project #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${project.id}`}>Project Title *</Label>
                    <Input
                      id={`title-${project.id}`}
                      value={project.title}
                      onChange={(e) => updateProject(project.id, { title: e.target.value })}
                      placeholder="e.g., E-commerce Mobile App"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`role-${project.id}`}>Your Role</Label>
                    <Input
                      id={`role-${project.id}`}
                      value={project.role}
                      onChange={(e) => updateProject(project.id, { role: e.target.value })}
                      placeholder="e.g., Full Stack Developer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${project.id}`}>Description *</Label>
                  <Textarea
                    id={`description-${project.id}`}
                    value={project.description}
                    onChange={(e) => updateProject(project.id, { description: e.target.value })}
                    placeholder="Describe the project, your contributions, and outcomes..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`technologies-${project.id}`}>Technologies Used</Label>
                  <Input
                    id={`technologies-${project.id}`}
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateTechnologies(project.id, e.target.value)}
                    placeholder="e.g., React, Node.js, MongoDB, AWS"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple technologies with commas
                  </p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`startDate-${project.id}`}>Start Date</Label>
                    <Input
                      id={`startDate-${project.id}`}
                      type="month"
                      value={project.startDate}
                      onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`endDate-${project.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${project.id}`}
                      type="month"
                      value={project.endDate}
                      onChange={(e) => updateProject(project.id, { endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`status-${project.id}`}>Status</Label>
                    <Select
                      value={project.status}
                      onValueChange={(value: Project['status']) => 
                        updateProject(project.id, { status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`teamSize-${project.id}`}>Team Size</Label>
                    <Input
                      id={`teamSize-${project.id}`}
                      type="number"
                      min="1"
                      value={project.teamSize}
                      onChange={(e) => updateProject(project.id, { teamSize: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`impact-${project.id}`}>Impact/Results</Label>
                    <Input
                      id={`impact-${project.id}`}
                      value={project.impact}
                      onChange={(e) => updateProject(project.id, { impact: e.target.value })}
                      placeholder="e.g., Increased user engagement by 40%"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`url-${project.id}`}>Project URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${project.id}`}
                        value={project.url}
                        onChange={(e) => updateProject(project.id, { url: e.target.value })}
                        placeholder="https://..."
                      />
                      {project.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`github-${project.id}`}>GitHub Repository</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`github-${project.id}`}
                        value={project.github}
                        onChange={(e) => updateProject(project.id, { github: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                      {project.github && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.github, '_blank')}
                        >
                          <Github className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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