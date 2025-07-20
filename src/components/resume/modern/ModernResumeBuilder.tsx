import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Plus, FileText, Edit, Download, Upload, Share, BarChart3, 
  Zap, Target, Crown, TrendingUp, Eye, Users, Sparkles, 
  Calendar, Award, Palette, Play, ArrowRight, Check,
  Brain, Lightbulb, Search, Filter, Grid, List, Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TemplateSelector } from "../TemplateSelector";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  ats_score: number;
  created_at: string;
  updated_at: string;
  is_primary: boolean;
  content: any;
  template_id?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
  isRecommended?: boolean;
  isPremium?: boolean;
}

const modernTemplates: Template[] = [
  {
    id: 'zety-professional',
    name: 'Zety Professional',
    description: 'Clean, ATS-optimized template with modern typography',
    preview: '/api/placeholder/300/400',
    category: 'Professional',
    isRecommended: true
  },
  {
    id: 'enhancv-creative',
    name: 'Enhancv Creative',
    description: 'Design-first layout perfect for creative roles',
    preview: '/api/placeholder/300/400',
    category: 'Creative',
    isPremium: true
  },
  {
    id: 'canva-modern',
    name: 'Canva Modern',
    description: 'Visual-friendly template with color accents',
    preview: '/api/placeholder/300/400',
    category: 'Modern'
  },
  {
    id: 'novoresume-executive',
    name: 'NovoResume Executive',
    description: 'Executive-level template for senior positions',
    preview: '/api/placeholder/300/400',
    category: 'Executive',
    isPremium: true
  },
  {
    id: 'minimal-tech',
    name: 'Tech Minimal',
    description: 'Minimalist design perfect for tech professionals',
    preview: '/api/placeholder/300/400',
    category: 'Tech'
  },
  {
    id: 'kickresume-bold',
    name: 'Kickresume Bold',
    description: 'Bold design with personality section',
    preview: '/api/placeholder/300/400',
    category: 'Creative'
  }
];

export const ModernResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'start' | 'templates' | 'builder'>('start');

  const categories = ['All', 'Professional', 'Creative', 'Modern', 'Executive', 'Tech'];

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file);
      toast.success('Resume uploaded successfully!');
      navigate('/resume-builder/upload');
    } catch (error) {
      toast.error('Failed to upload resume');
    }
  };

  const filteredTemplates = modernTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const createNewResume = (templateId?: string) => {
    if (templateId) {
      navigate(`/resume-builder/edit/new?template=${templateId}`);
    } else {
      setStep('templates');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your resume workspace...</p>
        </div>
      </div>
    );
  }

  if (step === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Build Your Perfect Resume
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Create ATS-optimized resumes with AI-powered suggestions and professional templates
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
                  onClick={() => createNewResume()}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Resume
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-8 py-4 text-lg border-2"
                    disabled={isUploading}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Existing Resume'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Writing</h3>
                <p className="text-gray-600">Get intelligent suggestions for bullet points and content optimization</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">ATS Optimization</h3>
                <p className="text-gray-600">Ensure your resume passes Applicant Tracking Systems</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
                <p className="text-gray-600">Choose from expertly designed templates for any industry</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Resumes */}
          {resumes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Your Recent Resumes</h2>
                <Button variant="outline" onClick={() => navigate('/resume-builder')}>
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.slice(0, 3).map((resume) => (
                  <Card key={resume.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{resume.title}</CardTitle>
                          <p className="text-sm text-gray-500">
                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        {resume.is_primary && (
                          <Badge variant="secondary">
                            <Crown className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">ATS Score</span>
                            <Badge className={getScoreColor(resume.ats_score || 0)}>
                              {resume.ats_score || 0}%
                            </Badge>
                          </div>
                          <Progress value={resume.ats_score || 0} className="w-full" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/resume-builder/edit/${resume.id}`)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'templates') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Choose Your Template</h1>
                <p className="text-slate-600 mt-1">Select a professional template to get started</p>
              </div>
              <Button variant="outline" onClick={() => setStep('start')}>
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeView === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={activeView === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className={`grid gap-6 ${activeView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  {template.isRecommended && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" />
                        AI Recommended
                      </Badge>
                    </div>
                  )}
                  {template.isPremium && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <Button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => createNewResume(template.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => createNewResume(template.id)}
                    >
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};