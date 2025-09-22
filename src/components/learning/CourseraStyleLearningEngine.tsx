import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CourseraStyleCourseCard } from './CourseraStyleCourseCard';
import { CourseraStylePathCard } from './CourseraStylePathCard';
import CourseraStyleFilterBar from './CourseraStyleFilterBar';
import {
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Award,
  Clock,
  Star,
  ChevronRight,
  Play,
  Zap
} from 'lucide-react';

// Mock data - replace with real data
const mockCourses = [
  {
    id: '1',
    title: 'Google Data Analytics Professional Certificate',
    instructor: 'Google Career Certificates',
    university: 'Google',
    rating: 4.6,
    reviewCount: 75320,
    enrolledCount: '2.1M+',
    duration: '6 months',
    level: 'beginner',
    price: 49,
    originalPrice: 79,
    skills: ['Data Analysis', 'SQL', 'Tableau', 'R Programming', 'Excel'],
    thumbnail: '',
    isSpecialization: true,
    isNew: false,
    isBestseller: true,
    certificate: true
  },
  {
    id: '2',
    title: 'Machine Learning Specialization',
    instructor: 'Andrew Ng',
    university: 'Stanford University',
    rating: 4.9,
    reviewCount: 42180,
    enrolledCount: '950K+',
    duration: '3 months',
    level: 'intermediate',
    price: 0,
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
    thumbnail: '',
    isSpecialization: true,
    isNew: true,
    isBestseller: false,
    certificate: true
  },
  {
    id: '3',
    title: 'Introduction to Web Development',
    instructor: 'Meta',
    university: 'Meta',
    rating: 4.5,
    reviewCount: 28450,
    enrolledCount: '680K+',
    duration: '4 months',
    level: 'beginner',
    price: 39,
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    thumbnail: '',
    isSpecialization: false,
    isNew: false,
    isBestseller: true,
    certificate: true
  },
  {
    id: '4',
    title: 'AWS Cloud Practitioner Essentials',
    instructor: 'Amazon Web Services',
    university: 'AWS',
    rating: 4.7,
    reviewCount: 15680,
    enrolledCount: '320K+',
    duration: '2 months',
    level: 'beginner',
    price: 29,
    skills: ['AWS', 'Cloud Computing', 'DevOps'],
    thumbnail: '',
    isSpecialization: false,
    isNew: true,
    isBestseller: false,
    certificate: true
  }
];

const mockPaths = [
  {
    id: '1',
    title: 'Google Data Analytics Professional Certificate',
    description: 'Prepare for a career in data analytics with hands-on training from Google experts',
    provider: 'Google',
    courses: 8,
    duration: '6 months',
    level: 'beginner',
    rating: 4.6,
    enrolledCount: '2.1M+',
    skills: ['Data Analysis', 'SQL', 'Tableau', 'R Programming', 'Excel', 'Data Visualization'],
    isNew: false,
    isBestseller: true,
    certificate: true
  },
  {
    id: '2',
    title: 'IBM Full Stack Software Developer',
    description: 'Master front-end and back-end development with industry-relevant projects',
    provider: 'IBM',
    courses: 12,
    duration: '4 months',
    level: 'intermediate',
    rating: 4.5,
    enrolledCount: '580K+',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Docker'],
    isNew: true,
    isBestseller: false,
    certificate: true
  }
];

interface CourseraStyleLearningEngineProps {
  view?: 'hub' | 'courses' | 'paths';
}

export const CourseraStyleLearningEngine: React.FC<CourseraStyleLearningEngineProps> = ({
  view = 'hub'
}) => {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('most-popular');
  const [level, setLevel] = useState('all');
  const [duration, setDuration] = useState('all');
  const [subject, setSubject] = useState('all');

  if (view === 'hub') {
    return (
      <div className="space-y-12">
        {/* Featured Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  ⭐ Most Popular
                </Badge>
                <h2 className="text-4xl font-bold mb-4">
                  Google Data Analytics Professional Certificate
                </h2>
                <p className="text-xl text-blue-100 mb-6">
                  Get job-ready in 6 months. No degree or experience required.
                </p>
                <div className="flex items-center space-x-6 mb-6 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span>4.6 (75K+ reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-5 w-5" />
                    <span>2.1M+ enrolled</span>
                  </div>
                </div>
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link to="/learning/courses/1">
                    Enroll Now
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <span>8 courses • 6 months</span>
                    </div>
                    <Progress value={0} className="h-2 bg-white/20" />
                    <div className="text-sm text-blue-100">Ready to start your journey?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Courses</h2>
            <Button asChild variant="outline">
              <Link to="/learning/courses">
                View All Courses
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCourses.map((course) => (
              <CourseraStyleCourseCard 
                key={course.id} 
                course={course}
              />
            ))}
          </div>
        </section>

        {/* Professional Certificates */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Certificates</h2>
              <p className="text-lg text-gray-600">Job-ready training from industry leaders</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/learning/paths">
                View All Paths
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockPaths.map((path) => (
              <CourseraStylePathCard 
                key={path.id} 
                path={path}
              />
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600">Find courses in your field of interest</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'Data Science', count: '1,200+', icon: TrendingUp, color: 'bg-blue-500' },
                { name: 'Computer Science', count: '800+', icon: BookOpen, color: 'bg-green-500' },
                { name: 'Business', count: '650+', icon: Target, color: 'bg-purple-500' },
                { name: 'Health', count: '400+', icon: Award, color: 'bg-red-500' },
                { name: 'Language', count: '300+', icon: Users, color: 'bg-orange-500' },
                { name: 'Arts', count: '250+', icon: Zap, color: 'bg-pink-500' }
              ].map((category) => (
                <Card key={category.name} className="group hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} courses</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (view === 'courses') {
    return (
      <div>
        <CourseraStyleFilterBar
          totalCourses={mockCourses.length}
          currentView={currentView}
          onViewChange={setCurrentView}
          sortBy={sortBy}
          onSortChange={setSortBy}
          level={level}
          onLevelChange={setLevel}
          duration={duration}
          onDurationChange={setDuration}
          subject={subject}
          onSubjectChange={setSubject}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={currentView === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {mockCourses.map((course) => (
              <CourseraStyleCourseCard 
                key={course.id} 
                course={course}
                variant={currentView === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {mockPaths.map((path) => (
          <CourseraStylePathCard 
            key={path.id} 
            path={path}
          />
        ))}
      </div>
    </div>
  );
};