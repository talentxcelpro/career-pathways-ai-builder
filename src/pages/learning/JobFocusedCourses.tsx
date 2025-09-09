import React from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, TrendingUp, Users, Clock, Star } from 'lucide-react';

const JobFocusedCourses = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Job-Focused Courses | TalentXcel Learning',
      description: 'Courses aligned with current job market demands and hiring trends.'
    });
  }, []);

  // Mock job-focused courses data
  const jobFocusedCourses = [
    {
      id: 1,
      title: 'Full Stack Web Developer',
      description: 'Master the complete web development stack with React, Node.js, and databases',
      jobDemand: 'High',
      avgSalary: '$75,000',
      companies: ['Google', 'Meta', 'Netflix'],
      duration: '12 weeks',
      rating: 4.8,
      enrolled: 2847,
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'CSS']
    },
    {
      id: 2,
      title: 'Data Scientist',
      description: 'Learn Python, machine learning, and data analysis for data-driven careers',
      jobDemand: 'Very High',
      avgSalary: '$95,000',
      companies: ['Amazon', 'Microsoft', 'Tesla'],
      duration: '16 weeks',
      rating: 4.9,
      enrolled: 1923,
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas']
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      description: 'Master cloud infrastructure, CI/CD, and automation tools',
      jobDemand: 'High',
      avgSalary: '$88,000',
      companies: ['AWS', 'Docker', 'Kubernetes Inc'],
      duration: '10 weeks',
      rating: 4.7,
      enrolled: 1456,
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform']
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      description: 'Design user-centered digital experiences with modern tools and methods',
      jobDemand: 'Medium',
      avgSalary: '$68,000',
      companies: ['Adobe', 'Figma', 'Airbnb'],
      duration: '8 weeks',
      rating: 4.6,
      enrolled: 2134,
      skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems']
    },
    {
      id: 5,
      title: 'Cybersecurity Specialist',
      description: 'Protect organizations from cyber threats with ethical hacking and security',
      jobDemand: 'Very High',
      avgSalary: '$92,000',
      companies: ['CrowdStrike', 'Palo Alto', 'Cisco'],
      duration: '14 weeks',
      rating: 4.8,
      enrolled: 987,
      skills: ['Ethical Hacking', 'Network Security', 'Risk Assessment', 'Compliance']
    },
    {
      id: 6,
      title: 'AI/ML Engineer',
      description: 'Build intelligent systems with deep learning and neural networks',
      jobDemand: 'Very High',
      avgSalary: '$110,000',
      companies: ['OpenAI', 'NVIDIA', 'Google AI'],
      duration: '18 weeks',
      rating: 4.9,
      enrolled: 1567,
      skills: ['TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision']
    }
  ];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'text-green-700 bg-green-100';
      case 'High': return 'text-blue-700 bg-blue-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job-Focused Courses</h1>
            <p className="text-gray-600">
              Courses aligned with current job market demands and hiring trends
            </p>
          </div>
        </div>

        {/* Market Insights */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold">Market Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">85%</p>
                <p className="text-sm text-gray-600">Job placement rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">$82K</p>
                <p className="text-sm text-gray-600">Average starting salary</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">3-6 months</p>
                <p className="text-sm text-gray-600">Average time to employment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobFocusedCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDemandColor(course.jobDemand)}>
                    {course.jobDemand} Demand
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <p className="text-sm text-gray-600">{course.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Job Market Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Avg. Salary:</span>
                      <span className="text-green-600 font-semibold">{course.avgSalary}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{course.enrolled.toLocaleString()} enrolled</span>
                      <Clock className="h-3 w-3 ml-3 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Hiring Companies */}
                  <div>
                    <p className="text-sm font-medium mb-2">Top Hiring Companies:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.companies.slice(0, 3).map((company, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Skills you'll learn:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{course.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button className="w-full">
                    Start Career Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobFocusedCourses;