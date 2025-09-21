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
  Zap,
  GraduationCap,
  Building,
  Palette,
  Brain,
  Camera,
  Wrench
} from 'lucide-react';

const industries = [
  { 
    id: 'technology', 
    title: 'Technology & IT', 
    icon: Code, 
    courses: 245, 
    description: 'Web Dev, AI/ML, Cloud, Cybersecurity, Data Science'
  },
  { 
    id: 'business', 
    title: 'Business & Finance', 
    icon: Briefcase, 
    courses: 189, 
    description: 'Management, Strategy, Finance, Operations, Leadership'
  },
  { 
    id: 'healthcare', 
    title: 'Healthcare & Medical', 
    icon: Heart, 
    courses: 156, 
    description: 'Nursing, Medical Training, Healthcare Management'
  },
  { 
    id: 'marketing', 
    title: 'Marketing & Sales', 
    icon: TrendingUp, 
    courses: 134, 
    description: 'Digital Marketing, Content Creation, Social Media'
  },
  { 
    id: 'design', 
    title: 'Design & Creative', 
    icon: Palette, 
    courses: 98, 
    description: 'UI/UX, Graphic Design, Photography, Video'
  },
  { 
    id: 'education', 
    title: 'Education & Training', 
    icon: GraduationCap, 
    courses: 87, 
    description: 'Teaching Methods, Educational Technology, Training'
  }
];

const courseDurations = [
  { 
    id: 'short', 
    title: 'Quick Skills', 
    duration: '1-4 weeks', 
    icon: Zap, 
    description: 'Learn essential skills fast',
    courses: 450
  },
  { 
    id: 'medium', 
    title: 'Professional Courses', 
    duration: '1-3 months', 
    icon: Target, 
    description: 'In-depth professional development',
    courses: 320
  },
  { 
    id: 'long', 
    title: 'Expert Programs', 
    duration: '3-12 months', 
    icon: Award, 
    description: 'Comprehensive mastery programs',
    courses: 180
  }
];

const featuredCourses = [
  {
    id: 1,
    title: 'Complete Full Stack Web Development',
    instructor: 'Dr. Angela Yu',
    rating: 4.8,
    students: 125430,
    duration: '12 weeks',
    level: 'Beginner to Advanced',
    price: 'Free',
    originalPrice: '₹4,999',
    category: 'Technology',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    certified: true,
    trending: true
  },
  {
    id: 2,
    title: 'Data Science & Machine Learning Masterclass',
    instructor: 'Prof. Kirill Eremenko',
    rating: 4.9,
    students: 87650,
    duration: '16 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    originalPrice: '₹8,999',
    category: 'Technology',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
    tags: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
    certified: true,
    trending: false
  },
  {
    id: 3,
    title: 'Digital Marketing Strategy & Growth Hacking',
    instructor: 'Neil Patel',
    rating: 4.7,
    students: 154320,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,999',
    originalPrice: '₹5,999',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format',
    tags: ['SEO', 'Social Media', 'Analytics', 'Growth'],
    certified: true,
    trending: true
  },
  {
    id: 4,
    title: 'UI/UX Design Complete Course',
    instructor: 'Jonas Schmedtmann',
    rating: 4.8,
    students: 76540,
    duration: '10 weeks',
    level: 'Beginner to Intermediate',
    price: '₹2,499',
    originalPrice: '₹6,999',
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&auto=format',
    tags: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    certified: true,
    trending: false
  },
  {
    id: 5,
    title: 'Business Leadership & Management',
    instructor: 'Wharton Business School',
    rating: 4.6,
    students: 43210,
    duration: '14 weeks',
    level: 'Intermediate to Advanced',
    price: '₹3,999',
    originalPrice: '₹12,999',
    category: 'Business',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&auto=format',
    tags: ['Leadership', 'Strategy', 'Team Management', 'Growth'],
    certified: true,
    trending: false
  },
  {
    id: 6,
    title: 'Cloud Computing with AWS',
    instructor: 'Amazon Web Services',
    rating: 4.7,
    students: 92340,
    duration: '12 weeks',
    level: 'Intermediate',
    price: '₹3,499',
    originalPrice: '₹9,999',
    category: 'Technology',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop&auto=format',
    tags: ['AWS', 'Cloud', 'DevOps', 'Infrastructure'],
    certified: true,
    trending: true
  },
  {
    id: 7,
    title: 'Healthcare Management & Administration',
    instructor: 'Johns Hopkins University',
    rating: 4.5,
    students: 23450,
    duration: '16 weeks',
    level: 'Advanced',
    price: '₹4,999',
    originalPrice: '₹15,999',
    category: 'Healthcare',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&auto=format',
    tags: ['Healthcare', 'Management', 'Policy', 'Quality'],
    certified: true,
    trending: false
  },
  {
    id: 8,
    title: 'Photography & Visual Storytelling',
    instructor: 'Annie Leibovitz Masterclass',
    rating: 4.8,
    students: 56780,
    duration: '6 weeks',
    level: 'Beginner to Advanced',
    price: '₹2,199',
    originalPrice: '₹7,999',
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=250&fit=crop&auto=format',
    tags: ['Photography', 'Editing', 'Composition', 'Lighting'],
    certified: true,
    trending: false
  },
  {
    id: 9,
    title: 'Cybersecurity Fundamentals',
    instructor: 'MIT Cybersecurity',
    rating: 4.9,
    students: 67890,
    duration: '10 weeks',
    level: 'Beginner to Intermediate',
    price: '₹3,799',
    originalPrice: '₹10,999',
    category: 'Technology',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format',
    tags: ['Security', 'Ethical Hacking', 'Network', 'Compliance'],
    certified: true,
    trending: true
  }
];

const learningStats = [
  { label: 'Active Learners', value: '50,000+', icon: Users, color: 'text-primary' },
  { label: 'Courses Available', value: '1,200+', icon: BookOpen, color: 'text-brand-green' },
  { label: 'Success Rate', value: '94%', icon: CheckCircle, color: 'text-success' },
  { label: 'Countries', value: '180+', icon: Globe, color: 'text-info' }
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-warning" />
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {streakDays}-day learning streak
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome back,{' '}
              <span className="text-warning">
                {friendlyName}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your career with industry-leading courses across multiple domains. 
              From quick skills to expert certifications - your learning journey starts here.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search courses, skills, or industries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white border-0 shadow-lg rounded-xl focus:ring-2 focus:ring-warning"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 px-6 rounded-lg">
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/learning/courses">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
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
      </section>

      {/* Course Duration Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Learning Pace</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need quick skills or comprehensive expertise, we have the perfect learning duration for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseDurations.map((duration) => {
            const IconComponent = duration.icon;
            return (
              <Card key={duration.id} className="group hover:shadow-lg transition-all duration-300 border hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{duration.title}</CardTitle>
                  <p className="text-muted-foreground">{duration.duration}</p>
                  <Badge variant="secondary" className="mt-2">
                    {duration.courses} courses
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">{duration.description}</p>
                  <Link to={`/learning/courses?duration=${duration.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg">
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
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore by Industry</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dive deep into your field with specialized courses designed by industry experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => {
              const IconComponent = industry.icon;
              return (
                <Card key={industry.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                  <div className="h-24 bg-primary/5 relative overflow-hidden flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/20 text-primary border-0">
                        {industry.courses} courses
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{industry.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{industry.description}</p>
                    <Link to={`/learning/courses?industry=${industry.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Featured Courses</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked courses from top instructors to accelerate your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {course.trending && (
                    <Badge className="bg-warning text-white">
                      🔥 Trending
                    </Badge>
                  )}
                  {course.certified && (
                    <Badge className="bg-success text-white">
                      <Award className="h-3 w-3 mr-1" />
                      Certified
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-card/90 text-foreground font-semibold">
                    {course.price}
                  </Badge>
                </div>
                {course.originalPrice && (
                  <div className="absolute top-10 right-4">
                    <Badge variant="outline" className="bg-card/90 text-muted-foreground line-through text-xs">
                      {course.originalPrice}
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-warning fill-current" />
                    <span className="text-sm font-medium ml-1">{course.rating}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">by {course.instructor}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {course.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
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
              View All {featuredCourses.length * 10}+ Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Learning Features</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Leverage cutting-edge technology to accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Smart Recommendations', href: '/learning/recommendations', icon: Brain, description: 'AI-powered course suggestions' },
              { title: 'Interactive Learning', href: '/learning/interactive', icon: Smartphone, description: 'Hands-on practice environments' },
              { title: 'Learning Community', href: '/learning/community-new', icon: Users, description: 'Connect with fellow learners' },
              { title: 'Mobile Learning', href: '/learning/mobile', icon: Smartphone, description: 'Learn on-the-go' }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 mx-auto mb-4 text-warning" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/80 mb-4">{feature.description}</p>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Join Thousands of Successful Learners</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {learningStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of professionals who have advanced their careers with TalentXcel. 
            Start your journey today with our comprehensive learning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/learning/courses">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-semibold">
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