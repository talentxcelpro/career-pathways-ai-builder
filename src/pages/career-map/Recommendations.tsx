
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp, Star, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Recommendations = () => {
  // Mock data for recommendations
  const growthPlans = [
    {
      id: 1,
      title: 'Frontend to Full-Stack Developer',
      description: 'Transition from frontend development to full-stack with backend skills',
      duration: '6-9 months',
      difficulty: 'Intermediate',
      skills: ['Node.js', 'Database Design', 'API Development', 'DevOps'],
      progress: 30
    },
    {
      id: 2,
      title: 'Senior Software Engineer Track',
      description: 'Advance to senior level with leadership and architecture skills',
      duration: '12-18 months',
      difficulty: 'Advanced',
      skills: ['System Design', 'Team Leadership', 'Code Review', 'Mentoring'],
      progress: 15
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior Full-Stack Developer',
      company: 'Tech Corp',
      expertise: ['React', 'Node.js', 'AWS', 'Team Leadership'],
      rating: 4.9,
      sessions: 127,
      price: 'Free'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      title: 'Engineering Manager',
      company: 'StartupXYZ',
      expertise: ['System Design', 'Career Growth', 'Technical Leadership'],
      rating: 4.8,
      sessions: 89,
      price: '₹50/hour'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      provider: 'TechLearn',
      duration: '8 hours',
      rating: 4.7,
      students: 12500,
      level: 'Advanced'
    },
    {
      id: 2,
      title: 'System Design Fundamentals',
      provider: 'Engineering Academy',
      duration: '15 hours',
      rating: 4.9,
      students: 8900,
      level: 'Intermediate'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/career-map" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Career Map
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Recommendations</h1>
          <p className="text-gray-600">Personalized growth plans, mentors, and learning resources</p>
        </div>

        {/* Growth Plans */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Growth Plans</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {growthPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <Badge variant={plan.difficulty === 'Advanced' ? 'destructive' : 'secondary'}>
                      {plan.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Duration: {plan.duration}</span>
                      <span>Progress: {plan.progress}%</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Skills you'll gain:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Start Plan
                      </Button>
                      <Button variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mentors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription>{mentor.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{mentor.company}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {mentor.rating}
                      </div>
                      <span>{mentor.sessions} sessions</span>
                      <Badge variant="outline">{mentor.price}</Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-1">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm">
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recommended Courses */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>by {course.provider}</CardDescription>
                    </div>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{course.duration}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {course.rating} ({course.students.toLocaleString()} students)
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to="/learning" className="flex-1">
                        <Button className="w-full">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Enroll Now
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recommendations;
