import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SkillAssessment } from '@/components/skills/SkillAssessment';
import { SkillBadges } from '@/components/skills/SkillBadges';
import { PeerVerification } from '@/components/skills/PeerVerification';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useSkillVerifications } from '@/hooks/useSkillVerifications';
import { 
  Brain, 
  Award, 
  Users, 
  TrendingUp,
  Target,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export const SkillsVerificationCenter: React.FC = () => {
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { progress } = useLearningProgress();
  const { skills, loading } = useSkillVerifications();

  // Real skills data from database
  const skillsStats = {
    totalSkills: skills.length || 0,
    verifiedSkills: skills.filter(s => s.verification_status === 'verified').length || 0,
    pendingVerifications: skills.filter(s => s.verification_status === 'pending').length || 0,
    averageScore: skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + s.verification_score, 0) / skills.length) : 0,
    topSkills: skills.filter(s => s.verification_status === 'verified').slice(0, 4).map(s => s.skill_name),
    improvementAreas: skills.filter(s => s.verification_status === 'pending' || s.verification_score < 70).slice(0, 3).map(s => s.skill_name)
  };

  const handleStartAssessment = (skill: string) => {
    setActiveAssessment(skill);
    setSelectedTab('assessment');
  };

  const handleAssessmentComplete = (score: number) => {
    setActiveAssessment(null);
    setSelectedTab('badges');
  };

  // Calculate completion percentage
  const completionPercentage = Math.round((skillsStats.verifiedSkills / skillsStats.totalSkills) * 100);

  if (activeAssessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveAssessment(null)}
            className="mb-4"
          >
            ← Back to Skills Center
          </Button>
        </div>
        <SkillAssessment 
          skill={activeAssessment} 
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skills Verification Center</h1>
        <p className="text-muted-foreground">
          Verify your skills, earn badges, and build professional credibility
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            My Badges
          </TabsTrigger>
          <TabsTrigger value="peer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Peer Verification
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Path
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{skillsStats.totalSkills}</div>
                    <p className="text-sm text-muted-foreground">Total Skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{skillsStats.verifiedSkills}</div>
                    <p className="text-sm text-muted-foreground">Verified Skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{skillsStats.pendingVerifications}</div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{skillsStats.averageScore}%</div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Verification Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {skillsStats.verifiedSkills} of {skillsStats.totalSkills} skills verified
              </p>
            </CardContent>
          </Card>

          {/* Top Skills & Areas for Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Top Verified Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillsStats.topSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{skill}</span>
                      </div>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Skills to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillsStats.improvementAreas.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStartAssessment(skill)}
                      >
                        Start Assessment
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setSelectedTab('badges')}
                >
                  <Brain className="h-6 w-6" />
                  <span>Take Assessment</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setSelectedTab('peer')}
                >
                  <Users className="h-6 w-6" />
                  <span>Request Peer Review</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setSelectedTab('learning')}
                >
                  <BookOpen className="h-6 w-6" />
                  <span>View Learning Path</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <SkillBadges onVerifySkill={handleStartAssessment} />
        </TabsContent>

        {/* Peer Verification Tab */}
        <TabsContent value="peer">
          <PeerVerification />
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill-Based Learning Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {progress?.slice(0, 3).map((course) => (
                  <Card key={course.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{course.course_title}</h4>
                        <Badge variant="outline">{course.course_provider}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={course.progress_percentage} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{course.progress_percentage}% complete</span>
                          <span>{course.completed_lessons}/{course.total_lessons} lessons</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {course.skill_tags.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};