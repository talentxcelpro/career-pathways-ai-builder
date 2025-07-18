import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Upload, 
  PenTool, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  content: any;
  ats_score: number;
  created_at: string;
  updated_at: string;
}

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserResumes();
    }
  }, [user]);

  const fetchUserResumes = async () => {
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

  const createNewResume = () => {
    const newResumeId = `new-${Date.now()}`;
    navigate(`/resume-builder/edit/${newResumeId}`);
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setResumes(resumes.filter(resume => resume.id !== id));
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Enhancement",
      description: "Our advanced AI analyzes and improves your resume content for maximum impact",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes through Applicant Tracking Systems with 98% success rate",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Templates",
      description: "Choose from professionally designed templates crafted by HR experts",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track your resume's performance and get insights to improve your job search",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const quickActions = [
    {
      title: "Upload & Enhance",
      description: "Upload your existing resume for AI enhancement",
      icon: <Upload className="w-6 h-6" />,
      action: () => navigate('/resume-builder/upload'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Check Resume Score",
      description: "Get a comprehensive analysis of your resume",
      icon: <CheckCircle className="w-6 h-6" />,
      action: () => navigate('/resume-builder/checker'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Browse Templates",
      description: "Explore our collection of professional templates",
      icon: <FileText className="w-6 h-6" />,
      action: () => navigate('/templates'),
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  const templates = [
    { id: 'modern', name: 'Modern Professional', popular: true, color: 'from-blue-500 to-purple-500' },
    { id: 'creative', name: 'Creative Designer', popular: false, color: 'from-pink-500 to-orange-500' },
    { id: 'executive', name: 'Executive', popular: false, color: 'from-gray-700 to-gray-900' },
    { id: 'minimalist', name: 'Minimalist', popular: true, color: 'from-green-500 to-teal-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TalentXcel
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/resume-builder" className="text-slate-700 hover:text-blue-600 font-medium">Dashboard</Link>
                <Link to="/resume-builder/upload" className="text-slate-700 hover:text-blue-600 font-medium">Upload Resume</Link>
                <Link to="/resume-builder/checker" className="text-slate-700 hover:text-blue-600 font-medium">Resume Checker</Link>
                <Link to="/templates" className="text-slate-700 hover:text-blue-600 font-medium">Templates</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8">
              Build Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Dream Resume</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Create a professional resume with our AI-powered tools, beautiful templates, and comprehensive analysis. 
              Get hired faster with resumes that pass ATS systems and impress recruiters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg" onClick={createNewResume}>
                <PenTool className="w-5 h-5 mr-2" />
                Start Building Now
              </Button>
              <Link to="/resume-builder/checker">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-slate-50">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Get Your Resume Score
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2M+</div>
                <div className="text-slate-600">Resumes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-slate-600">ATS Pass Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                <div className="text-slate-600">Get Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-slate-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose TalentXcel?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with expert insights to create resumes that get results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl text-slate-900 mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <p className="text-xl text-slate-600">Get started with these popular options</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={action.action}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{action.title}</h3>
                  <p className="text-slate-600 mb-6">{action.description}</p>
                  <ArrowRight className="w-5 h-5 text-blue-600 mx-auto group-hover:translate-x-1 transition-transform duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Preview */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Professional Templates</h2>
            <p className="text-xl text-slate-600">Choose from our collection of expertly designed templates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className={`w-full h-64 bg-gradient-to-br ${template.color} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                      <div className="relative z-10 text-white">
                        <FileText className="w-16 h-16 opacity-80 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    {template.popular && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{template.name}</h3>
                  <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-300">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl">
              View All Templates
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Resumes Section */}
      {user && (
        <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Resumes</h2>
                <p className="text-xl text-slate-600">Manage and edit your created resumes</p>
              </div>
              <Button onClick={createNewResume} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Resume
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900 mb-2 line-clamp-1">
                            {resume.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              ATS Score: {resume.ats_score}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-600 mb-4">
                        Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/resume-builder/edit/${resume.id}`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/resume-builder/export/${resume.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteResume(resume.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">No resumes yet</h3>
                  <p className="text-slate-600 mb-6">Create your first resume to get started</p>
                  <Button onClick={createNewResume} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TalentXcel
              </h3>
              <p className="text-slate-300 mb-6 max-w-md">
                Empowering job seekers with AI-powered resume tools and professional templates to land their dream jobs.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="text-white border-slate-600 hover:bg-slate-800">
                  Privacy Policy
                </Button>
                <Button variant="outline" size="sm" className="text-white border-slate-600 hover:bg-slate-800">
                  Terms of Service
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-300">
                <li><Link to="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link to="/resume-builder/checker" className="hover:text-white transition-colors">Resume Checker</Link></li>
                <li><Link to="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link to="/cover-letter" className="hover:text-white transition-colors">Cover Letters</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 TalentXcel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResumeDashboard;
