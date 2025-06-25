
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  Clock,
  DollarSign,
  MapPin,
  Award,
  MessageSquare,
  Calendar,
  Shield,
  BookOpen,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const [message, setMessage] = useState('');

  // Sample service data
  const service = {
    id: '1',
    title: 'Career Transition Coaching',
    provider_name: 'Sarah Johnson',
    provider_avatar: '/placeholder.svg',
    category: 'Mentoring',
    price_range: '$100-150/hr',
    rating: 4.9,
    review_count: 127,
    experience_years: 8,
    description: 'I specialize in helping tech professionals transition to leadership roles with proven strategies and personalized guidance.',
    detailed_description: `With over 8 years of experience in career coaching and having helped 200+ professionals make successful career transitions, I provide comprehensive support for your career journey.

My approach combines strategic planning, skill development, and personal branding to ensure you not only land your dream role but excel in it. I've worked with professionals at all levels, from senior engineers looking to move into management to directors aiming for VP positions.`,
    skills: ['Leadership Development', 'Career Strategy', 'Tech Industry Navigation', 'Interview Coaching', 'Salary Negotiation'],
    availability: 'Available this week',
    location: 'San Francisco, CA',
    is_verified: true,
    response_time: '2 hours',
    languages: ['English', 'Spanish'],
    sessions_completed: 450,
    success_rate: 92,
    packages: [
      {
        name: 'Single Session',
        duration: '1 hour',
        price: 125,
        description: 'One-on-one coaching session with action plan',
        features: ['60-minute video call', 'Personalized action plan', 'Follow-up email summary']
      },
      {
        name: 'Career Transition Package',
        duration: '4 sessions',
        price: 450,
        description: 'Complete career transition support over 4 weeks',
        features: ['4x 60-minute sessions', 'Resume review', 'Interview preparation', 'LinkedIn optimization', '30-day email support']
      },
      {
        name: 'Executive Coaching',
        duration: '8 sessions',
        price: 850,
        description: 'Comprehensive leadership development program',
        features: ['8x 60-minute sessions', 'Leadership assessment', 'Personal branding strategy', 'Network expansion plan', '60-day support']
      }
    ]
  };

  const reviews = [
    {
      id: '1',
      author: 'Michael Chen',
      role: 'Software Engineer → Engineering Manager',
      rating: 5,
      date: '2 weeks ago',
      content: 'Sarah helped me transition from a senior engineer to an engineering manager role at a top tech company. Her guidance on leadership skills and interview preparation was invaluable.',
      helpful_count: 12
    },
    {
      id: '2',
      author: 'Jennifer Park',
      role: 'Product Manager → Director of Product',
      rating: 5,
      date: '1 month ago',
      content: 'Outstanding coaching experience! Sarah\'s strategic approach and industry knowledge helped me land a director role with a 40% salary increase.',
      helpful_count: 8
    },
    {
      id: '3',
      author: 'David Rodriguez',
      role: 'Tech Lead → VP of Engineering',
      rating: 4,
      date: '2 months ago',
      content: 'Great insights into executive leadership and organizational dynamics. The executive coaching package was comprehensive and well-structured.',
      helpful_count: 15
    }
  ];

  const provider = {
    name: 'Sarah Johnson',
    title: 'Senior Career Coach & Former Tech Executive',
    avatar: '/placeholder.svg',
    about: `Former VP of Engineering at two unicorn startups with 15 years in tech leadership. I've built and scaled engineering teams from 10 to 200+ people and now help others make similar career leaps.

I hold an MBA from Stanford and have been featured in TechCrunch and Forbes for my expertise in tech career development. My coaching methodology combines data-driven insights with personalized strategies.`,
    certifications: ['Certified Professional Coach (ICF)', 'Leadership Circle Profile', 'Hogan Assessment Certified'],
    education: ['MBA - Stanford Graduate School of Business', 'MS Computer Science - UC Berkeley'],
    experience: [
      { company: 'TechStart (Unicorn)', role: 'VP of Engineering', duration: '2019-2022' },
      { company: 'InnovateCorp', role: 'Engineering Director', duration: '2016-2019' },
      { company: 'BigTech Inc.', role: 'Senior Engineering Manager', duration: '2014-2016' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                    <AvatarFallback>{service.provider_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{service.category}</Badge>
                      {service.is_verified && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Verified</span>
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
                      <span className="font-medium">{service.provider_name}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{service.rating}</span>
                        <span className="ml-1">({service.review_count} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {service.location}
                      </div>
                    </div>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{service.response_time}</div>
                    <div className="text-xs text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{service.sessions_completed}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{service.success_rate}%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{service.experience_years} years</div>
                    <div className="text-xs text-gray-600">Experience</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {service.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Pricing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{service.price_range}</div>
                    <div className="text-sm text-gray-600 mb-4">Starting price per hour</div>
                    <Button className="w-full mb-3">Book Consultation</Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Provider
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability</span>
                      <span className="font-medium text-green-600">{service.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Languages</span>
                      <span className="font-medium">{service.languages.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">{service.response_time}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({service.review_count})</TabsTrigger>
            <TabsTrigger value="provider">About Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {service.detailed_description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-600 mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <div className="grid gap-6">
              {service.packages.map((pkg, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${pkg.price}</div>
                        <div className="text-sm text-gray-600">{pkg.duration}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {pkg.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">Select Package</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="font-medium">{review.author}</div>
                          <Badge variant="outline" className="text-xs">{review.role}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{review.content}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{review.helpful_count} people found this helpful</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="provider">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {provider.about.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-gray-600 mb-4">{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {provider.experience.map((exp, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div>
                            <div className="font-medium">{exp.role}</div>
                            <div className="text-sm text-gray-600">{exp.company} • {exp.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {provider.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {provider.education.map((edu, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{edu}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ServiceDetail;
