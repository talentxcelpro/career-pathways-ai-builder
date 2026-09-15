import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy,
  Target,
  Star,
  Award,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  BookOpen,
  FileText,
  Users,
  Briefcase,
  GraduationCap,
  Zap,
  Shield,
  Activity,
  Clock,
  Plus,
  Edit,
  Share2,
  Download,
  Eye,
  Heart,
  MessageSquare,
  Camera,
  Map,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { TierBadge } from '@/components/ui/tier-badge';

interface Achievement {
  id: string;
  type: 'skill' | 'certification' | 'project' | 'milestone' | 'recognition';
  title: string;
  description: string;
  date: Date;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  issuer?: string;
  verificationUrl?: string;
  skills?: string[];
  isPublic: boolean;
}

interface CareerMetrics {
  careerScore: number;
  profileCompletion: number;
  marketCompetitiveness: number;
  skillRelevance: number;
  networkStrength: number;
  activityLevel: number;
}

interface SkillAssessment {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  lastAssessed: Date;
  verified: boolean;
  endorsements: number;
}

export const AdvancedCareerPassport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);

  // Mock enhanced career passport data
  const careerMetrics: CareerMetrics = {
    careerScore: 847,
    profileCompletion: 89,
    marketCompetitiveness: 92,
    skillRelevance: 85,
    networkStrength: 76,
    activityLevel: 88
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      type: 'certification',
      title: 'AWS Solutions Architect',
      description: 'Professional certification in cloud architecture',
      date: new Date('2024-01-15'),
      points: 150,
      level: 'gold',
      issuer: 'Amazon Web Services',
      verificationUrl: 'https://verify.aws.com/cert123',
      skills: ['AWS', 'Cloud Architecture', 'DevOps'],
      isPublic: true
    },
    {
      id: '2',
      type: 'project',
      title: 'AI-Powered Resume Builder',
      description: 'Built and deployed a full-stack application with 10k+ users',
      date: new Date('2023-12-01'),
      points: 200,
      level: 'platinum',
      skills: ['React', 'Node.js', 'AI/ML', 'PostgreSQL'],
      isPublic: true
    },
    {
      id: '3',
      type: 'milestone',
      title: '5 Years in Tech',
      description: 'Career milestone achievement',
      date: new Date('2023-10-01'),
      points: 100,
      level: 'silver',
      isPublic: true
    },
    {
      id: '4',
      type: 'recognition',
      title: 'Top Performer Q4 2023',
      description: 'Recognized for exceptional performance and leadership',
      date: new Date('2023-12-31'),
      points: 120,
      level: 'gold',
      issuer: 'TechCorp Solutions',
      isPublic: true
    }
  ];

  const skillAssessments: SkillAssessment[] = [
    {
      skill: 'React',
      level: 'expert',
      score: 94,
      lastAssessed: new Date('2024-01-10'),
      verified: true,
      endorsements: 12
    },
    {
      skill: 'TypeScript',
      level: 'advanced',
      score: 87,
      lastAssessed: new Date('2024-01-08'),
      verified: true,
      endorsements: 8
    },
    {
      skill: 'Node.js',
      level: 'advanced',
      score: 89,
      lastAssessed: new Date('2024-01-05'),
      verified: false,
      endorsements: 6
    },
    {
      skill: 'AWS',
      level: 'intermediate',
      score: 76,
      lastAssessed: new Date('2023-12-20'),
      verified: true,
      endorsements: 15
    }
  ];

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'certification': return <Award className="h-5 w-5" />;
      case 'project': return <Briefcase className="h-5 w-5" />;
      case 'milestone': return <Target className="h-5 w-5" />;
      case 'recognition': return <Trophy className="h-5 w-5" />;
      case 'skill': return <Zap className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getAchievementColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      case 'beginner': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <TieredAccessGuard
      feature="advanced_career_passport"
      requiredTier="free"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant={editMode ? "default" : "secondary"} 
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editMode ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src="/avatars/user.jpg" alt="User" />
                  <AvatarFallback className="text-2xl">RK</AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Rajesh Kumar</h1>
                    <TierBadge tier="pro" />
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Career Score</div>
                    <div className="text-3xl font-bold text-purple-600">{careerMetrics.careerScore}</div>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-2">Senior Full Stack Developer</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Map className="h-4 w-4" />
                    Bangalore, India
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    1.2k connections
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    2.5k profile views
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Active this week
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-bold">{careerMetrics.profileCompletion}%</span>
              </div>
              <Progress value={careerMetrics.profileCompletion} className="mb-2" />
              <p className="text-xs text-muted-foreground">Add more skills to reach 100%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Market Competitiveness</span>
                <span className="text-sm font-bold">{careerMetrics.marketCompetitiveness}%</span>
              </div>
              <Progress value={careerMetrics.marketCompetitiveness} className="mb-2" />
              <p className="text-xs text-muted-foreground">Top 8% in your field</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Network Strength</span>
                <span className="text-sm font-bold">{careerMetrics.networkStrength}%</span>
              </div>
              <Progress value={careerMetrics.networkStrength} className="mb-2" />
              <p className="text-xs text-muted-foreground">Connect with 5 more professionals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <Card key={achievement.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getAchievementColor(achievement.level)}`}>
                          {getAchievementIcon(achievement.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} points
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {achievement.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Top Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {skillAssessments.slice(0, 4).map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.skill}</span>
                            {skill.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSkillLevelColor(skill.level)} variant="outline">
                              {skill.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {skill.endorsements} endorsements
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{skill.score}</div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Career Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Career Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border-l-4 border-blue-500">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">AWS Certification Earned</h4>
                      <p className="text-sm text-muted-foreground">
                        Achieved AWS Solutions Architect Professional certification
                      </p>
                      <span className="text-xs text-muted-foreground">January 15, 2024</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 border-l-4 border-green-500">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Project Launch</h4>
                      <p className="text-sm text-muted-foreground">
                        Successfully launched AI-powered resume builder with 10k+ users
                      </p>
                      <span className="text-xs text-muted-foreground">December 1, 2023</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 border-l-4 border-purple-500">
                    <div className="flex-shrink-0">
                      <Trophy className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Performance Recognition</h4>
                      <p className="text-sm text-muted-foreground">
                        Recognized as Top Performer Q4 2023 for exceptional leadership
                      </p>
                      <span className="text-xs text-muted-foreground">December 31, 2023</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    All Achievements ({achievements.length})
                  </CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${getAchievementColor(achievement.level)}`}>
                          {getAchievementIcon(achievement.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <Badge className={getAchievementColor(achievement.level)}>
                              {achievement.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>
                          
                          {achievement.skills && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {achievement.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                +{achievement.points} points
                              </Badge>
                              {achievement.issuer && (
                                <span className="text-xs text-muted-foreground">
                                  by {achievement.issuer}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {achievement.date.toLocaleDateString()}
                            </span>
                          </div>

                          {achievement.verificationUrl && (
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                              <Shield className="h-4 w-4 mr-2" />
                              Verify Credential
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Skill Assessments
                  </CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillAssessments.map((skill) => (
                    <Card key={skill.skill} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{skill.skill}</h3>
                            {skill.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <Badge className={getSkillLevelColor(skill.level)}>
                              {skill.level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Skill Score</span>
                                <span className="font-bold">{skill.score}/100</span>
                              </div>
                              <Progress value={skill.score} />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {skill.endorsements} endorsements
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Last assessed {skill.lastAssessed.toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            Retake Test
                          </Button>
                          <Button variant="outline" size="sm">
                            Get Endorsed
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Career Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Skill Relevance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={careerMetrics.skillRelevance} className="w-32" />
                        <span className="font-medium">{careerMetrics.skillRelevance}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Activity Level</span>
                      <div className="flex items-center gap-2">
                        <Progress value={careerMetrics.activityLevel} className="w-32" />
                        <span className="font-medium">{careerMetrics.activityLevel}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network Growth</span>
                      <div className="flex items-center gap-2">
                        <Progress value={careerMetrics.networkStrength} className="w-32" />
                        <span className="font-medium">{careerMetrics.networkStrength}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Achievements Earned</span>
                      <Badge>4</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Skills Assessed</span>
                      <Badge>2</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">New Connections</span>
                      <Badge>12</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Profile Views</span>
                      <Badge>156</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Career Goals
                  </CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Master Cloud Architecture</h3>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Target: AWS Solutions Architect Professional + Azure fundamentals
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Due: March 2024</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Lead Development Team</h3>
                    <Badge className="bg-green-100 text-green-800">On Track</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Target: Team lead role with 5+ direct reports
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Due: June 2024</span>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};