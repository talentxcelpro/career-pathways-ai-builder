import React from 'react';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  Users,
  ChevronRight
} from 'lucide-react';

const SkillAssessmentPage = () => {
  const [assessments, setAssessments] = React.useState([]);
  const [userStats, setUserStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Skill Assessment | TalentXcel Learning',
      description: 'Test and validate your skills with comprehensive assessments and earn certificates.'
    });
    
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      const user = await supabase.auth.getUser();
      
      // Fetch available skill assessments
      const { data: skillAssessments, error: assessmentsError } = await supabase
        .from('skill_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      // If no assessments in DB, create some based on skills
      let assessmentData = skillAssessments || [];
      
      if (!assessmentData.length) {
        const { data: skills } = await supabase
          .from('skills')
          .select('*')
          .limit(8);

        assessmentData = (skills || []).map(skill => ({
          id: skill.id,
          title: `${skill.name} Assessment`,
          description: `Test your knowledge and skills in ${skill.name}`,
          skill_name: skill.name,
          category: skill.category || 'Technology',
          difficulty_level: 'intermediate',
          questions_count: 20,
          time_limit_minutes: 30,
          passing_score: 70,
          certificate_eligible: true
        }));

        // Add some default assessments if still empty
        if (!assessmentData.length) {
          assessmentData = [
            {
              id: 'react-assessment',
              title: 'React Development Assessment',
              description: 'Comprehensive test covering React fundamentals, hooks, and best practices',
              skill_name: 'React',
              category: 'Frontend Development',
              difficulty_level: 'intermediate',
              questions_count: 25,
              time_limit_minutes: 45,
              passing_score: 75,
              certificate_eligible: true
            },
            {
              id: 'js-assessment',
              title: 'JavaScript Fundamentals Assessment',
              description: 'Test your core JavaScript knowledge including ES6+ features',
              skill_name: 'JavaScript',
              category: 'Programming',
              difficulty_level: 'beginner',
              questions_count: 20,
              time_limit_minutes: 30,
              passing_score: 70,
              certificate_eligible: true
            },
            {
              id: 'python-assessment',
              title: 'Python Programming Assessment',
              description: 'Evaluate your Python skills from basics to advanced concepts',
              skill_name: 'Python',
              category: 'Programming',
              difficulty_level: 'intermediate',
              questions_count: 30,
              time_limit_minutes: 50,
              passing_score: 75,
              certificate_eligible: true
            }
          ];
        }
      }

      // Mock user stats for now
      const mockStats = {
        totalAssessments: assessmentData.length,
        completedAssessments: Math.floor(assessmentData.length * 0.3),
        averageScore: 78,
        certificatesEarned: Math.floor(assessmentData.length * 0.2),
        skillLevel: 'Intermediate',
        currentStreak: 5
      };

      setAssessments(assessmentData);
      setUserStats(mockStats);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      setAssessments([]);
      setUserStats({
        totalAssessments: 0,
        completedAssessments: 0,
        averageScore: 0,
        certificatesEarned: 0,
        skillLevel: 'Beginner',
        currentStreak: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <LearningPageLayout 
        heroTitle="Skill Assessment" 
        heroDescription="Test and validate your skills with comprehensive assessments and earn certificates"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gradient-card backdrop-blur-apple rounded-lg p-6 h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gradient-card backdrop-blur-apple rounded-lg p-6 h-48" />
              ))}
            </div>
          </div>
        </div>
      </LearningPageLayout>
    );
  }

  return (
    <LearningPageLayout 
      heroTitle="Skill Assessment" 
      heroDescription="Test and validate your skills with comprehensive assessments and earn certificates"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-card backdrop-blur-apple border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                    <p className="text-2xl font-bold text-foreground">{userStats.totalAssessments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-apple border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground">{userStats.completedAssessments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-apple border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold text-foreground">{userStats.averageScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-apple border-glass-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                    <p className="text-2xl font-bold text-foreground">{userStats.certificatesEarned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Assessments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Assessments</h2>
          
          {assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="bg-gradient-card backdrop-blur-apple border-glass-border hover:shadow-glow transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          {assessment.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {assessment.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(assessment.difficulty_level)}>
                          {assessment.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {assessment.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>{assessment.questions_count} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{assessment.time_limit_minutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{assessment.passing_score}% to pass</span>
                        </div>
                      </div>
                      
                      {assessment.certificate_eligible && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Award className="h-3 w-3" />
                          <span>Certificate eligible</span>
                        </div>
                      )}
                      
                      <Button className="w-full group-hover:scale-105 transition-transform">
                        Start Assessment
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No assessments available</h3>
              <p className="text-muted-foreground">Check back later for new skill assessments.</p>
            </div>
          )}
        </div>
      </div>
    </LearningPageLayout>
  );
};

export default SkillAssessmentPage;