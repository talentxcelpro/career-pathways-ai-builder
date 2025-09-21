import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Target, 
  Award, 
  Flame, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Briefcase,
  Code,
  BarChart3,
  Heart,
  Lightbulb,
  Globe,
  Smartphone,
  ArrowRight,
  Play,
  Calendar,
  CheckCircle,
  Zap
} from 'lucide-react';

const industries = [
  { 
    id: 'technology', 
    title: 'Technology', 
    icon: Code, 
    courses: 245, 
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    description: 'Software, AI, Data Science, Cloud Computing'
  },
  { 
    id: 'business', 
    title: 'Business', 
    icon: Briefcase, 
    courses: 189, 
    color: 'bg-gradient-to-br from-green-500 to-emerald-500',
    description: 'Leadership, Strategy, Finance, Operations'
  },
  { 
    id: 'healthcare', 
    title: 'Healthcare', 
    icon: Heart, 
    courses: 156, 
    color: 'bg-gradient-to-br from-red-500 to-pink-500',
    description: 'Medical, Nursing, Healthcare Management'
  },
  { 
    id: 'marketing', 
    title: 'Marketing', 
    icon: TrendingUp, 
    courses: 134, 
    color: 'bg-gradient-to-br from-purple-500 to-violet-500',
    description: 'Digital Marketing, Content, Social Media'
  },
  { 
    id: 'design', 
    title: 'Design', 
    icon: Lightbulb, 
    courses: 98, 
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    description: 'UI/UX, Graphic Design, Product Design'
  },
  { 
    id: 'education', 
    title: 'Education', 
    icon: BookOpen, 
    courses: 87, 
    color: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    description: 'Teaching, Training, Educational Technology'
  }
];

const courseDurations = [
  { id: 'short', title: 'Quick Learning', duration: '1-4 weeks', icon: Zap, color: 'text-green-600' },
  { id: 'medium', title: 'Professional Courses', duration: '1-3 months', icon: Target, color: 'text-blue-600' },
  { id: 'long', title: 'Expert Programs', duration: '3-12 months', icon: Award, color: 'text-purple-600' }
];

const featuredCourses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    instructor: 'Dr. Angela Yu',
    rating: 4.8,
    students: 12543,
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
    tags: ['Web Development', 'JavaScript', 'React']
  },
  {
    id: 2,
    title: 'Data Science & Machine Learning',
    instructor: 'Prof. Kirill Eremenko',
    rating: 4.9,
    students: 8765,
    duration: '16 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    tags: ['Data Science', 'Python', 'ML']
  },
  {
    id: 3,
    title: 'Digital Marketing Mastery',
    instructor: 'Neil Patel',
    rating: 4.7,
    students: 15432,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    tags: ['Marketing', 'SEO', 'Social Media']
  }
];

export default function LearningHub() {
  const { displayName, streakDays } = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel Learning Hub | Professional Skills Development',
      description: 'Master industry-relevant skills with our comprehensive learning platform. Choose from technology, business, healthcare, and more.'
    });
  }, []);

  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Future Leader';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Future Leader';
    }
    return displayName;
  }, [displayName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-orange-300 font-medium">
                {streakDays}-day learning streak
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {friendlyName}
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your career with industry-leading courses across multiple domains. 
              From quick skills to expert certifications - your learning journey starts here.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search courses, skills, or industries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur border-0 shadow-lg rounded-xl focus:ring-2 focus:ring-cyan-400"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 rounded-lg">
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/learning/courses">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Play className="h-5 w-5 mr-2" />
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/learning/paths">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold backdrop-blur-sm">
                  <Target className="h-5 w-5 mr-2" />
                  Explore Learning Paths
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Course Duration Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Pace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you need quick skills or comprehensive expertise, we have the perfect learning duration for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseDurations.map((duration) => {
            const IconComponent = duration.icon;
            return (
              <Card key={duration.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${duration.color === 'text-green-600' ? 'from-green-100 to-green-200' : duration.color === 'text-blue-600' ? 'from-blue-100 to-blue-200' : 'from-purple-100 to-purple-200'} flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-8 w-8 ${duration.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold">{duration.title}</CardTitle>
                  <p className="text-gray-600">{duration.duration}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <Link to={`/learning/courses?duration=${duration.id}`}>
                    <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white rounded-lg">
                      Explore Courses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Industry Categories */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Industry</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dive deep into your field with specialized courses designed by industry experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => {
              const IconComponent = industry.icon;
              return (
                <Card key={industry.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`h-32 ${industry.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4">
                      <IconComponent className="h-8 w-8 text-white/80" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        {industry.courses} courses
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{industry.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{industry.description}</p>
                    <Link to={`/learning/courses?industry=${industry.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300">
                        Explore {industry.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hand-picked courses from top instructors to accelerate your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-900 font-semibold">
                    {course.price}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{course.rating}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {course.level}
                  </div>
                </div>

                <Link to={`/learning/courses/${course.id}`}>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                    Start Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/learning/courses">
            <Button size="lg" variant="outline" className="px-8 py-4 rounded-xl">
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Learning Features</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Leverage cutting-edge technology to accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Smart Recommendations', href: '/learning/recommendations', icon: Lightbulb, description: 'AI-powered course suggestions' },
              { title: 'Interactive Learning', href: '/learning/interactive', icon: Smartphone, description: 'Hands-on practice environments' },
              { title: 'Learning Community', href: '/learning/community-new', icon: Users, description: 'Connect with fellow learners' },
              { title: 'Mobile Learning', href: '/learning/mobile', icon: Smartphone, description: 'Learn on-the-go' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 mx-auto mb-4 text-cyan-400" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-blue-100 mb-4">{feature.description}</p>
                    <Link to={feature.href}>
                      <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                        Explore
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Thousands of Successful Learners</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Active Learners', value: '50K+', icon: Users },
            { label: 'Courses Available', value: '1,200+', icon: BookOpen },
            { label: 'Success Rate', value: '94%', icon: CheckCircle },
            { label: 'Countries', value: '180+', icon: Globe }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <IconComponent className="h-8 w-8 mx-auto mb-4 text-indigo-600" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of professionals who have advanced their careers with TalentXcel. 
            Start your journey today with our comprehensive learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/learning/courses">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Start Learning for Free
              </Button>
            </Link>
            <Link to="/learning/paths">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold">
                <Calendar className="h-5 w-5 mr-2" />
                View Learning Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}