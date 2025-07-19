
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, FileText, Edit, Download, Share, BarChart3, 
  Zap, Target, Crown, TrendingUp, Eye, Users,
  Calendar, Award, Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SmartProfileOptimizer } from "@/components/ai/SmartProfileOptimizer";
import { SmartJobMatcher } from "@/components/ai/SmartJobMatcher";

interface Resume {
  id: string;
  title: string;
  ats_score: number;
  created_at: string;
  updated_at: string;
  is_primary: boolean;
  content: any;
}

interface DashboardStats {
  totalResumes: number;
  averageAtsScore: number;
  totalViews: number;
  totalDownloads: number;
}

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    averageAtsScore: 0,
    totalViews: 0,
    totalDownloads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchResumes();
      fetchStats();
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
    }
  };

  const fetchStats = async () => {
    try {
      // In a real implementation, these would be separate analytics queries
      const totalResumes = resumes.length;
      const averageAtsScore = resumes.length > 0 
        ? resumes.reduce((sum, resume) => sum + (resume.ats_score || 0), 0) / resumes.length 
        : 0;
      
      setStats({
        totalResumes,
        averageAtsScore: Math.round(averageAtsScore),
        totalViews: Math.floor(Math.random() * 1000) + 100, // Mock data
        totalDownloads: Math.floor(Math.random() * 100) + 10 // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const createNewResume = () => {
    navigate('/resume-builder/edit/new');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Resume Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage and optimize your professional resumes</p>
            </div>
            <div className="flex gap-3">
              <Link to="/resume-builder/upload">
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Import Resume
                </Button>
              </Link>
              <Button onClick={createNewResume} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg ATS Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.averageAtsScore).split(' ')[0]}`}>
                    {stats.averageAtsScore}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
                <Download className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
            <TabsTrigger value="optimization">AI Tools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={createNewResume} className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Resume
                  </Button>
                  <Link to="/resume-builder/upload" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Import Existing Resume
                    </Button>
                  </Link>
                  <Link to="/resume-builder/checker" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Check Resume Score
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {resumes.slice(0, 3).map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{resume.title}</p>
                            <p className="text-sm text-gray-500">
                              Updated {new Date(resume.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getScoreColor(resume.ats_score || 0)}>
                            {resume.ats_score || 0}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI-Powered Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmartProfileOptimizer userProfile={{}} />
              <SmartJobMatcher userProfile={{}} />
            </div>
          </TabsContent>

          <TabsContent value="resumes" className="space-y-6">
            {resumes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                  <p className="text-gray-600 mb-4">Create your first professional resume with our AI-powered builder</p>
                  <Button onClick={createNewResume}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Resume
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-lg transition-shadow">
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
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Resume Enhancer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Improve your resume content with AI-powered suggestions
                  </p>
                  <Button className="w-full">
                    Enhance Resume
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ATS Optimizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Optimize your resume for Applicant Tracking Systems
                  </p>
                  <Button className="w-full" variant="outline">
                    Optimize for ATS
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills Analyzer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Analyze and improve your skills section
                  </p>
                  <Button className="w-full" variant="outline">
                    Analyze Skills
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p>Detailed analytics and insights about your resume performance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResumeDashboard;
