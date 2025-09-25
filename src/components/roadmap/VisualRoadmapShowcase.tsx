import React from 'react';
import { InteractiveCareerPath } from './InteractiveCareerPath';
import { SkillProgressionTree } from './SkillProgressionTree';
import { TimelineVisualization } from './TimelineVisualization';
import { RealTimeCareerData } from './RealTimeCareerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  GraduationCap
} from 'lucide-react';

// Mock data for demonstrations
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
  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              Real-time AI Visualizations
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interactive Career Roadmap Visualizations
          </h1>
          <p className="text-lg text-gray-600">
            Experience your career journey through intelligent, personalized visual roadmaps 
            with real-time AI insights and interactive elements.
          </p>
        </div>
      </div>

      {/* Real-time Career Data */}
      <RealTimeCareerData />

      {/* Personalization Indicators */}
      <Card className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Users className="h-5 w-5" />
            Personalized for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900 mb-1">92%</div>
              <div className="text-sm text-indigo-700">Profile Match</div>
              <p className="text-xs text-indigo-600 mt-1">
                Based on your skills and goals
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">87%</div>
              <div className="text-sm text-green-600">AI Confidence</div>
              <p className="text-xs text-green-600 mt-1">
                High success probability
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-1">18mo</div>
              <div className="text-sm text-purple-600">Time to Goal</div>
              <p className="text-xs text-purple-600 mt-1">
                Optimized learning path
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700 mb-1">3.2x</div>
              <div className="text-sm text-orange-600">Salary Growth</div>
              <p className="text-xs text-orange-600 mt-1">
                Expected career impact
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Roadmap Tabs */}
      <Tabs defaultValue="career-path" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="career-path" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Career Path
          </TabsTrigger>
          <TabsTrigger value="skills-tree" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Skills Tree
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career-path" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Interactive Career Path Diagram
            </h2>
            <p className="text-gray-600">
              Click and explore your personalized career progression with AI-powered insights
            </p>
          </div>
          
          <InteractiveCareerPath
            title="Frontend Developer to Tech Lead"
            description="AI-optimized career progression path with skill recommendations"
            nodes={mockCareerNodes}
            currentNodeId="2"
            onNodeClick={(nodeId) => console.log('Clicked node:', nodeId)}
          />
        </TabsContent>

        <TabsContent value="skills-tree" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Skill Progression Tree
            </h2>
            <p className="text-gray-600">
              Master skills in the optimal order with personalized learning paths
            </p>
          </div>
          
          <SkillProgressionTree
            categories={mockSkillCategories}
            userProfile={{
              currentLevel: 'Frontend Developer',
              targetRole: 'Senior Frontend Engineer',
              experience: '3 years'
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Career Timeline Visualization
            </h2>
            <p className="text-gray-600">
              Navigate your career milestones with intelligent scheduling and progress tracking
            </p>
          </div>
          
          <TimelineVisualization
            title="18-Month Career Acceleration Plan"
            description="Personalized timeline with AI-optimized milestones and skill development"
            events={mockTimelineEvents}
            personalization={mockPersonalization}
            onEventClick={(eventId) => console.log('Clicked event:', eventId)}
          />
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Visualize Your Career Path?</h3>
          <p className="text-blue-100 mb-6">
            Create your personalized visual roadmap with AI-powered insights and interactive elements
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Create My Roadmap
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Analyze My Skills
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};