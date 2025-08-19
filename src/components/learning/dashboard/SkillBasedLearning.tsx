import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CourseCard } from './CourseCard';
import { Target, Code, Database, Brain, Palette, TrendingUp, ArrowRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name?: string;
  instructor_bio?: string;
  duration_hours?: number;
  rating?: number;
  enrolled_count?: number;
  skills_taught?: string[];
  price?: number;
  currency?: string;
  thumbnail_url?: string;
  video_preview_url?: string;
  difficulty_level?: string;
  category?: string;
}

interface SkillBasedLearningProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onWishlist: (courseId: string) => void;
  enrolledCourses: string[];
  wishlist: string[];
}

export const SkillBasedLearning: React.FC<SkillBasedLearningProps> = ({
  courses,
  onEnroll,
  onWishlist,
  enrolledCourses,
  wishlist
}) => {
  const [selectedSkill, setSelectedSkill] = useState('React');

  const skillCategories = [
    {
      name: 'Programming',
      icon: Code,
      skills: ['React', 'Python', 'JavaScript', 'Java', 'TypeScript'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Data Science',
      icon: Database,
      skills: ['Machine Learning', 'Data Analysis', 'SQL', 'Statistics'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'AI/ML',
      icon: Brain,
      skills: ['Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      name: 'Design',
      icon: Palette,
      skills: ['UI/UX', 'Figma', 'Photoshop', 'Web Design'],
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const userSkillProgress = {
    'React': 75,
    'Python': 60,
    'JavaScript': 85,
    'Machine Learning': 40,
    'UI/UX': 30,
    'SQL': 70
  };

  const getSkillLevel = (progress: number) => {
    if (progress >= 80) return { level: 'Advanced', color: 'text-green-600' };
    if (progress >= 50) return { level: 'Intermediate', color: 'text-yellow-600' };
    return { level: 'Beginner', color: 'text-blue-600' };
  };

  const filteredCourses = courses.filter(course => 
    course.skills_taught?.some(skill => 
      skill.toLowerCase().includes(selectedSkill.toLowerCase())
    )
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Skill-Based Learning</h2>
            <p className="text-muted-foreground">Target specific skills and track your mastery progress</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          View All Skills
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.name} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.skills.length} skills</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {category.skills.slice(0, 3).map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className={`text-xs cursor-pointer transition-all ${
                        selectedSkill === skill 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10'
                      }`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {category.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Skill Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Skill Mastery Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(userSkillProgress).map(([skill, progress]) => {
              const { level, color } = getSkillLevel(progress);
              return (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{skill}</span>
                    <Badge variant="outline" className={`text-xs ${color}`}>
                      {level}
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress}% Complete</span>
                    <span>{100 - progress}% to master</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skill-Specific Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {selectedSkill} Courses
            <Badge className="ml-2 bg-primary/10 text-primary">
              {filteredCourses.length} courses
            </Badge>
          </h3>
          <Button variant="outline" size="sm">
            View All {selectedSkill} Courses
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              onWishlist={onWishlist}
              isEnrolled={enrolledCourses.includes(course.id)}
              isWishlisted={wishlist.includes(course.id)}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found for {selectedSkill}</h3>
              <p className="text-muted-foreground mb-4">
                Try selecting a different skill or browse all available courses.
              </p>
              <Button variant="outline">Browse All Courses</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};