import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createCertificationCourses } from '@/utils/createCertificationCourses';
import { toast } from 'sonner';
import { BookOpen, Users, Clock, Award, Play, Loader2 } from 'lucide-react';

export const CertificationCoursesAdmin: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCreateCourses = async () => {
    try {
      setIsCreating(true);
      setProgress(0);
      
      toast.info('Starting course creation process...');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      await createCertificationCourses();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success('Successfully created 50+ certification courses!');
    } catch (error) {
      toast.error('Failed to create courses. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsCreating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const courseCategories = [
    { name: 'Programming & Web Dev', count: 25, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Data Science & AI/ML', count: 32, icon: Users, color: 'bg-green-500' },
    { name: 'Digital Marketing', count: 15, icon: Clock, color: 'bg-purple-500' },
    { name: 'Design & Creative', count: 15, icon: Award, color: 'bg-pink-500' },
    { name: 'Business & Management', count: 15, icon: Play, color: 'bg-orange-500' },
    { name: 'Cloud & DevOps', count: 12, icon: BookOpen, color: 'bg-cyan-500' },
    { name: 'Cybersecurity', count: 10, icon: Users, color: 'bg-red-500' },
    { name: 'Mobile Development', count: 8, icon: Clock, color: 'bg-indigo-500' },
    { name: 'Soft Skills', count: 10, icon: Award, color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Certification Courses Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Create 150+ certification courses across 9 major domains with 2-10 hour duration each. 
            This comprehensive freemium system will attract individual learners, companies, and training agencies with structured learning paths, assessments, and certificates.
          </p>
          
          {isCreating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating courses...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          <Button 
            onClick={handleCreateCourses} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Courses...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Create 150+ Certification Courses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.name}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} courses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">For Learners</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Free certification courses (2-10 hours)</li>
                <li>• Interactive lessons and projects</li>
                <li>• Progress tracking and certificates</li>
                <li>• Skills-based learning paths</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">For Organizations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Corporate training programs</li>
                <li>• Bulk enrollment options</li>
                <li>• Custom learning paths</li>
                <li>• Analytics and reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};