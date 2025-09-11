import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  ExternalLink, 
  Github, 
  LinkIcon, 
  Star,
  Eye,
  Download,
  Share2,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  FileText,
  Image as ImageIcon,
  Video,
  Zap
} from 'lucide-react';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  image_url?: string;
  category: 'web' | 'mobile' | 'desktop' | 'data' | 'other';
  status: 'completed' | 'in_progress' | 'planned';
  start_date: string;
  end_date?: string;
  achievements: string[];
  user_id: string;
}

interface PortfolioSkill {
  id: string;
  skill_name: string;
  proficiency_level: number;
  category: 'technical' | 'soft' | 'language' | 'tool';
  endorsements_count: number;
  user_id: string;
}

interface PortfolioExperience {
  id: string;
  company_name: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  achievements: string[];
  skills_used: string[];
  user_id: string;
}

interface PortfolioSettings {
  is_public: boolean;
  custom_domain?: string;
  theme: 'modern' | 'classic' | 'minimal' | 'creative';
  show_contact_info: boolean;
  seo_title?: string;
  seo_description?: string;
}

export const ProfessionalPortfolio: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    project_url: '',
    github_url: '',
    category: 'web' as const,
    status: 'completed' as const
  });

  // Fetch portfolio projects
  const { data: projects = [] } = useQuery({
    queryKey: ['portfolio-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PortfolioProject[];
    },
    enabled: !!user?.id
  });

  // Fetch portfolio skills
  const { data: skills = [] } = useQuery({
    queryKey: ['portfolio-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolio_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('proficiency_level', { ascending: false });
      
      if (error) throw error;
      return data as PortfolioSkill[];
    },
    enabled: !!user?.id
  });

  // Fetch portfolio analytics
  const { data: analytics } = useQuery({
    queryKey: ['portfolio-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Mock analytics data - in production this would come from actual tracking
      return {
        total_views: 1250,
        views_this_week: 89,
        profile_completion: 85,
        projects_count: projects.length,
        skills_count: skills.length,
        endorsements_count: skills.reduce((acc, skill) => acc + skill.endorsements_count, 0)
      };
    },
    enabled: !!user?.id
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async (project: typeof projectForm) => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .insert({
          ...project,
          user_id: user?.id,
          start_date: new Date().toISOString(),
          achievements: []
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast.success('Project added successfully!');
      setIsEditingProject(false);
      setProjectForm({
        title: '',
        description: '',
        technologies: [],
        project_url: '',
        github_url: '',
        category: 'web',
        status: 'completed'
      });
    }
  });

  const skillCategories = [
    { name: 'Technical Skills', type: 'technical', color: 'bg-blue-100 text-blue-800' },
    { name: 'Soft Skills', type: 'soft', color: 'bg-green-100 text-green-800' },
    { name: 'Tools & Platforms', type: 'tool', color: 'bg-purple-100 text-purple-800' },
    { name: 'Languages', type: 'language', color: 'bg-orange-100 text-orange-800' }
  ];

  const projectCategories = [
    { name: 'Web Development', type: 'web', icon: Globe },
    { name: 'Mobile Apps', type: 'mobile', icon: Phone },
    { name: 'Desktop Software', type: 'desktop', icon: Code },
    { name: 'Data Science', type: 'data', icon: Zap }
  ];

  const handleAddProject = () => {
    addProjectMutation.mutate(projectForm);
  };

  const getCompletionPercentage = () => {
    let completion = 0;
    
    // Basic profile info (20%)
    if (user?.email) completion += 10;
    if (user?.full_name) completion += 10;
    
    // Projects (30%)
    if (projects.length >= 1) completion += 15;
    if (projects.length >= 3) completion += 15;
    
    // Skills (25%)
    if (skills.length >= 5) completion += 12.5;
    if (skills.length >= 10) completion += 12.5;
    
    // Experience (25%)
    completion += 25; // Assume experience is filled
    
    return Math.min(completion, 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Professional Portfolio</h1>
          <p className="text-muted-foreground">Showcase your work and skills to potential employers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Portfolio
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{analytics?.total_views || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <p className="text-2xl font-bold">{skills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Endorsements</p>
                <p className="text-2xl font-bold">{analytics?.endorsements_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Profile Completion</h3>
            <span className="text-sm font-medium">{getCompletionPercentage().toFixed(0)}%</span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Complete
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              In Progress
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              Todo
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>{user?.full_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold">{user?.full_name || 'Your Name'}</h3>
                      <p className="text-muted-foreground">Full Stack Developer | React & Node.js Specialist</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Bangalore, India</span>
                      </div>
                    </div>
                    
                    <p className="text-sm">
                      Passionate full-stack developer with 5+ years of experience building scalable web applications. 
                      Specialized in React, Node.js, and cloud technologies. Love solving complex problems and mentoring junior developers.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button size="sm" variant="outline">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Skills
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">Start showcasing your work by adding your first project</p>
                  <Button onClick={() => setActiveTab('projects')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.slice(0, 3).map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {project.image_url && (
                          <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <h4 className="font-semibold mb-2">{project.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {project.project_url && (
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </Button>
                          )}
                          {project.github_url && (
                            <Button size="sm" variant="outline">
                              <Github className="h-3 w-3 mr-1" />
                              Code
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Dialog open={isEditingProject} onOpenChange={setIsEditingProject}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Project Title</label>
                      <Input
                        placeholder="e.g., E-commerce Platform"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={projectForm.category}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value as any }))}
                      >
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile App</option>
                        <option value="desktop">Desktop Software</option>
                        <option value="data">Data Science</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your project, the problem it solves, and your role..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Project URL</label>
                      <Input
                        placeholder="https://your-project.com"
                        value={projectForm.project_url}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, project_url: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">GitHub URL</label>
                      <Input
                        placeholder="https://github.com/username/project"
                        value={projectForm.github_url}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, github_url: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Technologies Used</label>
                    <Input
                      placeholder="React, Node.js, MongoDB (comma separated)"
                      onChange={(e) => setProjectForm(prev => ({ 
                        ...prev, 
                        technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAddProject} 
                    className="w-full"
                    disabled={!projectForm.title || !projectForm.description}
                  >
                    Add Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Project Categories */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {projectCategories.map((category) => {
              const count = projects.filter(p => p.category === category.type).length;
              return (
                <Card key={category.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <category.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{count} projects</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {project.image_url ? (
                      <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                        <Code className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      {project.project_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />
                            Source Code
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Skills & Expertise</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>

          <div className="space-y-6">
            {skillCategories.map((category) => {
              const categorySkills = skills.filter(s => s.category === category.type);
              
              return (
                <Card key={category.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({categorySkills.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categorySkills.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No {category.name.toLowerCase()} added yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categorySkills.map((skill) => (
                          <div key={skill.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{skill.skill_name}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{skill.endorsements_count}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Proficiency</span>
                                <span>{skill.proficiency_level}%</span>
                              </div>
                              <Progress value={skill.proficiency_level} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Professional Experience</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>

          <div className="space-y-4">
            {/* Sample experience entries */}
            {[
              {
                company: 'TechCorp Solutions',
                position: 'Senior Full Stack Developer',
                duration: 'Jan 2022 - Present',
                current: true,
                description: 'Leading development of scalable web applications using React and Node.js. Mentoring junior developers and implementing best practices.',
                achievements: [
                  'Increased application performance by 40%',
                  'Led team of 5 developers',
                  'Implemented CI/CD pipeline reducing deployment time by 60%'
                ]
              },
              {
                company: 'StartupXYZ',
                position: 'Frontend Developer',
                duration: 'Mar 2020 - Dec 2021',
                current: false,
                description: 'Developed responsive web applications and mobile apps. Collaborated with design team to implement pixel-perfect UIs.',
                achievements: [
                  'Built 3 major features from scratch',
                  'Improved user experience leading to 25% increase in engagement',
                  'Optimized bundle size by 30%'
                ]
              }
            ].map((exp, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{exp.position}</h3>
                        {exp.current && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground mb-3">
                        <span className="font-medium">{exp.company}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exp.duration}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-4">{exp.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Key Achievements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full mt-2" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Portfolio Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Portfolio</h4>
                      <p className="text-sm text-muted-foreground">Allow others to view your portfolio</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Contact Info</h4>
                      <p className="text-sm text-muted-foreground">Display contact information publicly</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Analytics Tracking</h4>
                      <p className="text-sm text-muted-foreground">Track portfolio views and engagement</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Portfolio Theme</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Custom Domain</label>
                    <Input placeholder="yourname.portfolio.com" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">SEO Title</label>
                    <Input placeholder="Your Name - Portfolio" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">SEO Description</label>
                    <Textarea 
                      placeholder="Professional portfolio showcasing my work..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  <span>Export as PDF</span>
                  <span className="text-xs text-muted-foreground">Generate PDF resume</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Globe className="h-8 w-8" />
                  <span>Export as Website</span>
                  <span className="text-xs text-muted-foreground">Download HTML/CSS</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Share2 className="h-8 w-8" />
                  <span>Share Link</span>
                  <span className="text-xs text-muted-foreground">Get shareable URL</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};