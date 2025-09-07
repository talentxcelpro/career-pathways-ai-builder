import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Globe, Github, Linkedin, ExternalLink, Upload, Eye, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  isPublic: boolean;
}

interface PortfolioData {
  personalInfo: {
    name: string;
    title: string;
    bio: string;
    location: string;
    email: string;
    website: string;
  };
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    dribbble: string;
  };
  customDomain: string;
  theme: string;
  projects: Project[];
}

const PortfolioBuilder = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    personalInfo: {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with 5+ years of experience building scalable web applications.',
      location: 'San Francisco, CA',
      email: 'john@example.com',
      website: 'johndoe.dev'
    },
    socialLinks: {
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      twitter: 'twitter.com/johndoe',
      dribbble: ''
    },
    customDomain: 'johndoe.talentxcel.com',
    theme: 'modern',
    projects: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution built with React, Node.js, and PostgreSQL',
        image: '/api/placeholder/400/250',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        liveUrl: 'https://ecommerce-demo.com',
        githubUrl: 'https://github.com/johndoe/ecommerce',
        isPublic: true
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'Collaborative task management tool with real-time updates',
        image: '/api/placeholder/400/250',
        technologies: ['Vue.js', 'Express', 'Socket.io', 'MongoDB'],
        liveUrl: 'https://tasks-demo.com',
        githubUrl: 'https://github.com/johndoe/tasks',
        isPublic: true
      }
    ]
  });

  const themes = [
    { id: 'modern', name: 'Modern', preview: 'Clean and minimal design' },
    { id: 'creative', name: 'Creative', preview: 'Bold and colorful layout' },
    { id: 'professional', name: 'Professional', preview: 'Corporate and elegant' },
    { id: 'portfolio', name: 'Portfolio', preview: 'Image-focused showcase' }
  ];

  const handleSave = () => {
    toast.success('Portfolio saved successfully!');
  };

  const handlePublish = () => {
    toast.success('Portfolio published! Your site is now live.');
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project description',
      image: '/api/placeholder/400/250',
      technologies: [],
      isPublic: true
    };
    setPortfolioData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, ...updates } : p
      )
    }));
  };

  const deleteProject = (projectId: string) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId)
    }));
    toast.success('Project deleted');
  };

  return (
    <>
      <Helmet>
        <title>Portfolio Builder | Create Professional Portfolio | TalentXcel</title>
        <meta 
          name="description" 
          content="Build a professional portfolio website. Showcase projects, integrate with GitHub, custom domains, and beautiful themes." 
        />
        <link rel="canonical" href="https://talentxcel.in/portfolio" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Header */}
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Portfolio Builder
                </h1>
                <p className="text-xl text-muted-foreground">
                  Create a stunning portfolio to showcase your work and skills
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button onClick={handlePublish}>
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>

            {/* Live Preview Link */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Your Portfolio URL</h3>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        https://{portfolioData.customDomain}
                      </code>
                      <Badge variant="outline">Live</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="grid w-full grid-rows-4 h-auto">
                  <TabsTrigger value="info" className="justify-start">
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="justify-start">
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="theme" className="justify-start">
                    Theme & Design
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="justify-start">
                    Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content Panel */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="info" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={portfolioData.personalInfo.name}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, name: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Professional Title</Label>
                          <Input
                            id="title"
                            value={portfolioData.personalInfo.title}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, title: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={portfolioData.personalInfo.bio}
                          onChange={(e) => setPortfolioData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, bio: e.target.value }
                          }))}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={portfolioData.personalInfo.location}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={portfolioData.personalInfo.email}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="linkedin" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin"
                            value={portfolioData.socialLinks.linkedin}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="github" className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            GitHub
                          </Label>
                          <Input
                            id="github"
                            value={portfolioData.socialLinks.github}
                            onChange={(e) => setPortfolioData(prev => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, github: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Projects</h2>
                    <Button onClick={addProject} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Add Project
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolioData.projects.map((project) => (
                      <Card key={project.id}>
                        <CardContent className="p-4">
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-32 object-cover rounded mb-4"
                          />
                          
                          <div className="space-y-3">
                            <Input
                              value={project.title}
                              onChange={(e) => updateProject(project.id, { title: e.target.value })}
                              className="font-semibold"
                            />
                            
                            <Textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, { description: e.target.value })}
                              rows={2}
                            />

                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                <Input
                                  placeholder="Live URL (optional)"
                                  value={project.liveUrl || ''}
                                  onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                <Input
                                  placeholder="GitHub URL (optional)"
                                  value={project.githubUrl || ''}
                                  onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={project.isPublic}
                                  onCheckedChange={(checked) => updateProject(project.id, { isPublic: checked })}
                                />
                                <span className="text-sm">Public</span>
                              </div>
                              
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteProject(project.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="theme" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map((theme) => (
                          <div
                            key={theme.id}
                            onClick={() => setPortfolioData(prev => ({ ...prev, theme: theme.id }))}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              portfolioData.theme === theme.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <div className="h-24 bg-gradient-to-br from-muted to-muted/50 rounded mb-3" />
                            <h3 className="font-semibold">{theme.name}</h3>
                            <p className="text-sm text-muted-foreground">{theme.preview}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Customization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-3 mt-2">
                          {['blue', 'purple', 'green', 'orange', 'red'].map((color) => (
                            <div
                              key={color}
                              className={`w-8 h-8 rounded-full cursor-pointer bg-${color}-500`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="font">Font Family</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="playfair">Playfair Display</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Domain Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="domain">Custom Domain</Label>
                        <Input
                          id="domain"
                          value={portfolioData.customDomain}
                          onChange={(e) => setPortfolioData(prev => ({ ...prev, customDomain: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Your portfolio will be available at this URL
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Integration Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">GitHub Integration</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically sync your GitHub repositories
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Analytics</h4>
                          <p className="text-sm text-muted-foreground">
                            Track portfolio views and engagement
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Contact Form</h4>
                          <p className="text-sm text-muted-foreground">
                            Allow visitors to contact you directly
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioBuilder;