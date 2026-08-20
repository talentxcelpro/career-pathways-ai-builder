import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  BookOpen, 
  Target,
  Clock,
  Star,
  ExternalLink,
  Save,
  Download,
  Play,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AILearningPathGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  
  // Form inputs
  const [learningGoal, setLearningGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [timeCommitment, setTimeCommitment] = useState('5-10');
  const [preferredFormat, setPreferredFormat] = useState('mixed');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('ai-learning-path-generator', 'AI Learning Path Generator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Please log in to generate learning paths');
      return;
    }

    if (!learningGoal.trim()) {
      toast.error('Please enter your learning goal');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'learning-path-generation',
          data: {
            learningGoal,
            currentLevel,
            timeCommitment,
            preferredFormat,
            profile
          },
          userId: user.id
        }
      });

      const result = {
        path_overview: {
          title: aiResponse?.path_overview?.title || `${learningGoal} Mastery Path`,
          duration: aiResponse?.path_overview?.duration || '3-6 months',
          difficulty: currentLevel,
          total_hours: aiResponse?.path_overview?.total_hours || parseInt(timeCommitment.split('-')[1]) * 4 * 12,
          completion_rate: 0
        },
        learning_phases: aiResponse?.learning_phases || [
          {
            phase: 1,
            title: 'Foundation Building',
            duration: '4-6 weeks',
            description: 'Master the fundamentals and core concepts',
            modules: [
              {
                title: 'Introduction and Basics',
                duration: '1 week',
                resources: [
                  { type: 'video', title: 'Getting Started Course', url: '#', rating: 4.8 },
                  { type: 'article', title: 'Complete Beginner Guide', url: '#', rating: 4.5 },
                  { type: 'practice', title: 'Basic Exercises', url: '#', rating: 4.7 }
                ],
                completed: false
              },
              {
                title: 'Core Concepts',
                duration: '2 weeks',
                resources: [
                  { type: 'course', title: 'Comprehensive Course', url: '#', rating: 4.9 },
                  { type: 'book', title: 'Essential Reading', url: '#', rating: 4.6 }
                ],
                completed: false
              }
            ]
          },
          {
            phase: 2,
            title: 'Skill Development',
            duration: '6-8 weeks',
            description: 'Build practical skills through hands-on projects',
            modules: [
              {
                title: 'Practical Applications',
                duration: '3 weeks',
                resources: [
                  { type: 'project', title: 'First Project Build', url: '#', rating: 4.7 },
                  { type: 'tutorial', title: 'Step-by-step Guide', url: '#', rating: 4.8 }
                ],
                completed: false
              },
              {
                title: 'Advanced Techniques',
                duration: '3 weeks',
                resources: [
                  { type: 'course', title: 'Advanced Strategies', url: '#', rating: 4.9 },
                  { type: 'workshop', title: 'Live Workshop', url: '#', rating: 4.8 }
                ],
                completed: false
              }
            ]
          },
          {
            phase: 3,
            title: 'Mastery & Specialization',
            duration: '4-6 weeks',
            description: 'Specialize in your area of interest and build expertise',
            modules: [
              {
                title: 'Specialization Track',
                duration: '4 weeks',
                resources: [
                  { type: 'course', title: 'Expert Level Course', url: '#', rating: 4.9 },
                  { type: 'certification', title: 'Professional Certification', url: '#', rating: 4.8 }
                ],
                completed: false
              }
            ]
          }
        ],
        milestones: aiResponse?.milestones || [
          { week: 2, title: 'Complete Foundation Modules', description: 'Understand basic concepts' },
          { week: 6, title: 'First Project Completion', description: 'Build your first practical project' },
          { week: 10, title: 'Advanced Skills Mastery', description: 'Master intermediate to advanced techniques' },
          { week: 14, title: 'Specialization Achievement', description: 'Complete your chosen specialization' },
          { week: 16, title: 'Portfolio Ready', description: 'Have projects ready to showcase' }
        ],
        resource_recommendations: {
          top_courses: aiResponse?.resource_recommendations?.top_courses || [
            { title: 'Complete Mastery Course', provider: 'Coursera', rating: 4.8, price: 'Free' },
            { title: 'Practical Workshop Series', provider: 'Udemy', rating: 4.7, price: '$49' },
            { title: 'Advanced Techniques', provider: 'edX', rating: 4.9, price: '$99' }
          ],
          books: aiResponse?.resource_recommendations?.books || [
            { title: 'The Complete Guide', author: 'Expert Author', rating: 4.6, price: '$29' },
            { title: 'Advanced Handbook', author: 'Industry Leader', rating: 4.8, price: '$39' }
          ],
          practice_platforms: aiResponse?.resource_recommendations?.practice_platforms || [
            { name: 'Practice Platform A', type: 'Interactive', rating: 4.7, price: 'Free' },
            { name: 'Challenge Platform B', type: 'Challenges', rating: 4.8, price: '$19/mo' }
          ]
        },
        progress_tracking: {
          weekly_goals: [
            `Study ${timeCommitment} hours per week`,
            'Complete 1-2 modules per week',
            'Practice with hands-on exercises',
            'Track progress and adjust as needed'
          ],
          success_metrics: [
            'Module completion rate',
            'Project quality assessment',
            'Skill demonstration',
            'Community engagement'
          ]
        },
        personalized_tips: aiResponse?.personalized_tips || [
          `Based on your ${currentLevel} level, start with foundational concepts`,
          `With ${timeCommitment} hours/week, you can complete this in 3-4 months`,
          `${preferredFormat} format will keep you engaged throughout`,
          'Set weekly goals and track your progress consistently'
        ]
      };

      setLearningPath(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 200);
      }

      toast.success('Learning path generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate learning path. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResult = async () => {
    if (!learningPath) return;
    
    await saveToolResult(
      'ai-learning-path-generator',
      `Learning Path: ${learningGoal}`,
      learningPath,
      'document',
      ['learning', 'path', 'education', currentLevel]
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'course': return '📚';
      case 'book': return '📖';
      case 'article': return '📄';
      case 'practice': return '💻';
      case 'project': return '🔨';
      case 'tutorial': return '🎯';
      case 'workshop': return '👥';
      case 'certification': return '🏆';
      default: return '📋';
    }
  };

  const renderPhaseCard = (phase: any, index: number) => (
    <Card key={index} className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Badge variant="outline">Phase {phase.phase}</Badge>
            {phase.title}
          </span>
          <Badge variant="secondary">{phase.duration}</Badge>
        </CardTitle>
        <CardDescription>{phase.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phase.modules.map((module: any, moduleIndex: number) => (
            <div key={moduleIndex} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {module.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  {module.title}
                </h4>
                <Badge variant="outline">{module.duration}</Badge>
              </div>
              
              <div className="space-y-2">
                {module.resources.map((resource: any, resourceIndex: number) => (
                  <div key={resourceIndex} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{getResourceIcon(resource.type)}</span>
                      <span className="text-sm font-medium">{resource.title}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{resource.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!learningPath) return null;

    return (
      <div className="space-y-6">
        {/* Path Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {learningPath.path_overview.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{learningPath.path_overview.duration}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{learningPath.path_overview.total_hours}h</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 capitalize">{learningPath.path_overview.difficulty}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{learningPath.path_overview.completion_rate}%</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
            <Progress value={learningPath.path_overview.completion_rate} className="h-3" />
          </CardContent>
        </Card>

        {/* Learning Phases */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Learning Phases</h3>
          {learningPath.learning_phases.map(renderPhaseCard)}
        </div>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Key Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningPath.milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Badge variant="outline">Week {milestone.week}</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Top Courses</h4>
                <div className="space-y-2">
                  {learningPath.resource_recommendations.top_courses.map((course: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{course.title}</div>
                      <div className="text-xs text-muted-foreground">{course.provider}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{course.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{course.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Essential Books</h4>
                <div className="space-y-2">
                  {learningPath.resource_recommendations.books.map((book: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{book.title}</div>
                      <div className="text-xs text-muted-foreground">{book.author}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{book.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{book.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Practice Platforms</h4>
                <div className="space-y-2">
                  {learningPath.resource_recommendations.practice_platforms.map((platform: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{platform.name}</div>
                      <div className="text-xs text-muted-foreground">{platform.type}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{platform.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{platform.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {learningPath.personalized_tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleSaveResult}>
            <Save className="h-4 w-4 mr-2" />
            Save Learning Path
          </Button>
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Start Learning
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Path
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {!learningPath ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI Learning Path Generator</h2>
                  <p className="text-muted-foreground mb-6">
                    Custom roadmap with top resources and progress tracking
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Learning Goal</label>
                      <Input
                        placeholder="e.g., Machine Learning, Web Development, Data Science"
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Level</label>
                      <Select value={currentLevel} onValueChange={setCurrentLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time Commitment (hours/week)</label>
                      <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 hours</SelectItem>
                          <SelectItem value="5-10">5-10 hours</SelectItem>
                          <SelectItem value="10-20">10-20 hours</SelectItem>
                          <SelectItem value="20+">20+ hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Preferred Format</label>
                      <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video Courses</SelectItem>
                          <SelectItem value="reading">Books & Articles</SelectItem>
                          <SelectItem value="interactive">Interactive/Hands-on</SelectItem>
                          <SelectItem value="mixed">Mixed Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Creating Your Learning Path</h3>
                    <p className="text-muted-foreground">
                      AI is designing a personalized curriculum for you...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleGenerate} size="lg" className="w-full">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Generate Learning Path
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AILearningPathGenerator;