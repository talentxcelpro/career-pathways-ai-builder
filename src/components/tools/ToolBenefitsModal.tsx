import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Users, 
  Brain,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  txc_cost: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  icon: React.ComponentType<any>;
}

interface ToolBenefitsModalProps {
  tool: Tool | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStartTesting?: () => void;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'immediate' | 'career' | 'skills' | 'network';
  impact: 'high' | 'medium' | 'low';
}

interface Feature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  category: 'ai' | 'analytics' | 'export' | 'collaboration';
}

export const ToolBenefitsModal: React.FC<ToolBenefitsModalProps> = ({ tool, isOpen = false, onOpenChange, onStartTesting }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const navigate = useNavigate();

  // Early return if tool is null to prevent rendering issues
  if (!tool) {
    return null;
  }

  // Sync with external open state
  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const handleLaunchTool = () => {
    handleOpenChange(false);
    if (onStartTesting) {
      onStartTesting();
    }
    
    if (tool?.slug) {
      const routeMap: Record<string, string> = {
        'job-application-funnel': '/tools/job-matcher',
        'resume-performance-insights': '/resume',
        'career-growth-score': '/career-intelligence',
        'ai-career-pathfinder': '/roadmap-builder',
        'skill-gap-analyzer': '/skills-assessment',
        'interview-simulator': '/tools/interview-prep',
        'salary-market-insights': '/tools/salary-analyzer',
        'resume-builder-pro': '/resume/build',
        'cover-letter-generator': '/tools/cover-letter',
        'profile-optimizer': '/tools/profile-optimizer',
        'skill-assessment-engine': '/tools/skill-assessment-engine',
        'skills-verification-center': '/skills-verification',
        'instant-networking-system': '/instant-networking',
      };
      const targetRoute = routeMap[tool.slug] || (tool.slug.startsWith('/') ? tool.slug : `/tools/${tool.slug}`);
      navigate(targetRoute);
    }
  };

  const getBenefits = (): Benefit[] => {
    // Comprehensive tool-specific benefits
    const toolSpecificBenefits: Record<string, Benefit[]> = {
      'role-fit-evaluator': [
        {
          id: 'role-matching',
          title: 'Perfect Role Matching',
          description: 'AI analyzes your skills against role requirements for perfect fit assessment',
          icon: Target,
          category: 'immediate',
          impact: 'high'
        },
        {
          id: 'career-alignment',
          title: 'Career Path Alignment',
          description: 'Discover roles that align with your career goals and aspirations',
          icon: TrendingUp,
          category: 'career',
          impact: 'high'
        },
        {
          id: 'skill-gap-analysis',
          title: 'Skill Gap Identification',
          description: 'Identify specific skills needed to excel in your target role',
          icon: Brain,
          category: 'skills',
          impact: 'medium'
        }
      ],
      'mock-interview-simulator': [
        {
          id: 'realistic-practice',
          title: 'Realistic Interview Practice',
          description: 'Practice with AI interviewer in realistic interview scenarios',
          icon: Award,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'confidence-building',
          title: 'Confidence Building',
          description: 'Build confidence through repeated practice and feedback',
          icon: TrendingUp,
          category: 'immediate',
          impact: 'high'
        },
        {
          id: 'feedback-insights',
          title: 'Performance Analytics',
          description: 'Get detailed feedback on your answers and presentation style',
          icon: BarChart3,
          category: 'skills',
          impact: 'medium'
        }
      ],
      'resume-performance-insights': [
        {
          id: 'ats-optimization',
          title: 'ATS Optimization',
          description: 'Ensure your resume passes applicant tracking systems',
          icon: Shield,
          category: 'immediate',
          impact: 'high'
        },
        {
          id: 'keyword-optimization',
          title: 'Keyword Optimization',
          description: 'Optimize your resume with industry-relevant keywords',
          icon: Zap,
          category: 'immediate',
          impact: 'high'
        },
        {
          id: 'impact-enhancement',
          title: 'Impact Enhancement',
          description: 'Transform your experiences into compelling achievements',
          icon: Star,
          category: 'career',
          impact: 'medium'
        }
      ],
      'ai-career-pathfinder': [
        {
          id: 'personalized-roadmap',
          title: 'Personalized Career Roadmap',
          description: 'AI creates a custom career path based on your goals and experience',
          icon: Target,
          category: 'career',
          impact: 'high'
        },
        {
          id: 'market-opportunities',
          title: 'Market Opportunities',
          description: 'Discover emerging opportunities in your field',
          icon: TrendingUp,
          category: 'network',
          impact: 'high'
        },
        {
          id: 'strategic-planning',
          title: 'Strategic Planning',
          description: 'Long-term career strategy with actionable milestones',
          icon: Brain,
          category: 'career',
          impact: 'medium'
        }
      ],
      'career-swot-analysis': [
        {
          id: 'strengths-identification',
          title: 'Strengths Identification',
          description: 'Discover and leverage your unique professional strengths',
          icon: Star,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'weakness-mitigation',
          title: 'Weakness Mitigation',
          description: 'Identify areas for improvement and create action plans',
          icon: Target,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'opportunity-mapping',
          title: 'Opportunity Mapping',
          description: 'Map external opportunities to your skillset',
          icon: TrendingUp,
          category: 'career',
          impact: 'medium'
        }
      ],
      'career-change-navigator': [
        {
          id: 'transition-strategy',
          title: 'Transition Strategy',
          description: 'Strategic approach to changing careers with minimal risk',
          icon: Target,
          category: 'career',
          impact: 'high'
        },
        {
          id: 'skill-bridging',
          title: 'Skill Bridging',
          description: 'Connect your existing skills to new career paths',
          icon: Brain,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'timeline-planning',
          title: 'Timeline Planning',
          description: 'Realistic timeline for your career transition',
          icon: Clock,
          category: 'immediate',
          impact: 'medium'
        }
      ],
      'interview-qa-bank': [
        {
          id: 'question-preparation',
          title: 'Comprehensive Question Bank',
          description: 'Access 1000+ curated interview questions by industry',
          icon: Brain,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'answer-templates',
          title: 'Answer Templates',
          description: 'Proven answer frameworks for common interview questions',
          icon: Award,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'industry-specific',
          title: 'Industry-Specific Prep',
          description: 'Tailored questions for your specific industry and role',
          icon: Target,
          category: 'immediate',
          impact: 'medium'
        }
      ],
      'star-answer-generator': [
        {
          id: 'structured-answers',
          title: 'Structured Answer Framework',
          description: 'Generate compelling STAR format answers automatically',
          icon: Star,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'story-optimization',
          title: 'Story Optimization',
          description: 'Transform your experiences into powerful interview stories',
          icon: TrendingUp,
          category: 'skills',
          impact: 'high'
        },
        {
          id: 'impact-measurement',
          title: 'Impact Measurement',
          description: 'Quantify your achievements for maximum impact',
          icon: BarChart3,
          category: 'immediate',
          impact: 'medium'
        }
      ],
      'job-application-funnel': [
        {
          id: 'application-tracking',
          title: 'Application Tracking',
          description: 'Monitor your job applications across all platforms',
          icon: BarChart3,
          category: 'immediate',
          impact: 'high'
        },
        {
          id: 'conversion-optimization',
          title: 'Conversion Optimization',
          description: 'Optimize your application process for better response rates',
          icon: TrendingUp,
          category: 'career',
          impact: 'high'
        },
        {
          id: 'performance-insights',
          title: 'Performance Insights',
          description: 'Data-driven insights to improve your job search strategy',
          icon: Brain,
          category: 'skills',
          impact: 'medium'
        }
      ],
      'career-growth-score': [
        {
          id: 'growth-metrics',
          title: 'Career Growth Metrics',
          description: 'Quantify your career progression with AI-powered scoring',
          icon: TrendingUp,
          category: 'career',
          impact: 'high'
        },
        {
          id: 'benchmark-comparison',
          title: 'Industry Benchmarking',
          description: 'Compare your growth against industry standards',
          icon: BarChart3,
          category: 'network',
          impact: 'high'
        },
        {
          id: 'improvement-roadmap',
          title: 'Improvement Roadmap',
          description: 'Actionable steps to accelerate your career growth',
          icon: Target,
          category: 'skills',
          impact: 'medium'
        }
      ]
    };

    // Get tool-specific benefits or fallback to generic ones
    const specificBenefits = toolSpecificBenefits[tool.slug] || [
      {
        id: 'ai-powered',
        title: 'AI-Powered Analysis',
        description: `Get intelligent insights tailored for ${tool.name}`,
        icon: Brain,
        category: 'immediate',
        impact: 'high'
      },
      {
        id: 'career-growth',
        title: 'Career Growth',
        description: 'Accelerate your professional development and career advancement',
        icon: TrendingUp,
        category: 'career',
        impact: 'high'
      },
      {
        id: 'time-saving',
        title: 'Time Efficiency',
        description: 'Save hours of manual work with automated analysis and recommendations',
        icon: Clock,
        category: 'immediate',
        impact: 'medium'
      }
    ];

    return specificBenefits;
  };

  // Generate tool-specific features
  const getAdvancedFeatures = (): Feature[] => {
    const toolSpecificFeatures: Record<string, Feature[]> = {
      'role-fit-evaluator': [
        {
          id: 'skills-mapping',
          name: 'Advanced Skills Mapping',
          description: 'AI algorithm maps your skills to role requirements with 95% accuracy',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'role-analytics',
          name: 'Role Compatibility Dashboard',
          description: 'Comprehensive analysis of role compatibility and growth potential',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'detailed-reports',
          name: 'Professional Assessment Reports',
          description: 'Export detailed role fit reports in PDF and Word formats',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'mentor-sharing',
          name: 'Career Mentor Integration',
          description: 'Share assessments with career mentors and coaches',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'mock-interview-simulator': [
        {
          id: 'question-bank',
          name: 'Extensive Question Library',
          description: 'Access to 2000+ interview questions across all industries',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'performance-tracking',
          name: 'Performance Analytics',
          description: 'Track improvement across multiple practice sessions',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'video-recording',
          name: 'Video Analysis & Feedback',
          description: 'AI-powered body language and speech pattern analysis',
          isPremium: true,
          category: 'ai'
        },
        {
          id: 'mock-interviews',
          name: 'Live Mock Interviews',
          description: 'Schedule live interviews with industry professionals',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'resume-performance-insights': [
        {
          id: 'ats-scanner',
          name: 'ATS Compatibility Engine',
          description: 'Test against 50+ major applicant tracking systems',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'keyword-analysis',
          name: 'Keyword Optimization Engine',
          description: 'AI-driven keyword analysis for maximum visibility',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'multiple-formats',
          name: 'Multi-Format Export',
          description: 'Export in ATS-friendly and designer formats',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'recruiter-insights',
          name: 'Recruiter Feedback Network',
          description: 'Get feedback from verified industry recruiters',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'ai-career-pathfinder': [
        {
          id: 'path-mapping',
          name: 'AI Career Path Mapping',
          description: 'Machine learning algorithms create personalized career routes',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'market-analysis',
          name: 'Real-Time Market Analysis',
          description: 'Live job market data and trend analysis',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'roadmap-export',
          name: 'Interactive Roadmap Export',
          description: 'Export your career roadmap as interactive timeline',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'mentor-matching',
          name: 'AI Mentor Matching',
          description: 'Connect with mentors in your target career path',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'career-swot-analysis': [
        {
          id: 'swot-engine',
          name: 'Advanced SWOT Engine',
          description: 'AI-powered analysis of strengths, weaknesses, opportunities, threats',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'competitive-analysis',
          name: 'Competitive Positioning',
          description: 'Analyze your position relative to industry peers',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'strategy-export',
          name: 'Strategic Plan Export',
          description: 'Export comprehensive career strategy documents',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'coach-collaboration',
          name: 'Career Coach Integration',
          description: 'Share SWOT analysis with certified career coaches',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'career-change-navigator': [
        {
          id: 'transition-ai',
          name: 'Career Transition AI',
          description: 'AI assistant specialized in career change strategies',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'risk-assessment',
          name: 'Transition Risk Assessment',
          description: 'Analyze financial and professional risks of career change',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'transition-plan',
          name: 'Detailed Transition Plan',
          description: 'Export step-by-step career change timeline',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'peer-network',
          name: 'Career Changer Network',
          description: 'Connect with others making similar career transitions',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'interview-qa-bank': [
        {
          id: 'smart-questions',
          name: 'Smart Question Curation',
          description: 'AI curates questions based on your specific role and experience',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'difficulty-progression',
          name: 'Adaptive Difficulty',
          description: 'Questions adapt to your performance and skill level',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'custom-bank',
          name: 'Custom Question Bank',
          description: 'Create and export personalized question sets',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'peer-practice',
          name: 'Peer Practice Sessions',
          description: 'Practice with other job seekers in similar roles',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'star-answer-generator': [
        {
          id: 'story-ai',
          name: 'STAR Story AI',
          description: 'AI transforms your experiences into compelling STAR stories',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'impact-calculator',
          name: 'Impact Quantification',
          description: 'Calculate and optimize the impact metrics in your stories',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'story-library',
          name: 'Personal Story Library',
          description: 'Export and organize your STAR stories for different situations',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'story-feedback',
          name: 'Story Feedback Circle',
          description: 'Get feedback on your stories from interview coaches',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'job-application-funnel': [
        {
          id: 'application-ai',
          name: 'Application Intelligence',
          description: 'AI tracks and analyzes your application performance',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'conversion-metrics',
          name: 'Conversion Analytics',
          description: 'Track application-to-interview conversion rates',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'funnel-reports',
          name: 'Detailed Funnel Reports',
          description: 'Export comprehensive application funnel analysis',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'recruiter-network',
          name: 'Recruiter Network Insights',
          description: 'Access recruiter preferences and application tips',
          isPremium: true,
          category: 'collaboration'
        }
      ],
      'career-growth-score': [
        {
          id: 'growth-ai',
          name: 'Career Growth AI',
          description: 'AI calculates your career trajectory and growth potential',
          isPremium: false,
          category: 'ai'
        },
        {
          id: 'peer-benchmarking',
          name: 'Industry Benchmarking',
          description: 'Compare your growth against industry peers',
          isPremium: false,
          category: 'analytics'
        },
        {
          id: 'growth-reports',
          name: 'Growth Trajectory Reports',
          description: 'Export detailed career growth analysis and projections',
          isPremium: true,
          category: 'export'
        },
        {
          id: 'peer-insights',
          name: 'Peer Growth Insights',
          description: 'Learn from high-performing professionals in your field',
          isPremium: true,
          category: 'collaboration'
        }
      ]
    };

    // Fallback features for tools not specifically defined
    const defaultFeatures: Feature[] = [
      {
        id: 'ai-analysis',
        name: 'AI-Powered Analysis',
        description: `Smart analysis capabilities specifically designed for ${tool.name}`,
        isPremium: false,
        category: 'ai'
      },
      {
        id: 'progress-tracking',
        name: 'Progress Tracking',
        description: 'Monitor your improvement and track key metrics over time',
        isPremium: false,
        category: 'analytics'
      },
      {
        id: 'export-results',
        name: 'Export Results',
        description: 'Download your results in professional formats',
        isPremium: true,
        category: 'export'
      },
      {
        id: 'expert-support',
        name: 'Expert Support',
        description: 'Get personalized guidance from industry experts',
        isPremium: true,
        category: 'collaboration'
      }
    ];

    return toolSpecificFeatures[tool.slug] || defaultFeatures;
  };

  // Memoize expensive computations and ensure they only run when tool is valid
  const benefits = React.useMemo(() => getBenefits(), [tool.slug]);
  const features = React.useMemo(() => getAdvancedFeatures(), [tool.slug]);

  // Tool-specific stats with unique data for each tool
  const getToolStats = () => {
    const toolStats: Record<string, any> = {
      'role-fit-evaluator': {
        avgTimeReduction: '85%',
        accuracyImprovement: '96%',
        userSatisfaction: '4.9/5',
        careerAdvancement: '2.3x faster'
      },
      'mock-interview-simulator': {
        avgTimeReduction: '70%',
        accuracyImprovement: '91%',
        userSatisfaction: '4.8/5',
        careerAdvancement: '3.1x faster'
      },
      'resume-performance-insights': {
        avgTimeReduction: '92%',
        accuracyImprovement: '97%',
        userSatisfaction: '4.9/5',
        careerAdvancement: '2.7x faster'
      },
      'ai-career-pathfinder': {
        avgTimeReduction: '78%',
        accuracyImprovement: '94%',
        userSatisfaction: '4.7/5',
        careerAdvancement: '4.2x faster'
      },
      'career-swot-analysis': {
        avgTimeReduction: '83%',
        accuracyImprovement: '89%',
        userSatisfaction: '4.6/5',
        careerAdvancement: '2.9x faster'
      },
      'career-change-navigator': {
        avgTimeReduction: '76%',
        accuracyImprovement: '93%',
        userSatisfaction: '4.8/5',
        careerAdvancement: '3.8x faster'
      },
      'interview-qa-bank': {
        avgTimeReduction: '68%',
        accuracyImprovement: '88%',
        userSatisfaction: '4.5/5',
        careerAdvancement: '2.4x faster'
      },
      'star-answer-generator': {
        avgTimeReduction: '74%',
        accuracyImprovement: '92%',
        userSatisfaction: '4.7/5',
        careerAdvancement: '2.8x faster'
      },
      'job-application-funnel': {
        avgTimeReduction: '81%',
        accuracyImprovement: '95%',
        userSatisfaction: '4.8/5',
        careerAdvancement: '3.5x faster'
      },
      'career-growth-score': {
        avgTimeReduction: '79%',
        accuracyImprovement: '93%',
        userSatisfaction: '4.6/5',
        careerAdvancement: '3.2x faster'
      }
    };

    return toolStats[tool.slug] || {
      avgTimeReduction: '75%',
      accuracyImprovement: '92%',
      userSatisfaction: '4.8/5',
      careerAdvancement: '3x faster'
    };
  };

  // Memoize stats computation
  const stats = React.useMemo(() => getToolStats(), [tool.slug]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-2xl border-2 border-purple-200/80 text-purple-700 hover:bg-purple-50/80 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
        >
          <Star className="h-4 w-4 mr-2 animate-pulse" />
          Benefits
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white/95 via-white/90 to-purple-50/30 backdrop-blur-xl border-2 border-white/20 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md">
              {tool.icon && React.createElement(tool.icon, { 
                className: "h-7 w-7 stroke-[2.2]" 
              })}
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">
                {tool.name}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Overview & Capabilities
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Unlock actionable AI insights designed to advance your professional trajectory with {tool.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
          <Tabs defaultValue="benefits" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-white/40 shadow-lg">
              <TabsTrigger value="benefits" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Benefits</TabsTrigger>
              <TabsTrigger value="features" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Features</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Stats</TabsTrigger>
              <TabsTrigger value="roadmap" className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300">Roadmap</TabsTrigger>
            </TabsList>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <Card 
                    key={benefit.id}
                    className={cn(
                      "group transition-all duration-500 hover:shadow-2xl cursor-pointer transform hover:-translate-y-2",
                      "border-2 backdrop-blur-sm",
                      "hover:scale-105",
                      benefit.impact === 'high' && "border-l-4 border-l-green-400 bg-gradient-to-br from-green-50/80 to-emerald-50/60 hover:from-green-100/90 hover:to-emerald-100/80",
                      benefit.impact === 'medium' && "border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 hover:from-amber-100/90 hover:to-yellow-100/80",
                      benefit.impact === 'low' && "border-l-4 border-l-slate-400 bg-gradient-to-br from-slate-50/80 to-gray-50/60 hover:from-slate-100/90 hover:to-gray-100/80"
                    )}
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110",
                            benefit.impact === 'high' && "bg-gradient-to-br from-green-100/90 to-emerald-100/90 text-green-600 group-hover:shadow-green-200",
                            benefit.impact === 'medium' && "bg-gradient-to-br from-amber-100/90 to-yellow-100/90 text-amber-600 group-hover:shadow-amber-200",
                            benefit.impact === 'low' && "bg-gradient-to-br from-slate-100/90 to-gray-100/90 text-slate-600 group-hover:shadow-slate-200"
                          )}>
                            {React.createElement(benefit.icon, { className: "h-6 w-6" })}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold">{benefit.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs mt-2 capitalize font-medium border-2 backdrop-blur-sm",
                                benefit.impact === 'high' && "border-green-400/60 text-green-700 bg-green-50/80",
                                benefit.impact === 'medium' && "border-amber-400/60 text-amber-700 bg-amber-50/80",
                                benefit.impact === 'low' && "border-slate-400/60 text-slate-700 bg-slate-50/80"
                              )}
                            >
                              {benefit.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm leading-relaxed text-slate-700 font-medium">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Free Features
                </h3>
                {features.filter(f => !f.isPremium).map((feature) => (
                  <Card key={feature.id} className="bg-green-50/50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {feature.category === 'ai' && <Brain className="h-4 w-4 text-green-600" />}
                          {feature.category === 'analytics' && <BarChart3 className="h-4 w-4 text-green-600" />}
                          {feature.category === 'export' && <ArrowRight className="h-4 w-4 text-green-600" />}
                          {feature.category === 'collaboration' && <Users className="h-4 w-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">{feature.name}</h4>
                          <p className="text-sm text-green-700 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Premium Features
                </h3>
                {features.filter(f => f.isPremium).map((feature) => (
                  <Card key={feature.id} className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {feature.category === 'ai' && <Brain className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'analytics' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'export' && <ArrowRight className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'collaboration' && <Users className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-purple-900">{feature.name}</h4>
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                              Pro
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {stats.avgTimeReduction}
                  </div>
                  <div className="text-sm text-blue-700">Time Reduction</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {stats.accuracyImprovement}
                  </div>
                  <div className="text-sm text-green-700">Accuracy</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-900 mb-1">
                    {stats.userSatisfaction}
                  </div>
                  <div className="text-sm text-yellow-700">User Rating</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {stats.careerAdvancement}
                  </div>
                  <div className="text-sm text-purple-700">Career Growth</div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Success Stories</CardTitle>
                <CardDescription>Real outcomes from tool users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">Sarah M. - Software Engineer</div>
                      <div className="text-sm text-green-700">
                        "Landed 3 interviews in 2 weeks after using this tool. The AI insights were game-changing!"
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">Mike R. - Product Manager</div>
                      <div className="text-sm text-blue-700">
                        "Got promoted 6 months earlier than expected. The skill gap analysis was spot-on!"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                    <Star className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium">Lisa K. - Marketing Director</div>
                      <div className="text-sm text-purple-700">
                        "Increased my market value by 40%. The personalized recommendations were incredible!"
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-8 animate-fade-in">
            <Card className="bg-gradient-to-br from-white/80 to-purple-50/40 backdrop-blur-sm border-2 border-white/40 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Career Journey with {tool.name}
                </CardTitle>
                <CardDescription className="text-base text-slate-700">
                  Here's how this tool fits into your career advancement strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(() => {
                    // Tool-specific roadmap steps
                    const toolRoadmaps: Record<string, any[]> = {
                      'role-fit-evaluator': [
                        {
                          step: 1,
                          title: "Skills & Goals Assessment",
                          description: "Comprehensive analysis of your current skills and career aspirations",
                          duration: "8-12 minutes",
                          color: "emerald"
                        },
                        {
                          step: 2,
                          title: "AI Role Matching",
                          description: "Advanced algorithms match you with compatible roles and opportunities",
                          duration: "Instant",
                          color: "blue"
                        },
                        {
                          step: 3,
                          title: "Gap Analysis & Strategy",
                          description: "Identify skill gaps and create targeted development plan",
                          duration: "1-2 weeks",
                          color: "purple"
                        },
                        {
                          step: 4,
                          title: "Implementation & Tracking",
                          description: "Execute your career plan with continuous progress monitoring",
                          duration: "Ongoing",
                          color: "amber"
                        }
                      ],
                      'mock-interview-simulator': [
                        {
                          step: 1,
                          title: "Interview Preparation",
                          description: "Set up your interview type, role, and difficulty preferences",
                          duration: "3-5 minutes",
                          color: "emerald"
                        },
                        {
                          step: 2,
                          title: "AI Interview Simulation",
                          description: "Practice with realistic AI interviewer in your target role scenario",
                          duration: "15-30 minutes",
                          color: "blue"
                        },
                        {
                          step: 3,
                          title: "Performance Analysis",
                          description: "Receive detailed feedback on answers, confidence, and presentation",
                          duration: "5-10 minutes",
                          color: "purple"
                        },
                        {
                          step: 4,
                          title: "Skill Improvement",
                          description: "Implement feedback and track improvement across practice sessions",
                          duration: "Ongoing",
                          color: "amber"
                        }
                      ],
                      'resume-performance-insights': [
                        {
                          step: 1,
                          title: "Resume Upload & Scan",
                          description: "Upload your resume for comprehensive AI-powered analysis",
                          duration: "2-3 minutes",
                          color: "emerald"
                        },
                        {
                          step: 2,
                          title: "ATS & Performance Analysis",
                          description: "Deep analysis of ATS compatibility and market performance",
                          duration: "Instant",
                          color: "blue"
                        },
                        {
                          step: 3,
                          title: "Optimization Implementation",
                          description: "Apply AI recommendations to optimize your resume",
                          duration: "1-2 hours",
                          color: "purple"
                        },
                        {
                          step: 4,
                          title: "Performance Monitoring",
                          description: "Track application success rates and iterate based on results",
                          duration: "Ongoing",
                          color: "amber"
                        }
                      ]
                    };

                    const defaultRoadmap = [
                      {
                        step: 1,
                        title: "Assessment & Analysis",
                        description: "Complete comprehensive analysis of your current position",
                        duration: "5-10 minutes",
                        color: "emerald"
                      },
                      {
                        step: 2,
                        title: "AI-Powered Insights",
                        description: "Receive personalized recommendations and action items",
                        duration: "Instant",
                        color: "blue"
                      },
                      {
                        step: 3,
                        title: "Implementation",
                        description: "Apply insights to your career strategy and materials",
                        duration: "1-2 weeks",
                        color: "purple"
                      },
                      {
                        step: 4,
                        title: "Track Progress",
                        description: "Monitor improvements and iterate based on results",
                        duration: "Ongoing",
                        color: "amber"
                      }
                    ];

                    return (toolRoadmaps[tool.slug] || defaultRoadmap).map((step, index) => (
                    <div key={step.step} className="flex items-start gap-6 group">
                      <div className={cn(
                        "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110",
                        step.color === "emerald" && "bg-gradient-to-br from-emerald-500 to-green-500 group-hover:shadow-emerald-200",
                        step.color === "blue" && "bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:shadow-blue-200",
                        step.color === "purple" && "bg-gradient-to-br from-purple-500 to-violet-500 group-hover:shadow-purple-200",
                        step.color === "amber" && "bg-gradient-to-br from-amber-500 to-orange-500 group-hover:shadow-amber-200"
                      )}>
                        {step.step}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg text-slate-800">{step.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-sm font-medium border-2 backdrop-blur-sm",
                              step.color === "emerald" && "border-emerald-400/60 text-emerald-700 bg-emerald-50/80",
                              step.color === "blue" && "border-blue-400/60 text-blue-700 bg-blue-50/80",
                              step.color === "purple" && "border-purple-400/60 text-purple-700 bg-purple-50/80",
                              step.color === "amber" && "border-amber-400/60 text-amber-700 bg-amber-50/80"
                            )}
                          >
                            {step.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {step.description}
                        </p>
                        {index < 3 && (
                          <div className="mt-4 w-full h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full opacity-30"></div>
                        )}
                      </div>
                    </div>
                  ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-slate-800 backdrop-blur-xl shadow-xl">
          <div>
            <h4 className="font-extrabold text-lg sm:text-xl text-white">
              Ready to elevate your career with AI?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Get instant, personalized recommendations tailored to your goals with {tool.name}.
            </p>
          </div>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl px-8 py-6 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shrink-0"
            onClick={handleLaunchTool}
          >
            Launch {tool.name} Now
            <ArrowRight className="ml-2.5 h-5 w-5" />
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};