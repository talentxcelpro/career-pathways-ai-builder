import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Clock, Award, Users, Search, Filter, Star, Target, Trophy, Zap, GraduationCap, Briefcase, Code, TrendingUp, CheckCircle, Heart, Lightbulb } from "lucide-react";
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

// Category configuration with colors
const categoryConfig = {
  all: { icon: Trophy, color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  'technical-skills': { icon: Code, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  'behavioral-assessment': { icon: Users, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  'cognitive-abilities': { icon: Brain, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  'industry-knowledge': { icon: Briefcase, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  'soft-skills': { icon: Heart, color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  'personality-assessment': { icon: Lightbulb, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' }
};

// Level colors
const levelColors = {
  beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  intermediate: 'bg-amber-100 text-amber-800 border-amber-200', 
  advanced: 'bg-orange-100 text-orange-800 border-orange-200',
  expert: 'bg-red-100 text-red-800 border-red-200'
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, selectedCategory, searchQuery, difficultyFilter]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
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


  // Smart/NLP search function
  const performSmartSearch = (assessments: Assessment[], query: string) => {
    if (!query.trim()) return assessments;
    
    const lowercaseQuery = query.toLowerCase();
    return assessments.filter(assessment => {
      // Enhanced search across multiple fields
      const searchFields = [
        assessment.title,
        assessment.description,
        assessment.assessment_type,
        ...(assessment.skills_tested || []),
        ...(assessment.tags || []),
        assessment.industry,
        assessment.job_role
      ].filter(Boolean);
      
      return searchFields.some(field => 
        field.toLowerCase().includes(lowercaseQuery)
      );
    });
  };

  const filterAssessments = () => {
    let filtered = assessments;

    // Category filtering based on assessment_type
    if (selectedCategory !== 'all') {
      const categoryMap = {
        'technical-skills': ['Technical Skills', 'Programming', 'Software Development'],
        'behavioral-assessment': ['Behavioral Assessment', 'Behavioral'],
        'cognitive-abilities': ['Cognitive Abilities', 'Cognitive', 'IQ'],
        'industry-knowledge': ['Industry Knowledge', 'Industry Specific'],
        'soft-skills': ['Soft Skills', 'Communication', 'Leadership'],
        'personality-assessment': ['Personality Assessment', 'Personality']
      };
      
      const categoryTypes = categoryMap[selectedCategory] || [];
      filtered = filtered.filter(assessment =>
        categoryTypes.some(type => 
          assessment.assessment_type?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Smart search
    filtered = performSmartSearch(filtered, searchQuery);

    // Difficulty filtering
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
    return levelColors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="container mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Compact TalentXcel Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">TalentXcel</h1>
                  <p className="text-xs text-muted-foreground">Skill Assessment Hub</p>
                </div>
              </div>
            </div>
            
            {/* Compact Search */}
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search assessments, skills, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-background/50 border-muted-foreground/20 focus:bg-background text-sm"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg bg-background/50 border-muted-foreground/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Enhanced Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-7 bg-card/80 backdrop-blur-sm border shadow-sm rounded-lg p-1 mb-4 h-12">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const IconComponent = config.icon;
              const isActive = selectedCategory === key;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className={`flex flex-col items-center gap-1 data-[state=active]:${config.color} data-[state=active]:text-white rounded-md transition-all text-xs py-2 px-2 ${
                    isActive ? config.color + ' text-white' : config.textColor
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline capitalize">
                    {key === 'all' ? 'All' : key.replace('-', ' ')}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {/* Enhanced Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssessments.map((assessment) => {
                const categoryKey = Object.keys(categoryConfig).find(key => {
                  if (key === 'all') return false;
                  const categoryMap = {
                    'technical-skills': ['Technical Skills', 'Programming', 'Software Development'],
                    'behavioral-assessment': ['Behavioral Assessment', 'Behavioral'],
                    'cognitive-abilities': ['Cognitive Abilities', 'Cognitive', 'IQ'],
                    'industry-knowledge': ['Industry Knowledge', 'Industry Specific'],
                    'soft-skills': ['Soft Skills', 'Communication', 'Leadership'],
                    'personality-assessment': ['Personality Assessment', 'Personality']
                  };
                  const categoryTypes = categoryMap[key] || [];
                  return categoryTypes.some(type => 
                    assessment.assessment_type?.toLowerCase().includes(type.toLowerCase())
                  );
                }) || 'all';
                
                const config = categoryConfig[categoryKey];
                const IconComponent = config.icon;
                
                return (
                  <Card key={assessment.id} className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    {/* Category color strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />
                    
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg ${config.bgColor} border border-opacity-20`}>
                          <IconComponent className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {assessment.is_premium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm text-xs">
                              <Star className="h-2.5 w-2.5 mr-1" />
                              Premium
                            </Badge>
                          )}
                          <Badge className={`border font-medium text-xs ${getDifficultyColor(assessment.difficulty_level)}`}>
                            {assessment.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="mt-1.5 line-clamp-2 text-sm text-muted-foreground/80">
                          {assessment.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div className="flex flex-col items-center p-1.5 bg-muted/40 rounded">
                          <Clock className="h-3.5 w-3.5 mb-1 text-primary" />
                          <span className="font-medium">{assessment.duration_minutes}m</span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 bg-muted/40 rounded">
                          <Brain className="h-3.5 w-3.5 mb-1 text-primary" />
                          <span className="font-medium">{assessment.total_questions}</span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 bg-muted/40 rounded">
                          <Target className="h-3.5 w-3.5 mb-1 text-primary" />
                          <span className="font-medium">{assessment.passing_score}%</span>
                        </div>
                      </div>

                      {assessment.skills_tested && assessment.skills_tested.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assessment.skills_tested.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-background/50 border-muted-foreground/20 px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {assessment.skills_tested.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-background/50 border-muted-foreground/20 px-2 py-0.5">
                              +{assessment.skills_tested.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={() => startAssessment(assessment.id)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 h-9"
                      >
                        <Zap className="h-3.5 w-3.5 mr-2" />
                        Start Assessment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAssessments.length === 0 && (
              <div className="col-span-full text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria to discover more assessments
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Features Banner */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-lg p-6 mt-8 border border-primary/20 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why Choose TalentXcel Assessments?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Award className="h-6 w-6 text-primary mx-auto" />
              </div>
              <h3 className="font-bold mb-2">Industry-Standard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assessments designed by experts and validated by industry professionals worldwide
              </p>
            </div>
            <div className="text-center group">
              <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Brain className="h-6 w-6 text-primary mx-auto" />
              </div>
              <h3 className="font-bold mb-2">AI-Powered Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get detailed insights and personalized recommendations powered by advanced AI
              </p>
            </div>
            <div className="text-center group">
              <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-6 w-6 text-primary mx-auto" />
              </div>
              <h3 className="font-bold mb-2">Verified Certificates</h3>
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