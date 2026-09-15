import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Zap,
  Clock,
  Award,
  Star,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { 
  useUserSkills, 
  useUserAchievements, 
  useLearningAnalytics,
  useSkillsAssessment,
  type UserSkill,
  type UserAchievement 
} from '@/hooks/useAdvancedLearning';
import { toast } from 'sonner';

interface AdvancedLearningDashboardProps {
  userId: string;
}

export const AdvancedLearningDashboard: React.FC<AdvancedLearningDashboardProps> = ({ userId }) => {
  const { data: userSkills, isLoading: skillsLoading } = useUserSkills(userId);
  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements(userId);
  const { data: analytics, isLoading: analyticsLoading } = useLearningAnalytics(userId);
  const { runAssessment, isLoading: assessmentLoading } = useSkillsAssessment();

  const [selectedSkillArea, setSelectedSkillArea] = useState<string>('');

  const handleSkillsAssessment = async () => {
    try {
      await runAssessment({
        userId,
        skillArea: selectedSkillArea || 'general',
        assessmentType: 'comprehensive'
      });
    } catch (error) {
      console.error('Assessment failed:', error);
    }
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-blue-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-green-500';
      default: return 'bg-gray-500';
    }
  };

  const totalSkillPoints = userSkills?.reduce((sum, skill) => sum + skill.proficiency_level, 0) || 0;
  const averageSkillLevel = userSkills?.length ? totalSkillPoints / userSkills.length : 0;
  const totalPracticeHours = userSkills?.reduce((sum, skill) => sum + skill.total_practice_hours, 0) || 0;
  const totalAchievementPoints = achievements?.reduce((sum, achievement) => sum + achievement.points_earned, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageSkillLevel)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across {userSkills?.length || 0} skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalPracticeHours)}</div>
            <p className="text-xs text-muted-foreground">
              Total learning time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {totalAchievementPoints} points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="assessment">AI Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Skills Portfolio</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your proficiency across different skills and technologies
              </p>
            </CardHeader>
            <CardContent>
              {skillsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
                  ))}
                </div>
              ) : userSkills && userSkills.length > 0 ? (
                <div className="space-y-4">
                  {userSkills.map((userSkill) => (
                    <div key={userSkill.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{userSkill.skills.category}</Badge>
                          <span className="font-medium">{userSkill.skills.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {userSkill.total_practice_hours}h practiced
                          </span>
                          <Badge className={getSkillLevelColor(userSkill.proficiency_level)}>
                            {userSkill.proficiency_level}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={userSkill.proficiency_level} className="w-full" />
                      {userSkill.skills.description && (
                        <p className="text-xs text-muted-foreground">
                          {userSkill.skills.description}
                        </p>
                      )}
                      
                      {/* Achievement Badges */}
                      {userSkill.achievement_badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {userSkill.achievement_badges.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No skills tracked yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a course to begin building your skills portfolio
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Gallery</CardTitle>
              <p className="text-sm text-muted-foreground">
                Celebrate your learning milestones and accomplishments
              </p>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
                  ))}
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="relative overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(achievement.rarity_level)}`} />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {achievement.icon_url ? (
                            <img 
                              src={achievement.icon_url} 
                              alt={achievement.achievement_name}
                              className="w-8 h-8 rounded"
                            />
                          ) : (
                            <Award className="h-8 w-8 text-primary" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge className={getRarityColor(achievement.rarity_level)} variant="secondary">
                                {achievement.rarity_level}
                              </Badge>
                              <span className="text-xs font-medium">
                                +{achievement.points_earned} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete courses and exercises to earn achievements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session Duration</span>
                    <span className="font-semibold">45 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Courses Completed</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Knowledge Retention</span>
                    <span className="font-semibold">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Style Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Visual Learning</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Hands-on Practice</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Conceptual Learning</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Skills Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Get personalized insights into your skills and learning path recommendations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <select
                  value={selectedSkillArea}
                  onChange={(e) => setSelectedSkillArea(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 bg-background"
                >
                  <option value="">Select skill area for assessment</option>
                  <option value="programming">Programming & Development</option>
                  <option value="data-science">Data Science & Analytics</option>
                  <option value="design">Design & Creative</option>
                  <option value="business">Business & Marketing</option>
                  <option value="general">General Assessment</option>
                </select>
                <Button 
                  onClick={handleSkillsAssessment}
                  disabled={assessmentLoading}
                  className="px-6"
                >
                  {assessmentLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Run Assessment
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">What you'll get:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Comprehensive skill level analysis</li>
                  <li>• Personalized learning path recommendations</li>
                  <li>• Industry benchmark comparison</li>
                  <li>• Career progression insights</li>
                  <li>• Skill gap identification and solutions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};