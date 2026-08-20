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
      
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl rounded-3xl flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 shadow-md">
              {tool.icon && React.createElement(tool.icon, { 
                className: "h-6 w-6 stroke-[2.2]" 
              })}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {tool.name}
                </DialogTitle>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] uppercase font-mono">
                  {tool.category}
                </Badge>
              </div>
              <DialogDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unlock actionable AI insights designed to advance your professional trajectory with {tool.name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Tabs Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          <Tabs defaultValue="benefits" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <TabsTrigger value="benefits" className="rounded-lg font-semibold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="features" className="rounded-lg font-semibold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                Features
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-lg font-semibold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                Impact Stats
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="rounded-lg font-semibold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                Action Plan
              </TabsTrigger>
            </TabsList>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <Card 
                    key={benefit.id}
                    className={cn(
                      "bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between",
                      benefit.impact === 'high' && "border-l-4 border-l-emerald-500",
                      benefit.impact === 'medium' && "border-l-4 border-l-amber-500",
                      benefit.impact === 'low' && "border-l-4 border-l-blue-500"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl border text-sm",
                            benefit.impact === 'high' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                            benefit.impact === 'medium' && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                            benefit.impact === 'low' && "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          )}>
                            {React.createElement(benefit.icon, { className: "h-5 w-5" })}
                          </div>
                          <h4 className="font-bold text-sm text-white">
                            {benefit.title}
                          </h4>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            benefit.impact === 'high' && "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
                            benefit.impact === 'medium' && "border-amber-500/40 text-amber-400 bg-amber-500/10",
                            benefit.impact === 'low' && "border-blue-500/40 text-blue-400 bg-blue-500/10"
                          )}
                        >
                          {benefit.impact} impact
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Standard Features
                  </h4>
                  {features.filter(f => !f.isPremium).map((feature) => (
                    <div key={feature.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-white">{feature.name}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    Advanced AI Capabilities
                  </h4>
                  {features.filter(f => f.isPremium).map((feature) => (
                    <div key={feature.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-xs text-white">{feature.name}</h5>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] px-1 py-0 uppercase">Pro</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Clock className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stats.avgTimeReduction}</div>
                  <div className="text-[11px] text-slate-400">Time Saved</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Target className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stats.accuracyImprovement}</div>
                  <div className="text-[11px] text-slate-400">Accuracy</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <Star className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stats.userSatisfaction}</div>
                  <div className="text-[11px] text-slate-400">Satisfaction</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <TrendingUp className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stats.careerAdvancement}</div>
                  <div className="text-[11px] text-slate-400">Career Velocity</div>
                </div>
              </div>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="space-y-4">
              <div className="space-y-3">
                {[
                  { step: 1, title: 'Input & Profile Analysis', desc: 'Synthesizes your experience, target criteria, and skill profile.', time: '2 mins' },
                  { step: 2, title: 'AI Evaluation & Alignment', desc: 'Runs deep semantic models against benchmark market parameters.', time: 'Instant' },
                  { step: 3, title: 'Actionable Roadmap Output', desc: 'Generates tailored strategy recommendations and verified steps.', time: 'Instant' },
                  { step: 4, title: 'Continuous Career Iteration', desc: 'Track progress, re-evaluate metrics, and refine your trajectory.', time: 'Ongoing' }
                ].map((item) => (
                  <div key={item.step} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {item.step}
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-white">{item.title}</h5>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                      {item.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* High-Contrast Bottom Launch Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-white">
              Ready to launch {tool.name}?
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Get instant, personalized recommendations tailored to your career milestones.
            </p>
          </div>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-[1.02]"
            onClick={handleLaunchTool}
          >
            Launch {tool.name} Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};