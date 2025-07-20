import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Star, Copy, Play, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIAgent } from '@/hooks/useAIAgent';

interface PromptLibraryProps {
  onClose: () => void;
  onPromptSelect: (prompt: any) => void;
}

// Enhanced prompt library with all specified prompts
const PROMPT_LIBRARY = {
  'network': [
    {
      id: '1',
      title: 'Smart Feed Curation',
      content: 'Analyze my network activity and suggest 5 high-value content pieces I should engage with this week to maximize my professional visibility.',
      category: 'Content Strategy',
      complexity: 'medium',
      tags: ['engagement', 'visibility', 'content'],
      description: 'Get personalized content recommendations based on your network and goals'
    },
    {
      id: '2', 
      title: 'Connection Strategy',
      content: 'Based on my career goals, identify 10 strategic professionals I should connect with and provide personalized outreach messages for each.',
      category: 'Networking',
      complexity: 'advanced',
      tags: ['connections', 'outreach', 'strategy'],
      description: 'Strategic connection recommendations with outreach templates'
    },
    {
      id: '3',
      title: 'LinkedIn Profile Optimization',
      content: 'Analyze my LinkedIn profile and provide specific recommendations to improve my visibility in search results and attract relevant opportunities.',
      category: 'Profile',
      complexity: 'easy',
      tags: ['linkedin', 'optimization', 'visibility'],
      description: 'Comprehensive LinkedIn profile optimization guide'
    },
    {
      id: '4',
      title: 'Post Sentiment Analysis',
      content: 'Analyze the sentiment and engagement potential of my recent posts. Suggest improvements for better professional engagement.',
      category: 'Content Analysis',
      complexity: 'medium',
      tags: ['sentiment', 'engagement', 'analysis'],
      description: 'AI-powered post performance analysis and optimization'
    }
  ],
  'jobs': [
    {
      id: '5',
      title: 'Smart Job Matching',
      content: 'Match me with jobs based on my resume and preferences. Provide match percentages and explain why each role is suitable.',
      category: 'Job Search',
      complexity: 'medium',
      tags: ['matching', 'analysis', 'recommendations'],
      description: 'AI-powered job matching with detailed analysis'
    },
    {
      id: '6',
      title: 'Resume Tailoring for Job',
      content: 'Rewrite my resume for this specific job description: [Paste JD]. Highlight relevant skills and quantify achievements.',
      category: 'Resume',
      complexity: 'advanced',
      tags: ['resume', 'tailoring', 'ats'],
      description: 'Custom resume optimization for specific roles'
    },
    {
      id: '7',
      title: 'Interview Preparation',
      content: 'Suggest 10 specific questions I should expect in this interview and provide detailed answers with examples from my background.',
      category: 'Interview',
      complexity: 'medium',
      tags: ['interview', 'preparation', 'questions'],
      description: 'Role-specific interview preparation with sample answers'
    },
    {
      id: '8',
      title: 'Career Transition Analysis',
      content: 'What roles am I best suited for in Data Analytics based on my current skills? Provide a transition roadmap.',
      category: 'Career Change',
      complexity: 'advanced',
      tags: ['transition', 'analysis', 'roadmap'],
      description: 'Comprehensive career transition planning'
    },
    {
      id: '9',
      title: 'Smart Apply Strategy',
      content: 'Analyze which jobs I should prioritize applying to based on success probability and career alignment.',
      category: 'Application Strategy',
      complexity: 'advanced',
      tags: ['application', 'strategy', 'priority'],
      description: 'Strategic job application planning with success predictions'
    }
  ],
  'employer': [
    {
      id: '10',
      title: 'Job Description Generator',
      content: 'Create a comprehensive job description for Senior Python Developer with fintech experience. Include requirements, responsibilities, and benefits.',
      category: 'JD Creation',
      complexity: 'medium',
      tags: ['job-description', 'requirements', 'fintech'],
      description: 'Professional JD creation with industry best practices'
    },
    {
      id: '11',
      title: 'Candidate Ranking',
      content: 'Rank these applicants based on job requirements and provide detailed evaluation criteria: [List candidate profiles]',
      category: 'Screening',
      complexity: 'advanced',
      tags: ['ranking', 'evaluation', 'screening'],
      description: 'AI-powered candidate evaluation and ranking'
    },
    {
      id: '12',
      title: 'Interview Questions Generator',
      content: 'Generate 15 behavioral and technical questions for a Senior Product Manager interview, with evaluation criteria for each.',
      category: 'Interview',
      complexity: 'medium',
      tags: ['questions', 'evaluation', 'hiring'],
      description: 'Custom interview question sets with scoring guides'
    },
    {
      id: '13',
      title: 'Screening Questions Builder',
      content: 'Create effective screening questions for [role] that help identify top candidates early in the process.',
      category: 'Screening',
      complexity: 'medium',
      tags: ['screening', 'questions', 'efficiency'],
      description: 'Efficient screening question development'
    }
  ],
  'companies': [
    {
      id: '14',
      title: 'Company Culture Analysis',
      content: 'Analyze the culture and work environment at [company name]. Assess fit with my values and working style.',
      category: 'Culture',
      complexity: 'medium',
      tags: ['culture', 'fit', 'analysis'],
      description: 'Deep company culture assessment'
    },
    {
      id: '15',
      title: 'Market Position Analysis',
      content: 'Analyze [company]\'s market position, competitive advantages, and growth prospects in their industry.',
      category: 'Market Research',
      complexity: 'advanced',
      tags: ['market', 'competition', 'growth'],
      description: 'Comprehensive market positioning analysis'
    },
    {
      id: '16',
      title: 'Role Recommendations',
      content: 'Based on [company]\'s structure and my background, suggest specific roles I should target and how to position myself.',
      category: 'Role Targeting',
      complexity: 'advanced',
      tags: ['roles', 'targeting', 'positioning'],
      description: 'Strategic role targeting within specific companies'
    },
    {
      id: '17',
      title: 'Reviews Summarization',
      content: 'Summarize employee reviews for [company] and identify key themes about culture, management, and career growth.',
      category: 'Review Analysis',
      complexity: 'medium',
      tags: ['reviews', 'insights', 'trends'],
      description: 'Employee review analysis and insights'
    }
  ],
  'resume-builder': [
    {
      id: '18',
      title: 'ATS Optimization',
      content: 'Optimize this resume for ATS systems. Improve keyword density, formatting, and structure for maximum visibility.',
      category: 'ATS',
      complexity: 'medium',
      tags: ['ats', 'optimization', 'keywords'],
      description: 'Comprehensive ATS optimization strategy'
    },
    {
      id: '19',
      title: 'Professional Summary Enhancement',
      content: 'Add a compelling professional summary to my CV that highlights my unique value proposition and career achievements.',
      category: 'Summary',
      complexity: 'easy',
      tags: ['summary', 'value-prop', 'achievements'],
      description: 'Powerful professional summary creation'
    },
    {
      id: '20',
      title: 'LinkedIn to Resume Conversion',
      content: 'Generate a professional resume from my LinkedIn profile URL, organizing content for maximum impact.',
      category: 'Generation',
      complexity: 'advanced',
      tags: ['linkedin', 'generation', 'conversion'],
      description: 'Convert LinkedIn profile to polished resume'
    },
    {
      id: '21',
      title: 'Resume Auto-Generation',
      content: 'Auto-generate a professional resume from my user profile and tailor it for [specific job/industry].',
      category: 'Auto-Generation',
      complexity: 'advanced',
      tags: ['auto-generation', 'profile', 'tailoring'],
      description: 'Automated resume generation from profile data'
    }
  ],
  'tools': [
    {
      id: '22',
      title: 'Career SWOT Analysis',
      content: 'Conduct a comprehensive SWOT analysis of my career. Identify strengths, weaknesses, opportunities, and threats.',
      category: 'Assessment',
      complexity: 'medium',
      tags: ['swot', 'assessment', 'strategy'],
      description: 'Strategic career assessment framework'
    },
    {
      id: '23',
      title: 'Decision Framework',
      content: 'Help me create a decision framework for choosing between multiple job offers. Include criteria and weighting.',
      category: 'Decision Support',
      complexity: 'advanced',
      tags: ['decision', 'framework', 'offers'],
      description: 'Structured decision-making process'
    },
    {
      id: '24',
      title: 'Skill Assessment Enhancement',
      content: 'Analyze my skill assessment results and provide detailed interpretation with career implications.',
      category: 'Skill Analysis',
      complexity: 'medium',
      tags: ['skills', 'assessment', 'interpretation'],
      description: 'AI-enhanced skill assessment analysis'
    },
    {
      id: '25',
      title: 'Portfolio Generator',
      content: 'Create a professional portfolio outline based on my experience and target role. Include project recommendations.',
      category: 'Portfolio',
      complexity: 'advanced',
      tags: ['portfolio', 'projects', 'showcase'],
      description: 'AI-powered portfolio development'
    }
  ],
  'services': [
    {
      id: '26',
      title: 'Service Recommendations',
      content: 'Based on my career goals and current challenges, recommend personalized services (resume writing, coaching, etc.) with ROI analysis.',
      category: 'Recommendations',
      complexity: 'medium',
      tags: ['services', 'recommendations', 'roi'],
      description: 'Personalized service recommendations with value analysis'
    },
    {
      id: '27',
      title: 'Coaching Match',
      content: 'Match me with the most suitable career coach based on my industry, goals, and communication preferences.',
      category: 'Coaching',
      complexity: 'advanced',
      tags: ['coaching', 'matching', 'personalization'],
      description: 'Intelligent coach matching and selection'
    }
  ],
  'learning': [
    {
      id: '28',
      title: 'Cloud Architect Roadmap',
      content: 'I want to become a Cloud Architect — create a detailed learning roadmap with courses, certifications, and timeline.',
      category: 'Roadmap',
      complexity: 'advanced',
      tags: ['cloud', 'architecture', 'roadmap'],
      description: 'Comprehensive cloud architecture career path'
    },
    {
      id: '29',
      title: 'Data Science Upskilling',
      content: 'Suggest specific courses and learning resources for upskilling in Data Science from my current background.',
      category: 'Upskilling',
      complexity: 'medium',
      tags: ['data-science', 'courses', 'upskilling'],
      description: 'Personalized data science learning plan'
    },
    {
      id: '30',
      title: 'Skill Gap Analysis',
      content: 'Analyze the gap between my current skills and requirements for [target role]. Prioritize skills to learn.',
      category: 'Analysis',
      complexity: 'medium',
      tags: ['gap-analysis', 'skills', 'prioritization'],
      description: 'Detailed skill gap assessment with priorities'
    },
    {
      id: '31',
      title: 'Certification Guidance',
      content: 'Recommend the most valuable certifications for my career goals and provide a study plan for each.',
      category: 'Certifications',
      complexity: 'medium',
      tags: ['certifications', 'study-plan', 'career-value'],
      description: 'Strategic certification planning and guidance'
    }
  ],
  'colleges': [
    {
      id: '32',
      title: 'MBA Program Comparison',
      content: 'Best colleges for MBA in India with AI electives. Compare programs, ROI, and placement statistics.',
      category: 'MBA',
      complexity: 'medium',
      tags: ['mba', 'ai', 'comparison'],
      description: 'Detailed MBA program analysis and comparison'
    },
    {
      id: '33',
      title: 'Executive Program Analysis',
      content: 'Compare IIM Bangalore vs ISB Hyderabad for executive programs. Include curriculum, network, and outcomes.',
      category: 'Executive Education',
      complexity: 'medium',
      tags: ['executive', 'iim', 'isb'],
      description: 'Executive program detailed comparison'
    },
    {
      id: '34',
      title: 'SOP Writing Assistant',
      content: 'Help me write a compelling Statement of Purpose for [specific program] that highlights my unique background and goals.',
      category: 'Application',
      complexity: 'advanced',
      tags: ['sop', 'application', 'writing'],
      description: 'Professional SOP writing guidance'
    },
    {
      id: '35',
      title: 'Institution Recommendations',
      content: 'Suggest top institutions for [field of study] based on my academic background, career goals, and preferences.',
      category: 'Institution Selection',
      complexity: 'medium',
      tags: ['institutions', 'recommendations', 'fit'],
      description: 'Personalized institution matching and selection'
    }
  ],
  'career-map': [
    {
      id: '36',
      title: 'CTO Roadmap Generator',
      content: 'Generate a detailed 5-year roadmap to become a CTO, including milestones, skills, and experiences needed.',
      category: 'Executive Path',
      complexity: 'advanced',
      tags: ['cto', 'leadership', 'roadmap'],
      description: 'Executive career progression planning'
    },
    {
      id: '37',
      title: 'Career Transition Planning',
      content: 'Which skills do I need to move from QA Engineer to Product Manager? Create a transition strategy.',
      category: 'Transition',
      complexity: 'advanced',
      tags: ['transition', 'skills', 'strategy'],
      description: 'Strategic career pivot planning'
    },
    {
      id: '38',
      title: 'Career Diagnostics',
      content: 'Analyze my current career trajectory and identify potential blind spots or risks in my professional development.',
      category: 'Analysis',
      complexity: 'medium',
      tags: ['diagnostics', 'risks', 'development'],
      description: 'Comprehensive career health assessment'
    },
    {
      id: '39',
      title: 'Milestone Tracking',
      content: 'Set up milestone tracking for my 5-year career plan with measurable goals and progress indicators.',
      category: 'Goal Setting',
      complexity: 'medium',
      tags: ['milestones', 'tracking', 'goals'],
      description: 'Strategic milestone planning and tracking'
    },
    {
      id: '40',
      title: 'Future Skills Prediction',
      content: 'Based on industry trends, predict which skills will be most valuable in my field over the next 5 years.',
      category: 'Future Planning',
      complexity: 'advanced',
      tags: ['future-skills', 'trends', 'prediction'],
      description: 'AI-powered future skills analysis and planning'
    }
  ]
};

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  onClose,
  onPromptSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const { fetchPrompts } = useAIAgent();

  const allPrompts = Object.values(PROMPT_LIBRARY).flat();
  const modules = ['all', ...Object.keys(PROMPT_LIBRARY)];

  const filteredPrompts = allPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = selectedModule === 'all' || 
                         Object.entries(PROMPT_LIBRARY).find(([module, prompts]) => 
                           prompts.includes(prompt) && module === selectedModule);
    
    const matchesComplexity = selectedComplexity === 'all' || prompt.complexity === selectedComplexity;
    
    return matchesSearch && matchesModule && matchesComplexity;
  });

  const getModuleFromPrompt = (prompt: any) => {
    return Object.entries(PROMPT_LIBRARY).find(([module, prompts]) => 
      prompts.includes(prompt))?.[0] || 'general';
  };

  const handlePromptSelect = (prompt: any) => {
    const module = getModuleFromPrompt(prompt);
    onPromptSelect({
      ...prompt,
      module_name: module,
      prompt_content: prompt.content
    });
    onClose();
  };

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl shadow-2xl w-full max-w-6xl h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-card to-accent/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">AI Prompt Library</h2>
                <p className="text-muted-foreground">500+ specialized prompts for career intelligence</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search prompts, categories, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  {modules.map(module => (
                    <option key={module} value={module}>
                      {module === 'all' ? 'All Modules' : module.charAt(0).toUpperCase() + module.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prompts Grid */}
          <div className="p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card via-card to-accent/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">
                          {prompt.title}
                        </CardTitle>
                        <Badge 
                          variant={prompt.complexity === 'easy' ? 'secondary' : 
                                  prompt.complexity === 'medium' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {prompt.complexity}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs w-fit">
                        {getModuleFromPrompt(prompt)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {prompt.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {prompt.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePromptSelect(prompt)}
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyPrompt(prompt.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};