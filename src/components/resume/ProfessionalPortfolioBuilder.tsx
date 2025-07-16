import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, Camera, Video, Github, Linkedin, Twitter,
  Plus, Edit3, Trash2, Eye, Star, Award, Target,
  Briefcase, Code, Palette, TrendingUp, Users,
  BarChart3, Heart, MessageSquare, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: 'web' | 'mobile' | 'design' | 'data' | 'other';
  featured: boolean;
  links: {
    live?: string;
    github?: string;
    case_study?: string;
  };
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
}

interface ProfessionalPortfolioBuilderProps {
  resumeData: any;
  onUpdate: (portfolioData: any) => void;
  className?: string;
}

const categories = [
  { id: 'web', name: 'Web Development', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500' },
  { id: 'mobile', name: 'Mobile Apps', icon: <Briefcase className="h-4 w-4" />, color: 'bg-green-500' },
  { id: 'design', name: 'UI/UX Design', icon: <Palette className="h-4 w-4" />, color: 'bg-purple-500' },
  { id: 'data', name: 'Data Science', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-orange-500' },
  { id: 'other', name: 'Other', icon: <Star className="h-4 w-4" />, color: 'bg-gray-500' }
];

export const ProfessionalPortfolioBuilder: React.FC<ProfessionalPortfolioBuilderProps> = ({
  resumeData,
  onUpdate,
  className
}) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([
    {
      id: '1',
      title: 'E-commerce Dashboard',
      description: 'Full-stack dashboard for managing online store analytics and inventory',
      image: '/api/placeholder/400/300',
      tags: ['React', 'Node.js', 'MongoDB'],
      category: 'web',
      featured: true,
      links: {
        live: 'https://demo.example.com',
        github: 'https://github.com/user/project'
      },
      metrics: { views: 1250, likes: 45, comments: 12 }
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const [newProject, setNewProject] = useState<Partial<PortfolioProject>>({
    title: '',
    description: '',
    category: 'web',
    tags: [],
    featured: false,
    links: {}
  });

  const handleAddProject = useCallback(() => {
    if (!newProject.title || !newProject.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const project: PortfolioProject = {
      id: Date.now().toString(),
      title: newProject.title!,
      description: newProject.description!,
      image: '/api/placeholder/400/300',
      tags: newProject.tags || [],
      category: newProject.category as any || 'web',
      featured: newProject.featured || false,
      links: newProject.links || {},
      metrics: { views: 0, likes: 0, comments: 0 }
    };

    setProjects(prev => [...prev, project]);
    setNewProject({ title: '', description: '', category: 'web', tags: [], featured: false, links: {} });
    setIsAddingProject(false);
    toast.success('Project added successfully!');
  }, [newProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast.success('Project deleted');
  }, []);

  const toggleFeatured = useCallback((projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, featured: !p.featured } : p
    ));
  }, []);

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Portfolio Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Professional Portfolio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcase your best work with an interactive portfolio that stands out to employers
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {projects.reduce((acc, p) => acc + (p.metrics?.views || 0), 0)} views
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {projects.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0)} likes
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {projects.length} projects
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Projects
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Featured Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{project.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.metrics?.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {project.metrics?.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {project.metrics?.comments || 0}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(project.id)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Projects */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            All Projects ({filteredProjects.length})
          </CardTitle>
          <Button
            onClick={() => setIsAddingProject(true)}
            size="sm"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Project Form */}
          {isAddingProject && (
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <Input
                  placeholder="Project title"
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Project description"
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Live demo URL (optional)"
                    value={newProject.links?.live || ''}
                    onChange={(e) => setNewProject(prev => ({ 
                      ...prev, 
                      links: { ...prev.links, live: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="GitHub URL (optional)"
                    value={newProject.links?.github || ''}
                    onChange={(e) => setNewProject(prev => ({ 
                      ...prev, 
                      links: { ...prev.links, github: e.target.value }
                    }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProject} size="sm">
                    Add Project
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingProject(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                  <Camera className="h-6 w-6 text-primary" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(project.id)}
                      className={cn(
                        "h-8 w-8 p-0",
                        project.featured ? "text-yellow-500" : "text-gray-400"
                      )}
                    >
                      <Star className={cn("h-4 w-4", project.featured && "fill-current")} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{project.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {project.links.live && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Globe className="h-3 w-3" />
                        </Button>
                      )}
                      {project.links.github && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Github className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.metrics?.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {project.metrics?.likes || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects in this category yet.</p>
              <Button
                variant="outline"
                onClick={() => setIsAddingProject(true)}
                className="mt-2"
              >
                Add Your First Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};