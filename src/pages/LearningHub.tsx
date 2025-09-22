import React from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { CourseraHeroSection } from '@/components/learning/CourseraHeroSection';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Star,
  Briefcase,
  Code,
  BarChart3,
  Heart,
  Globe,
  GraduationCap,
  Building,
  Palette,
  ChevronRight,
  Play
} from 'lucide-react';
import { CourseGrid } from '@/components/learning/CourseGrid';

export default function LearningHub() {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel Learning Hub | Professional Skills Development',
      description: 'Master industry-relevant skills with our comprehensive learning platform. Choose from 300+ courses across technology, business, healthcare, and more.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <CourseraStyleHeader />
      <CourseraHeroSection />

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Popular Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover courses across various fields and advance your career with industry-relevant skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Code, title: 'Technology', courses: '200+', color: 'bg-blue-50 text-blue-600' },
            { icon: Briefcase, title: 'Business', courses: '150+', color: 'bg-green-50 text-green-600' },
            { icon: Palette, title: 'Design', courses: '80+', color: 'bg-purple-50 text-purple-600' },
            { icon: BarChart3, title: 'Data Science', courses: '120+', color: 'bg-orange-50 text-orange-600' },
            { icon: Heart, title: 'Health', courses: '60+', color: 'bg-red-50 text-red-600' },
            { icon: Building, title: 'Marketing', courses: '90+', color: 'bg-indigo-50 text-indigo-600' },
            { icon: GraduationCap, title: 'Personal Development', courses: '70+', color: 'bg-yellow-50 text-yellow-600' },
            { icon: Globe, title: 'Language Learning', courses: '40+', color: 'bg-pink-50 text-pink-600' }
          ].map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-gray-300">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{category.title}</h3>
                <p className="text-gray-600 mb-3">{category.courses} courses</p>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hand-picked courses from top instructors to accelerate your career growth
          </p>
        </div>
        <CourseGrid limit={6} />
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Link to="/learning/courses">View All Courses</Link>
          </Button>
        </div>
      </section>

      {/* Learn with Confidence */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Learn with confidence</h2>
            <p className="text-xl text-gray-600">Interactive courses from top universities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Learning</h3>
              <p className="text-gray-600">Hands-on projects and quizzes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recognized Certificates</h3>
              <p className="text-gray-600">Credentials from top institutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Learning Journey
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore thousands of courses and build the skills that matter most to your career
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
              <Link to="/learning/courses">
                <BookOpen className="h-5 w-5 mr-2" />
                Explore Courses
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}