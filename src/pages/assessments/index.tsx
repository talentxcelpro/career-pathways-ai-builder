import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Clock, Award, Users, Search, Filter, Star, Target, Trophy, Zap } from "lucide-react";
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
  code: Brain,
  users: Users,
  briefcase: Target,
  heart: Star,
  user: Trophy
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Professional Assessments
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Validate your skills, discover your strengths, and accelerate your career with our comprehensive assessment platform
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assessments, skills, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Brain;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-8">
          {/* Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => {
              const IconComponent = iconMap[assessment.category?.icon || 'brain'] || Brain;
              return (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow duration-300 group">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg bg-${assessment.category?.color || 'blue'}-100`}>
                        <IconComponent className={`h-6 w-6 text-${assessment.category?.color || 'blue'}-600`} />
                      </div>
                      <div className="flex flex-col gap-2">
                        {assessment.is_premium && (
                          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        <Badge className={getDifficultyColor(assessment.difficulty_level)}>
                          {assessment.difficulty_level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {assessment.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        {assessment.total_questions} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {assessment.passing_score}% to pass
                      </div>
                    </div>

                    {assessment.skills_tested.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {assessment.skills_tested.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {assessment.skills_tested.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{assessment.skills_tested.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button 
                        onClick={() => startAssessment(assessment.id)}
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="outline"
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
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Why Choose Our Assessments?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Industry-Standard</h3>
            <p className="text-sm text-muted-foreground">
              Assessments designed by experts and validated by industry professionals
            </p>
          </div>
          <div className="text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI-Powered Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed insights and personalized recommendations for growth
            </p>
          </div>
          <div className="text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Verified Certificates</h3>
            <p className="text-sm text-muted-foreground">
              Earn blockchain-verified certificates to showcase your achievements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}