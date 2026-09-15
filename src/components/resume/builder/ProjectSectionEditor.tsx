import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Code2, Sparkles, X } from 'lucide-react';

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  duration?: string;
  description?: string;
  technologies?: string[];
  outcome?: string;
  link?: string;
}

interface ProjectSectionEditorProps {
  projects: ProjectItem[];
  onChange: (projects: ProjectItem[]) => void;
  onAIAssist?: (projectIndex: number) => void;
}

export const ProjectSectionEditor: React.FC<ProjectSectionEditorProps> = ({
  projects = [],
  onChange,
  onAIAssist
}) => {
  const [techInputs, setTechInputs] = useState<{ [key: number]: string }>({});

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      role: '',
      duration: '',
      description: '',
      technologies: [],
      outcome: ''
    };
    onChange([...projects, newProj]);
  };

  const handleRemoveProject = (index: number) => {
    const updated = projects.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleFieldChange = (index: number, field: keyof ProjectItem, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddTech = (index: number) => {
    const text = techInputs[index]?.trim();
    if (!text) return;
    const currentTech = projects[index].technologies || [];
    if (!currentTech.includes(text)) {
      handleFieldChange(index, 'technologies', [...currentTech, text]);
    }
    setTechInputs({ ...techInputs, [index]: '' });
  };

  const handleRemoveTech = (projIndex: number, techName: string) => {
    const currentTech = projects[projIndex].technologies || [];
    handleFieldChange(projIndex, 'technologies', currentTech.filter(t => t !== techName));
  };

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base font-bold text-foreground">Project Experience</CardTitle>
            <p className="text-xs text-muted-foreground">Highlight key technical, product, capstone, or client projects</p>
          </div>
        </div>
        <Button onClick={handleAddProject} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {projects.length > 0 ? (
          projects.map((proj, idx) => (
            <div key={proj.id || idx} className="p-4 rounded-xl border border-border/60 bg-card space-y-4 shadow-sm relative">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">Project #{idx + 1}</span>
                <div className="flex items-center gap-2">
                  {onAIAssist && (
                    <Button 
                      onClick={() => onAIAssist(idx)} 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Assist
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleRemoveProject(idx)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Project Name *</Label>
                  <Input 
                    placeholder="e.g. Metric Pulse (KPI Platform)"
                    value={proj.name}
                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Your Role / Title</Label>
                  <Input 
                    placeholder="e.g. Lead Full Stack Developer"
                    value={proj.role || ''}
                    onChange={(e) => handleFieldChange(idx, 'role', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Description & Business Context</Label>
                <Textarea 
                  placeholder="Describe the problem, key features, and client/business objective..."
                  rows={2}
                  value={proj.description || ''}
                  onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                />
              </div>

              {/* Technology Stack Tags */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Technology Stack & Tools</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Type technology (e.g. React, Node.js, PostgreSQL) and press Enter"
                    className="text-xs"
                    value={techInputs[idx] || ''}
                    onChange={(e) => setTechInputs({ ...techInputs, [idx]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech(idx);
                      }
                    }}
                  />
                  <Button onClick={() => handleAddTech(idx)} size="sm" variant="secondary" className="text-xs shrink-0">
                    Add Tech
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.technologies || []).map((tech, tIdx) => (
                    <Badge key={tIdx} variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
                      {tech}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTech(idx, tech)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Measurable Outcome */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Measurable Outcome & Business Impact (Optional)
                </Label>
                <Input 
                  placeholder="e.g. Reduced order processing latency by 35% across 200,000 monthly users"
                  value={proj.outcome || ''}
                  onChange={(e) => handleFieldChange(idx, 'outcome', e.target.value)}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border/60 rounded-xl space-y-3">
            <Code2 className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-foreground">No projects added yet</p>
              <p className="text-xs text-muted-foreground">Add key projects to demonstrate practical technical and problem-solving impact</p>
            </div>
            <Button onClick={handleAddProject} variant="outline" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add First Project
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
