import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, FolderOpen, ExternalLink, X, GripVertical } from "lucide-react";
import { EditorProjectsItem } from "@/types/editor-resume";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectsSectionProps {
  data: EditorProjectsItem[];
  onChange: (data: EditorProjectsItem[]) => void;
}

interface SortableProjectItemProps {
  project: EditorProjectsItem;
  index: number;
  onUpdate: (id: string, field: keyof EditorProjectsItem, value: any) => void;
  onRemove: (id: string) => void;
}

const SortableProjectItem: React.FC<SortableProjectItemProps> = ({
  project,
  index,
  onUpdate,
  onRemove
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 border-l-4 border-l-accent/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
          <FolderOpen className="h-4 w-4" />
          Project #{index + 1}
        </div>
        <Button
          onClick={() => onRemove(project.id)}
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`name-${project.id}`}>Project Name *</Label>
          <Input
            id={`name-${project.id}`}
            value={project.name}
            onChange={(e) => onUpdate(project.id, "name", e.target.value)}
            placeholder="e.g., E-commerce Platform"
          />
        </div>
        <div>
          <Label htmlFor={`link-${project.id}`}>Project Link</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`link-${project.id}`}
              value={project.link}
              onChange={(e) => onUpdate(project.id, "link", e.target.value)}
              placeholder="https://github.com/user/project"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor={`description-${project.id}`}>Description</Label>
        <Textarea
          id={`description-${project.id}`}
          value={project.description}
          onChange={(e) => onUpdate(project.id, "description", e.target.value)}
          placeholder="Describe the project, your role, and key achievements..."
          rows={3}
        />
      </div>

      <div>
        <Label>Technologies Used</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.technologies.map((tech, techIndex) => (
            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
              {tech}
              <Button
                onClick={() => {
                  const newTech = project.technologies.filter((_, i) => i !== techIndex);
                  onUpdate(project.id, "technologies", newTech);
                }}
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Input
            className="w-32 h-6 text-xs"
            placeholder="Add technology..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !project.technologies.includes(value)) {
                  onUpdate(project.id, "technologies", [...project.technologies, value]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  data,
  onChange,
}) => {
  const addProject = () => {
    const newProject: EditorProjectsItem = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
      link: "",
    };
    onChange([...data, newProject]);
  };

  const updateProject = (id: string, field: keyof EditorProjectsItem, value: any) => {
    onChange(
      data.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
  };

  const removeProject = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id));
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
          <SortableProjectItem
            key={project.id}
            project={project}
            index={index}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
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