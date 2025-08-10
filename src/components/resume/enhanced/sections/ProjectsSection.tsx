
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, FolderOpen, Calendar, ExternalLink, Github, Users, X } from "lucide-react";
import { Project } from "@/types/enhanced-resume";

interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  data,
  onChange,
}) => {
  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      technologies: [],
      startDate: "",
      endDate: "",
      url: "",
      githubUrl: "",
      teamSize: undefined,
      role: "",
    };
    onChange([...data, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    onChange(
      data.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (id: string) => {
    onChange(data.filter((project) => project.id !== id));
  };

  const addTechnology = (projectId: string, tech: string) => {
    const project = data.find((proj) => proj.id === projectId);
    if (project && tech.trim() && !project.technologies.includes(tech.trim())) {
      const newTechnologies = [...project.technologies, tech.trim()];
      updateProject(projectId, "technologies", newTechnologies);
    }
  };

  const removeTechnology = (projectId: string, tech: string) => {
    const project = data.find((proj) => proj.id === projectId);
    if (project) {
      const newTechnologies = project.technologies.filter(t => t !== tech);
      updateProject(projectId, "technologies", newTechnologies);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Projects
        </CardTitle>
        <Button onClick={addProject} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((project, index) => (
          <Card key={project.id} className="p-6 border-l-4 border-l-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Project #{index + 1}
              </div>
              <Button
                onClick={() => removeProject(project.id)}
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`title-${project.id}`}>Project Title *</Label>
                <Input
                  id={`title-${project.id}`}
                  value={project.title}
                  onChange={(e) => updateProject(project.id, "title", e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                />
              </div>
              <div>
                <Label htmlFor={`role-${project.id}`}>Your Role</Label>
                <Input
                  id={`role-${project.id}`}
                  value={project.role || ""}
                  onChange={(e) => updateProject(project.id, "role", e.target.value)}
                  placeholder="e.g., Lead Developer, Team Lead"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor={`description-${project.id}`}>Project Description *</Label>
              <Textarea
                id={`description-${project.id}`}
                value={project.description}
                onChange={(e) => updateProject(project.id, "description", e.target.value)}
                placeholder="Describe the project, your contributions, and the impact..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor={`start-date-${project.id}`}>Start Date</Label>
                <Input
                  id={`start-date-${project.id}`}
                  type="month"
                  value={project.startDate || ""}
                  onChange={(e) => updateProject(project.id, "startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`end-date-${project.id}`}>End Date</Label>
                <Input
                  id={`end-date-${project.id}`}
                  type="month"
                  value={project.endDate || ""}
                  onChange={(e) => updateProject(project.id, "endDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`team-size-${project.id}`}>Team Size</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`team-size-${project.id}`}
                    type="number"
                    min="1"
                    value={project.teamSize || ""}
                    onChange={(e) => updateProject(project.id, "teamSize", parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 5"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`url-${project.id}`}>Live Demo URL</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`url-${project.id}`}
                    value={project.url || ""}
                    onChange={(e) => updateProject(project.id, "url", e.target.value)}
                    placeholder="https://your-project.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`github-${project.id}`}>GitHub Repository</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`github-${project.id}`}
                    value={project.githubUrl || ""}
                    onChange={(e) => updateProject(project.id, "githubUrl", e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Technologies Used</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {project.technologies.map((tech, techIndex) => (
                  <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <Button
                      onClick={() => removeTechnology(project.id, tech)}
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
                placeholder="Add technology and press Enter..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTechnology(project.id, value);
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
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects added yet.</p>
            <p className="text-sm">Click "Add Project" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
