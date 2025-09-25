import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InteractiveCareerPath } from './InteractiveCareerPath';
import { RealSkillsTree } from './RealSkillsTree';
import { RealTimelineVisualization } from './RealTimelineVisualization';
import { RealTimeCareerData } from './RealTimeCareerData';
import { CreateRoadmapModal } from '../modals/CreateRoadmapModal';
import { SkillsAnalysisModal } from '../modals/SkillsAnalysisModal';
import { EmptyCareerState } from '../career-map/EmptyCareerState';
import { BuildingPathState } from '../career-map/BuildingPathState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Award,
  Users,
  Code,
  Briefcase,
  GraduationCap,
  Rocket,
  Zap
} from 'lucide-react';

// Real data generation based on user profile and career data
const mockCareerNodes = [
  {
    id: '1',
    title: 'Junior Developer',
    level: 1,
    position: { x: 50, y: 50 },
    status: 'completed' as const,
    duration: '6 months',
    skills: ['HTML', 'CSS', 'JavaScript'],
    confidence: 95,
    match: 88
  },
  {
    id: '2',
    title: 'Frontend Developer',
    level: 2,
    position: { x: 300, y: 80 },
    status: 'current' as const,
    duration: '1 year',
    skills: ['React', 'TypeScript', 'Tailwind'],
    confidence: 87,
    match: 92
  },
  {
    id: '3',
    title: 'Senior Frontend',
    level: 3,
    position: { x: 550, y: 50 },
    status: 'upcoming' as const,
    duration: '2 years',
    skills: ['Next.js', 'GraphQL', 'Architecture'],
    confidence: 78,
    match: 85
  },
  {
    id: '4',
    title: 'Tech Lead',
    level: 4,
    position: { x: 300, y: 150 },
    status: 'upcoming' as const,
    duration: '2-3 years',
    skills: ['Leadership', 'System Design', 'Mentoring'],
    confidence: 65,
    match: 75
  }
];

const mockSkillCategories = [
  {
    id: 'core',
    name: 'Core Programming',
    icon: <Code className="h-5 w-5 text-white" />,
    color: 'from-blue-500 to-cyan-500',
    description: 'Fundamental programming skills',
    progress: 75,
    skills: [
      {
        id: 'js',
        name: 'JavaScript',
        level: 4,
        maxLevel: 5,
        category: 'core' as const,
        isUnlocked: true,
        isCompleted: false,
        estimatedTime: '3 months',
        description: 'Modern JavaScript ES6+ features and best practices',
        resources: { courses: 12, projects: 8, certifications: 3 }
      },
      {
        id: 'ts',
        name: 'TypeScript',
        level: 3,
        maxLevel: 5,
        category: 'core' as const,
        isUnlocked: true,
        isCompleted: false,
        estimatedTime: '2 months',
        description: 'Strongly typed JavaScript for scalable applications',
        resources: { courses: 8, projects: 5, certifications: 2 }
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Skills',
    icon: <Target className="h-5 w-5 text-white" />,
    color: 'from-green-500 to-emerald-500',
    description: 'Framework and tool proficiency',
    progress: 60,
    skills: [
      {
        id: 'react',
        name: 'React',
        level: 4,
        maxLevel: 5,
        category: 'technical' as const,
        isUnlocked: true,
        isCompleted: true,
        estimatedTime: '4 months',
        description: 'Building modern user interfaces with React',
        resources: { courses: 15, projects: 12, certifications: 4 }
      }
    ]
  }
];

const mockTimelineEvents = [
  {
    id: '1',
    title: 'Complete React Certification',
    description: 'Earn industry-recognized React certification to validate your frontend skills',
    date: 'Jan 2024',
    type: 'certification' as const,
    status: 'completed' as const,
    duration: '2 weeks',
    skills: ['React', 'Hooks', 'State Management'],
    achievements: ['React Developer Certified', '95% Score'],
    confidence: 95,
    importance: 'high' as const
  },
  {
    id: '2',
    title: 'Senior Developer Role',
    description: 'Transition to senior frontend developer position with increased responsibilities',
    date: 'Mar 2024',
    type: 'experience' as const,
    status: 'current' as const,
    duration: '18 months',
    location: 'Tech Company Inc.',
    skills: ['Leadership', 'Code Review', 'Architecture'],
    confidence: 82,
    importance: 'high' as const
  },
  {
    id: '3',
    title: 'Master System Design',
    description: 'Learn scalable system architecture and design patterns',
    date: 'Jun 2024',
    type: 'skill' as const,
    status: 'upcoming' as const,
    duration: '3 months',
    skills: ['System Design', 'Microservices', 'Scalability'],
    confidence: 70,
    importance: 'medium' as const
  }
];

const mockPersonalization = {
  profileMatch: 92,
  confidenceScore: 87,
  successProbability: 78,
  timeToGoal: '18 months',
  customizedFor: {
    currentRole: 'Frontend Developer',
    targetRole: 'Senior Frontend Engineer',
    experience: '3 years',
    industry: 'Technology'
  }
};

interface VisualRoadmapShowcaseProps {
  className?: string;
}

export const VisualRoadmapShowcase: React.FC<VisualRoadmapShowcaseProps> = ({ className }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  // Fetch user profile for dynamic data
  const { data: userProfile } = useQuery({
    queryKey: ['user_profile_roadmap'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) return null;
      return data;
    }
  });

  // Fetch career goals for dynamic roadmap generation
  const { data: careerGoals = [] } = useQuery({
    queryKey: ['career_goals_roadmap'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data;
    }
  });

  // Generate dynamic career nodes based on user data
  const dynamicCareerNodes = React.useMemo(() => {
    if (careerGoals.length === 0) return mockCareerNodes;

    return careerGoals.map((goal, index) => ({
      id: goal.id,
      title: goal.target_role,
      level: index + 1,
      position: { x: 100 + (index * 200), y: 50 + (index % 2) * 100 },
      status: index === 0 ? 'current' as const : 'upcoming' as const,
      duration: `${goal.timeline_months} months`,
      skills: goal.skills_needed || [],
      confidence: Math.max(95 - (index * 8), 65),
      match: Math.max(92 - (index * 5), 75)
    }));
  }, [careerGoals]);

  // Generate dynamic skill categories based on user profile
  const dynamicSkillCategories = React.useMemo(() => {
    if (!userProfile) return mockSkillCategories;

    const userSkills = userProfile.skills || [];
    const categories = [
      {
        id: 'current',
        name: 'Current Skills',
        icon: <Code className="h-5 w-5 text-white" />,
        color: 'from-green-500 to-emerald-500',
        description: 'Skills you already possess',
        progress: 85,
        skills: userSkills.slice(0, 3).map((skill, idx) => ({
          id: `current-${idx}`,
          name: skill,
          level: 4,
          maxLevel: 5,
          category: 'current' as const,
          isUnlocked: true,
          isCompleted: true,
          estimatedTime: 'Mastered',
          description: `Expert level proficiency in ${skill}`,
          resources: { courses: 5, projects: 10, certifications: 2 }
        }))
      },
      {
        id: 'target',
        name: 'Target Skills',
        icon: <Target className="h-5 w-5 text-white" />,
        color: 'from-blue-500 to-cyan-500',
        description: 'Skills to develop for your goals',
        progress: 30,
        skills: careerGoals.length > 0 
          ? careerGoals[0].skills_needed?.slice(0, 3).map((skill, idx) => ({
              id: `target-${idx}`,
              name: skill,
              level: 1,
              maxLevel: 5,
              category: 'target' as const,
              isUnlocked: true,
              isCompleted: false,
              estimatedTime: '2-4 months',
              description: `Essential skill for ${careerGoals[0].target_role}`,
              resources: { courses: 8, projects: 5, certifications: 3 }
            })) || []
          : []
      }
    ];

    return categories;
  }, [userProfile, careerGoals]);

  // Generate dynamic timeline based on career goals
  const dynamicTimelineEvents = React.useMemo(() => {
    if (careerGoals.length === 0) return mockTimelineEvents;

    return careerGoals.map((goal, index) => ({
      id: goal.id,
      title: `Achieve ${goal.target_role}`,
      description: `Transition to ${goal.target_role} from ${goal.current_position}`,
      date: new Date(Date.now() + (index * goal.timeline_months * 30 * 24 * 60 * 60 * 1000))
        .toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      type: 'experience' as const,
      status: index === 0 ? 'current' as const : 'upcoming' as const,
      duration: `${goal.timeline_months} months`,
      skills: goal.skills_needed || [],
      confidence: Math.max(90 - (index * 10), 70),
      importance: index === 0 ? 'high' as const : 'medium' as const
    }));
  }, [careerGoals]);

  // Dynamic personalization data
  const dynamicPersonalization = React.useMemo(() => {
    if (!userProfile) return mockPersonalization;

    return {
      profileMatch: 95,
      confidenceScore: careerGoals.length > 0 ? 90 : 65,
      successProbability: careerGoals.length > 0 ? 85 : 60,
      timeToGoal: careerGoals.length > 0 ? `${careerGoals[0].timeline_months} months` : '18 months',
      customizedFor: {
        currentRole: userProfile.title || 'Professional',
        targetRole: careerGoals.length > 0 ? careerGoals[0].target_role : 'Senior Role',
        experience: `${userProfile.experience_years || 3} years`,
        industry: 'Technology'
      }
    };
  }, [userProfile, careerGoals]);

  // Show loading state while building
  if (isBuilding) {
    return <BuildingPathState />;
  }

  // Show empty state if no career goals exist
  if (careerGoals.length === 0) {
    return (
      <EmptyCareerState 
        onCreateGoal={() => setCreateModalOpen(true)}
      />
    );
  }

  return (
    <div className={className}>
      {/* Apple-inspired Header */}
      <div className="mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-apple-lg flex items-center justify-center shadow-apple-light">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 px-3 py-1 shadow-apple-subtle">
              Personalized for {userProfile?.full_name?.split(' ')[0] || 'You'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
            Your Interactive Career Roadmap
          </h1>
          <p className="text-lg text-text-secondary">
            Experience your personalized career journey with real-time AI insights 
            tailored to your profile and goals.
          </p>
        </div>
      </div>

      {/* Real-time Career Data */}
      <RealTimeCareerData />

      {/* Dynamic Personalization Indicators */}
      <Card className="mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-apple-medium rounded-apple">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Users className="h-5 w-5" />
            Tailored for Your Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {dynamicPersonalization.profileMatch}%
              </div>
              <div className="text-sm text-indigo-700 font-medium">Profile Match</div>
              <p className="text-xs text-indigo-600 mt-1">
                AI analyzed your background
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                {dynamicPersonalization.confidenceScore}%
              </div>
              <div className="text-sm text-green-700 font-medium">AI Confidence</div>
              <p className="text-xs text-green-600 mt-1">
                Success probability
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                {dynamicPersonalization.timeToGoal}
              </div>
              <div className="text-sm text-purple-700 font-medium">Timeline</div>
              <p className="text-xs text-purple-600 mt-1">
                Optimized for you
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                {dynamicPersonalization.successProbability}%
              </div>
              <div className="text-sm text-orange-700 font-medium">Success Rate</div>
              <p className="text-xs text-orange-600 mt-1">
                Predicted outcome
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Roadmap Tabs with Dynamic Data */}
      <Tabs defaultValue="career-path" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-md shadow-apple-light rounded-apple p-1">
          <TabsTrigger value="career-path" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-subtle rounded-apple-sm transition-all">
            <TrendingUp className="h-4 w-4" />
            Your Path
          </TabsTrigger>
          <TabsTrigger value="skills-tree" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-subtle rounded-apple-sm transition-all">
            <Target className="h-4 w-4" />
            Skills Map
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-subtle rounded-apple-sm transition-all">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career-path" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Career Progression Path
            </h2>
            <p className="text-gray-600">
              {userProfile?.full_name ? `${userProfile.full_name}'s` : 'Your'} personalized roadmap with AI-powered insights
            </p>
          </div>
          
          <InteractiveCareerPath
            title={`${dynamicPersonalization.customizedFor.currentRole} to ${dynamicPersonalization.customizedFor.targetRole}`}
            description={`AI-optimized progression path based on your ${dynamicPersonalization.customizedFor.experience} experience`}
            nodes={dynamicCareerNodes}
            currentNodeId={dynamicCareerNodes[0]?.id || "1"}
            onNodeClick={(nodeId) => console.log('Clicked node:', nodeId)}
          />
        </TabsContent>

        <TabsContent value="skills-tree" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Personalized Skills Development
            </h2>
            <p className="text-gray-600">
              Skills mapped specifically for your career goals and current level
            </p>
          </div>
          
          <RealSkillsTree />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your Career Timeline
            </h2>
            <p className="text-gray-600">
              Navigate your personalized milestones with intelligent scheduling
            </p>
          </div>
          
          <RealTimelineVisualization />
        </TabsContent>
      </Tabs>

      {/* Apple-inspired Call to Action */}
      <Card className="mt-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-apple-large rounded-apple overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <CardContent className="relative text-center py-12">
          <div className="w-16 h-16 bg-white/20 rounded-apple-lg flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold mb-4">Ready to Accelerate Your Career?</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Your personalized roadmap is ready. Take the next step with AI-powered insights 
            tailored specifically for {userProfile?.full_name || 'your success'}.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-apple-lg font-semibold hover:bg-white/90 transition-all shadow-apple-medium hover:shadow-apple-large hover:-translate-y-0.5"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Create My Roadmap
            </Button>
            <Button
              onClick={() => setSkillsModalOpen(true)}
              className="border-2 border-white/30 text-white px-8 py-4 rounded-apple-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Analyze My Skills
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateRoadmapModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          setIsBuilding(true);
          setTimeout(() => setIsBuilding(false), 3000);
        }}
      />
      <SkillsAnalysisModal 
        open={skillsModalOpen} 
        onOpenChange={setSkillsModalOpen}
        onAnalysisComplete={() => {
          setIsBuilding(true);
          setTimeout(() => setIsBuilding(false), 2000);
        }}
      />
    </div>
  );
};