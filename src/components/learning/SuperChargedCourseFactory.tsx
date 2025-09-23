import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Zap,
  Brain,
  Target,
  Award,
  Loader2,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCourseEnhancement } from '@/hooks/useAdvancedLearning';

export const SuperChargedCourseFactory: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [courseCount, setCourseCount] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationResults, setGenerationResults] = useState<any>(null);
  
  const { enhanceCourse, isLoading: enhanceLoading } = useCourseEnhancement();

  const availableCategories = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps & Cloud',
    'Cybersecurity',
    'UI/UX Design',
    'Business Analytics',
    'Digital Marketing',
    'Project Management',
    'Software Engineering',
    'Artificial Intelligence',
    'Blockchain',
    'Game Development',
    'Product Management',
    'Sales & CRM',
    'Financial Analysis',
    'Content Creation'
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateMassiveCourseLibrary = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('mass-course-population', {
        body: {
          action: 'populate_professional_courses',
          count: courseCount,
          categories: selectedCategories
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setGenerationResults(data);
      toast.success(`🚀 Created ${data.courses_created} professional courses!`);

      // Auto-enhance with YouTube integration
      setTimeout(async () => {
        try {
          await supabase.functions.invoke('mass-course-population', {
            body: { action: 'enhance_with_youtube' }
          });
          toast.success('Enhanced courses with YouTube integration!');
        } catch (enhanceError) {
          console.error('YouTube enhancement failed:', enhanceError);
        }
      }, 2000);

    } catch (error) {
      console.error('Course generation failed:', error);
      toast.error('Course generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceExistingCourses = async () => {
    try {
      await enhanceCourse({
        action: 'enhance_existing_course',
        include_youtube_videos: true,
        include_exercises: true,
        include_projects: true
      });
    } catch (error) {
      console.error('Enhancement failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Rocket className="h-8 w-8 text-primary" />
            SuperCharged Course Factory
          </CardTitle>
          <p className="text-muted-foreground">
            Generate hundreds of professional-grade courses with AI-powered content, 
            YouTube integration, and interactive exercises - Building the world's most comprehensive learning platform!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">AI-Generated</div>
                <div className="text-sm text-muted-foreground">Smart content creation</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">YouTube Integrated</div>
                <div className="text-sm text-muted-foreground">Real educational videos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">Interactive</div>
                <div className="text-sm text-muted-foreground">Hands-on exercises</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold">Certified</div>
                <div className="text-sm text-muted-foreground">Professional credentials</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Mass Generation</TabsTrigger>
          <TabsTrigger value="enhance">Enhance Existing</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Professional Course Library
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a comprehensive library of industry-standard courses across multiple categories
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-count">Number of Courses to Generate</Label>
                  <Input
                    id="course-count"
                    type="number"
                    value={courseCount}
                    onChange={(e) => setCourseCount(parseInt(e.target.value) || 100)}
                    min="10"
                    max="500"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 100-200 courses for a comprehensive library
                  </p>
                </div>

                <div>
                  <Label>Select Course Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setSelectedCategories(availableCategories)}
                  >
                    Select All Categories
                  </Button>
                </div>

                {isGenerating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generation Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating professional-grade courses with AI...
                    </div>
                  </div>
                )}

                <Button
                  onClick={generateMassiveCourseLibrary}
                  disabled={isGenerating || selectedCategories.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating {courseCount} Courses...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 mr-2" />
                      Generate {courseCount} Professional Courses
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Enhance Existing Courses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add advanced features to your existing course library
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={enhanceExistingCourses}
                  disabled={enhanceLoading}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span>Add YouTube Videos</span>
                  <span className="text-xs text-muted-foreground">Real educational content</span>
                </Button>

                <Button
                  onClick={() => enhanceCourse({
                    action: 'create_interactive_exercises'
                  })}
                  disabled={enhanceLoading}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                >
                  <Target className="h-6 w-6 mb-2" />
                  <span>Interactive Exercises</span>
                  <span className="text-xs text-muted-foreground">Coding challenges</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {generationResults ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generation Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {generationResults.courses_created}
                    </div>
                    <div className="text-sm text-muted-foreground">Courses Created</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {generationResults.categories_processed}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-muted-foreground">AI Generated</div>
                  </div>
                </div>

                {generationResults.sample_courses && (
                  <div>
                    <h4 className="font-semibold mb-3">Sample Courses Created:</h4>
                    <div className="space-y-2">
                      {generationResults.sample_courses.map((course: any) => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              by {course.instructor} • {course.category}
                            </div>
                          </div>
                          <Badge variant="secondary">{course.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    No generation results yet. Run the course generator to see analytics here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};