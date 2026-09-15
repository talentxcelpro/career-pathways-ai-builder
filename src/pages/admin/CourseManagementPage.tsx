import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { CourseGraphenerator } from '@/components/admin/CourseBatchCreator';
import { SuperChargedCourseFactory } from '@/components/learning/SuperChargedCourseFactory';
import { VideoIntegrationPanel } from '@/components/admin/VideoIntegrationPanel';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Video,
  Code,
  Target,
  Zap,
  Database,
  PlayCircle,
  Settings,
  BarChart3
} from 'lucide-react';

export default function CourseManagementPage() {
  const [enhancementOptions, setEnhancementOptions] = useState({
    include_youtube_videos: false,
    include_exercises: false,
    include_projects: false
  });
  
  const [populationConfig, setPopulationConfig] = useState({
    count: 50,
    categories: ['Web Development', 'Data Science', 'Machine Learning']
  });
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  const handleCourseEnhancement = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('course-enhancement', {
        body: {
          action: 'enhance_existing_course',
          ...enhancementOptions
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        toast.error(`Enhancement failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success(`Successfully enhanced ${data.items_enhanced || 0} course items!`);
      } else {
        toast.error(data?.message || 'Enhancement completed with warnings');
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.error(`Enhancement failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleMassPopulation = async () => {
    setIsPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mass-course-population', {
        body: {
          action: 'populate_courses',
          ...populationConfig
        }
      });

      if (error) {
        console.error('Population error:', error);
        toast.error(`Population failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success(`Successfully created ${data.courses_created || 0} courses!`);
      } else {
        toast.error(data?.message || 'Population completed with warnings');
      }
    } catch (error: any) {
      console.error('Population error:', error);
      toast.error(`Population failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleCreateInteractiveExercises = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('course-enhancement', {
        body: {
          action: 'create_interactive_exercises'
        }
      });

      if (error) {
        console.error('Exercise creation error:', error);
        toast.error(`Exercise creation failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success(`Created ${data.exercises_created || 0} interactive exercises!`);
      } else {
        toast.error(data?.message || 'Exercise creation completed with warnings');
      }
    } catch (error: any) {
      console.error('Exercise creation error:', error);
      toast.error(`Exercise creation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const availableCategories = [
    'Web Development',
    'Data Science', 
    'Machine Learning',
    'Mobile Development',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design',
    'Digital Marketing',
    'Database Management',
    'DevOps'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Course Management Hub</h1>
          <p className="text-muted-foreground">Create, enhance, and manage your learning platform</p>
        </div>
      </div>

      <Tabs defaultValue="batch-creator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="batch-creator">Batch Creator</TabsTrigger>
          <TabsTrigger value="enhancement">Enhancement</TabsTrigger>
          <TabsTrigger value="video-integration">Video Integration</TabsTrigger>
          <TabsTrigger value="population">Mass Population</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="batch-creator" className="space-y-6">
          <ErrorBoundary>
            <SuperChargedCourseFactory />
          </ErrorBoundary>
          <ErrorBoundary>
            <CourseGraphenerator />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="enhancement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Enhancement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Course Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="youtube-videos"
                      checked={enhancementOptions.include_youtube_videos}
                      onCheckedChange={(checked) => 
                        setEnhancementOptions(prev => ({ ...prev, include_youtube_videos: !!checked }))
                      }
                    />
                    <Label htmlFor="youtube-videos" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Add YouTube Video Integration
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exercises"
                      checked={enhancementOptions.include_exercises}
                      onCheckedChange={(checked) => 
                        setEnhancementOptions(prev => ({ ...prev, include_exercises: !!checked }))
                      }
                    />
                    <Label htmlFor="exercises" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Add Interactive Exercises
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="projects"
                      checked={enhancementOptions.include_projects}
                      onCheckedChange={(checked) => 
                        setEnhancementOptions(prev => ({ ...prev, include_projects: !!checked }))
                      }
                    />
                    <Label htmlFor="projects" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Add Capstone Projects
                    </Label>
                  </div>
                </div>

                <Button 
                  onClick={handleCourseEnhancement} 
                  disabled={isEnhancing}
                  className="w-full"
                >
                  {isEnhancing ? 'Enhancing...' : 'Enhance Existing Courses'}
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Exercises Creator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Interactive Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add coding challenges and interactive exercises to existing course modules.
                </p>
                
                <Button 
                  onClick={handleCreateInteractiveExercises} 
                  disabled={isEnhancing}
                  className="w-full"
                >
                  {isEnhancing ? 'Creating...' : 'Create Interactive Exercises'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="video-integration" className="space-y-6">
          <ErrorBoundary>
            <VideoIntegrationPanel />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="population" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Mass Course Population
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-count">Number of Courses</Label>
                  <Input
                    id="course-count"
                    type="number"
                    min="10"
                    max="500"
                    value={populationConfig.count}
                    onChange={(e) => setPopulationConfig(prev => ({ 
                      ...prev, 
                      count: parseInt(e.target.value) || 50 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Categories to Include</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category}
                          checked={populationConfig.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPopulationConfig(prev => ({
                                ...prev,
                                categories: [...prev.categories, category]
                              }));
                            } else {
                              setPopulationConfig(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Population Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Will create {populationConfig.count} professional courses</p>
                  <p>• Across {populationConfig.categories.length} categories</p>
                  <p>• Each course includes modules, lessons, and video content</p>
                  <p>• Estimated time: ~{Math.ceil(populationConfig.count / 10)} minutes</p>
                </div>
              </div>

              <Button 
                onClick={handleMassPopulation} 
                disabled={isPopulating || populationConfig.categories.length === 0}
                className="w-full"
              >
                {isPopulating ? 'Creating Courses...' : `Create ${populationConfig.count} Courses`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,456</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}