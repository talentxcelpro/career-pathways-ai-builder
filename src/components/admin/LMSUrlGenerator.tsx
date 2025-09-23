import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Plus, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const LMSUrlGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    duration_hours: 10,
    price: 0,
    instructor_name: 'TalentXcel Team',
    learning_objectives: '',
    prerequisites: '',
    tags: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const generateCourse = async () => {
    if (!courseData.title || !courseData.description || !courseData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          difficulty_level: courseData.difficulty_level,
          duration_hours: courseData.duration_hours,
          price: courseData.price,
          instructor_name: courseData.instructor_name,
          learning_objectives: courseData.learning_objectives.split('\n').filter(obj => obj.trim()),
          prerequisites: courseData.prerequisites.split('\n').filter(pre => pre.trim()),
          skills_gained: courseData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_active: true,
          thumbnail_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop`,
          enrolled_count: 0,
          rating: 4.5
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Generate sample modules and lessons
      const modules = [
        { 
          title: `Introduction to ${courseData.title}`,
          description: `Get started with the fundamentals of ${courseData.category}`,
          order_index: 1
        },
        { 
          title: `Core Concepts`,
          description: `Master the essential concepts and techniques`,
          order_index: 2
        },
        { 
          title: `Practical Applications`,
          description: `Apply your knowledge with hands-on projects`,
          order_index: 3
        },
        { 
          title: `Advanced Topics`,
          description: `Explore advanced strategies and best practices`,
          order_index: 4
        }
      ];

      for (const moduleData of modules) {
        const { data: module, error: moduleError } = await supabase
          .from('course_modules')
          .insert({
            course_id: course.id,
            ...moduleData
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Generate lessons for each module
        const lessons = [
          { title: `${moduleData.title} - Overview`, lesson_type: 'video', duration_minutes: 15 },
          { title: `${moduleData.title} - Deep Dive`, lesson_type: 'video', duration_minutes: 25 },
          { title: `${moduleData.title} - Practice Exercise`, lesson_type: 'quiz', duration_minutes: 10 }
        ];

        for (let i = 0; i < lessons.length; i++) {
          const lessonData = lessons[i];
          await supabase
            .from('course_lessons')
            .insert({
              module_id: module.id,
              title: lessonData.title,
              lesson_type: lessonData.lesson_type,
              order_index: i + 1,
              duration_minutes: lessonData.duration_minutes,
              video_url: lessonData.lesson_type === 'video' ? 'https://www.youtube.com/embed/HAnw168huqA' : null,
              content: lessonData.lesson_type === 'text' ? `Content for ${lessonData.title}` : null
            });
        }
      }

      const courseUrl = `${window.location.origin}/learning/courses/${course.id}`;
      
      // Copy URL to clipboard
      await navigator.clipboard.writeText(courseUrl);
      
      toast.success(`Course "${courseData.title}" created successfully! URL copied to clipboard.`);
      
      // Reset form
      setCourseData({
        title: '',
        description: '',
        category: '',
        difficulty_level: 'beginner',
        duration_hours: 10,
        price: 0,
        instructor_name: 'TalentXcel Team',
        learning_objectives: '',
        prerequisites: '',
        tags: ''
      });

    } catch (error) {
      console.error('Error generating course:', error);
      toast.error(`Failed to generate course: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          LMS Course Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Advanced AWS Cloud Architecture"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={courseData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={courseData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what students will learn in this course..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={courseData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
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
          
          <div>
            <Label htmlFor="duration">Duration (Hours)</Label>
            <Input
              id="duration"
              type="number"
              value={courseData.duration_hours}
              onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={courseData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="objectives">Learning Objectives (one per line)</Label>
          <Textarea
            id="objectives"
            value={courseData.learning_objectives}
            onChange={(e) => handleInputChange('learning_objectives', e.target.value)}
            placeholder="Understand core concepts&#10;Apply practical skills&#10;Build real-world projects"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
          <Textarea
            id="prerequisites"
            value={courseData.prerequisites}
            onChange={(e) => handleInputChange('prerequisites', e.target.value)}
            placeholder="Basic computer skills&#10;No prior experience required"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="tags">Skills/Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={courseData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="AWS, Cloud Computing, DevOps, Infrastructure"
          />
        </div>

        <Button 
          onClick={generateCourse} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Plus className="h-4 w-4 mr-2 animate-spin" />
              Generating Course...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Course & Copy URL
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          This will create a complete course with 4 modules and sample lessons. The course URL will be copied to your clipboard.
        </p>
      </CardContent>
    </Card>
  );
};