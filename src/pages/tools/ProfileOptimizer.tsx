import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Target, Sparkles, TrendingUp, Copy, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileOptimization {
  overallScore: number;
  optimizedSections: {
    headline: { original: string; optimized: string; improvement: number };
    summary: { original: string; optimized: string; improvement: number };
    experience: { original: string; optimized: string; improvement: number };
    skills: { original: string; optimized: string; improvement: number };
  };
  keyImprovements: string[];
  platformSpecific: {
    linkedin: string[];
    resume: string[];
    portfolio: string[];
  };
}

export const ProfileOptimizer: React.FC = () => {
  const [currentProfile, setCurrentProfile] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<ProfileOptimization | null>(null);
  
  const handleOptimize = async () => {
    if (!currentProfile.trim()) {
      toast.error('Please provide your current profile information');
      return;
    }

    setIsOptimizing(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const mockOptimization: ProfileOptimization = {
        overallScore: 87,
        optimizedSections: {
          headline: {
            original: 'Software Developer with 5 years experience',
            optimized: 'Senior Full-Stack Developer | React & Node.js Expert | Building Scalable Web Applications',
            improvement: 25
          },
          summary: {
            original: 'I am a developer who works with various technologies and has experience in different projects.',
            optimized: 'Results-driven Senior Developer with 5+ years crafting high-performance web applications. Expertise in React, Node.js, and cloud technologies. Led 3 teams to deliver projects 20% ahead of schedule, serving 100K+ users.',
            improvement: 40
          },
          experience: {
            original: 'Worked on web development projects and improved system performance.',
            optimized: 'Led development of customer-facing web platform serving 100K+ users, achieving 40% performance improvement through React optimization and microservices architecture. Mentored 3 junior developers.',
            improvement: 35
          },
          skills: {
            original: 'JavaScript, React, Node.js, databases',
            optimized: 'Frontend: React, TypeScript, Next.js, Tailwind CSS | Backend: Node.js, Express, PostgreSQL, MongoDB | Cloud: AWS, Docker, Kubernetes | Leadership: Team mentoring, Agile development',
            improvement: 30
          }
        },
        keyImprovements: [
          'Added quantified achievements and metrics',
          'Included trending industry keywords',
          'Enhanced with leadership and impact statements',
          'Structured for ATS optimization',
          'Tailored for target role requirements'
        ],
        platformSpecific: {
          linkedin: [
            'Use the optimized headline as your LinkedIn headline',
            'Add industry-specific skills to your skills section',
            'Include volunteer work and certifications',
            'Post industry insights to increase visibility'
          ],
          resume: [
            'Lead with the quantified summary',
            'Use bullet points for achievements',
            'Include relevant keywords naturally',
            'Keep formatting clean and ATS-friendly'
          ],
          portfolio: [
            'Showcase projects mentioned in experience',
            'Include live demos and GitHub links',
            'Add case studies with problem-solution format',
            'Display technical skills prominently'
          ]
        }
      };
      
      setOptimization(mockOptimization);
      toast.success('Profile optimization completed!');
    } catch (error) {
      toast.error('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSave = () => {
    toast.success('Optimized profile saved');
  };

  const handleExport = () => {
    toast.success('Profile optimization exported as PDF');
  };

  const steps = [
    {
      id: 'profile',
      title: 'Current Profile',
      description: 'Provide your existing profile information',
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your current LinkedIn summary, resume summary, or bio..."
              value={currentProfile}
              onChange={(e) => setCurrentProfile(e.target.value)}
              className="min-h-48 resize-none"
            />
          </CardContent>
        </Card>
      ),
      isCompleted: currentProfile.length > 0
    },
    {
      id: 'target',
      title: 'Target Details',
      description: 'Specify target role and industry',
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Target role (e.g., Senior Product Manager)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <Input
              placeholder="Industry (e.g., Tech, Healthcare, Finance)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <Button 
              onClick={handleOptimize}
              disabled={isOptimizing || !currentProfile.trim()}
              className="w-full"
            >
              {isOptimizing ? 'Optimizing Profile...' : 'Optimize Profile'}
            </Button>
          </CardContent>
        </Card>
      ),
      isCompleted: targetRole.length > 0
    },
    {
      id: 'optimization',
      title: 'AI Optimization',
      description: 'Generate optimized profile content',
      component: optimization ? (
        <div className="space-y-6">
          {/* Optimized Content here */}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Optimized content will appear here</p>
        </div>
      ),
      isCompleted: optimization !== null
    }
  ];

  return (
    <ToolLayout
      title="AI Profile Optimizer"
      description="Transform your professional profile with AI-powered optimization for maximum impact"
      category="Profile"
      estimatedTime="8-12 min"
      popularity={92}
      steps={steps}
      currentStep={0}
      onStepChange={() => {}}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your current LinkedIn summary, resume summary, or bio..."
                value={currentProfile}
                onChange={(e) => setCurrentProfile(e.target.value)}
                className="min-h-48 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Target role (e.g., Senior Product Manager)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <Input
                placeholder="Industry (e.g., Tech, Healthcare, Finance)"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Button 
                onClick={handleOptimize}
                disabled={isOptimizing || !currentProfile.trim()}
                className="w-full"
              >
                {isOptimizing ? 'Optimizing Profile...' : 'Optimize Profile'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {optimization && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Optimization Results</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">{optimization.overallScore}%</div>
                  <div className="text-muted-foreground">Profile Impact Score</div>
                  <Progress value={optimization.overallScore} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            {/* Optimized Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Optimized Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="headline" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="headline">Headline</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(optimization.optimizedSections).map(([key, section]) => (
                    <TabsContent key={key} value={key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="capitalize font-medium">{key}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            +{section.improvement}% improvement
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(section.optimized)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-red-600 mb-2">Original</h5>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                            {section.original}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-2">Optimized</h5>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            {section.optimized}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Key Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Improvements Made
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {optimization.keyImprovements.map((improvement, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        ✓
                      </div>
                      <span className="text-sm">{improvement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform-Specific Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Platform-Specific Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="linkedin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                    <TabsTrigger value="resume">Resume</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(optimization.platformSpecific).map(([platform, tips]) => (
                    <TabsContent key={platform} value={platform}>
                      <div className="space-y-2">
                        {tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                              {i + 1}
                            </div>
                            <span className="text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};