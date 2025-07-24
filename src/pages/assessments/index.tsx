import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/branded/HeroSection";
import { Brain, Clock, Award, Users, Search, Filter, Star, Target, Trophy, Zap, GraduationCap, Briefcase, Code, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: string;
  difficulty_level: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_premium: boolean;
  tags: string[];
  industry?: string;
  job_role?: string;
  skills_tested: string[];
  category_id: string;
  category?: AssessmentCategory;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  brain: Brain,
  code: Code,
  users: Users,
  briefcase: Briefcase,
  heart: Star,
  user: Trophy,
  graduation: GraduationCap,
  trending: TrendingUp
};

export default function AssessmentsPage() {
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, selectedCategory, searchQuery, difficultyFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load assessment categories');
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          category:assessment_categories(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = assessments;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(assessment => assessment.category_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(assessment =>
        assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.skills_tested.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.difficulty_level === difficultyFilter);
    }

    setFilteredAssessments(filtered);
  };

  const startAssessment = async (assessmentId: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to take assessments');
        return;
      }

      // Create assessment attempt
      const { data, error } = await supabase
        .from('assessment_attempts')
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/assessments/${assessmentId}/take/${data.id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* TalentXcel Hero Section */}
      <HeroSection
        title="Skill Assessment Hub"
        subtitle="Validate your expertise, discover growth opportunities, and accelerate your career with TalentXcel's AI-powered assessment platform"
        showAIBadge={true}
        backgroundGradient={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Enhanced Search and Filters */}
        <div className="mb-8 bg-card/80 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assessments, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:bg-background"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background/50 border-muted-foreground/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-card/80 backdrop-blur-sm border shadow-sm rounded-xl p-1 mb-8">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Brain;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {/* Enhanced Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment) => {
                const IconComponent = iconMap[assessment.category?.icon || 'brain'] || Brain;
                return (
                  <Card key={assessment.id} className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    {/* Gradient overlay for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col gap-2">
                          {assessment.is_premium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          <Badge variant="secondary" className={`${getDifficultyColor(assessment.difficulty_level)} border-0 font-medium`}>
                            {assessment.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-3 text-muted-foreground/80">
                          {assessment.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 relative z-10">
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                          <Clock className="h-4 w-4 mb-1 text-primary" />
                          <span className="font-medium">{assessment.duration_minutes}m</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                          <Brain className="h-4 w-4 mb-1 text-primary" />
                          <span className="font-medium">{assessment.total_questions}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                          <Target className="h-4 w-4 mb-1 text-primary" />
                          <span className="font-medium">{assessment.passing_score}%</span>
                        </div>
                      </div>

                      {assessment.skills_tested.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assessment.skills_tested.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-background/50 border-muted-foreground/20">
                              {skill}
                            </Badge>
                          ))}
                          {assessment.skills_tested.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-background/50 border-muted-foreground/20">
                              +{assessment.skills_tested.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="pt-2">
                        <Button 
                          onClick={() => startAssessment(assessment.id)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Start Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAssessments.length === 0 && (
              <div className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No assessments found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria to discover more assessments
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Features Banner */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl p-8 mt-12 border border-primary/20 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why Choose TalentXcel Assessments?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Award className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg mb-3">Industry-Standard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assessments designed by experts and validated by industry professionals worldwide
              </p>
            </div>
            <div className="text-center group">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Brain className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg mb-3">AI-Powered Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get detailed insights and personalized recommendations powered by advanced AI
              </p>
            </div>
            <div className="text-center group">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="font-bold text-lg mb-3">Verified Certificates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn blockchain-verified certificates to showcase your achievements professionally
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}