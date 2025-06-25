
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Users, 
  Star, 
  Briefcase, 
  Globe, 
  Calendar,
  Heart,
  Share2,
  Building,
  DollarSign,
  Coffee,
  Award,
  TrendingUp
} from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Sample company data - in real app, fetch based on id
  const company = {
    id: '1',
    name: 'TechCorp Inc.',
    description: 'Leading technology solutions provider specializing in AI and cloud computing',
    logo_url: '/placeholder.svg',
    cover_image_url: '/placeholder.svg',
    location: 'San Francisco, CA',
    industry: 'Technology',
    size_range: '1000-5000',
    rating: 4.5,
    reviewCount: 234,
    openJobs: 15,
    employees: 3200,
    founded_year: 2010,
    website: 'https://techcorp.com',
    culture_description: 'We foster innovation, collaboration, and continuous learning in a fast-paced environment.',
    benefits: ['Health Insurance', 'Remote Work', '401k Matching', 'Stock Options', 'Learning Budget'],
    tech_stack: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Python', 'PostgreSQL'],
    social_links: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp'
    }
  };

  const jobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary_range: '$120k - $180k',
      posted_days_ago: 2
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      salary_range: '$140k - $200k',
      posted_days_ago: 5
    },
    {
      id: '3',
      title: 'Data Scientist',
      department: 'Data Science',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary_range: '$130k - $190k',
      posted_days_ago: 1
    }
  ];

  const reviews = [
    {
      id: '1',
      rating: 5,
      title: 'Amazing place to grow',
      content: 'Great culture, excellent benefits, and amazing growth opportunities. The team is very supportive.',
      author: 'Software Engineer',
      department: 'Engineering',
      tenure: '2 years',
      date: '2 weeks ago',
      pros: ['Great work-life balance', 'Innovative projects', 'Supportive management'],
      cons: ['Fast-paced environment', 'High expectations']
    },
    {
      id: '2',
      rating: 4,
      title: 'Good company with room for improvement',
      content: 'Solid company with good benefits. Could improve on internal communication.',
      author: 'Product Designer',
      department: 'Design',
      tenure: '1 year',
      date: '1 month ago',
      pros: ['Good benefits', 'Smart colleagues', 'Interesting challenges'],
      cons: ['Communication gaps', 'Limited remote flexibility']
    }
  ];

  const ratingBreakdown = [
    { category: 'Work-Life Balance', rating: 4.2 },
    { category: 'Compensation', rating: 4.6 },
    { category: 'Career Growth', rating: 4.4 },
    { category: 'Management', rating: 4.1 },
    { category: 'Culture', rating: 4.7 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Header */}
        <div className="relative -mt-32 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={company.logo_url} alt={company.name} />
                  <AvatarFallback className="text-2xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{company.rating}</span>
                      <span className="ml-1">({company.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {company.employees.toLocaleString()} employees
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{company.industry}</Badge>
                    <Badge variant="outline">Founded {company.founded_year}</Badge>
                    <Badge variant="outline" className="text-green-600">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {company.openJobs} open positions
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({company.openJobs})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({company.reviewCount})</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{company.description}</p>
                    <p className="text-gray-600">{company.culture_description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technology Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {company.tech_stack.map((tech, index) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Industry</span>
                      <span className="font-medium">{company.industry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">{company.size_range} employees</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Founded</span>
                      <span className="font-medium">{company.founded_year}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Website</span>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        Visit
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Benefits & Perks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {company.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-medium">{job.salary_range}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Posted {job.posted_days_ago} days ago</span>
                          </div>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{company.rating}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= company.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-gray-600">{company.reviewCount} reviews</div>
                  </div>
                  
                  <div className="space-y-2">
                    {ratingBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.rating * 20} className="w-16 h-2" />
                          <span className="text-sm font-medium w-8">{item.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <CardTitle className="text-lg">{review.title}</CardTitle>
                          <CardDescription>
                            {review.author} • {review.department} • {review.tenure} • {review.date}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{review.content}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">Pros</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {review.pros.map((pro, index) => (
                              <li key={index}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Cons</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {review.cons.map((con, index) => (
                              <li key={index}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{company.culture_description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Coffee className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Work-Life Balance</h3>
                    <p className="text-sm text-gray-600">Flexible hours and remote work options</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Growth Opportunities</h3>
                    <p className="text-sm text-gray-600">Clear career progression paths</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Team Collaboration</h3>
                    <p className="text-sm text-gray-600">Open communication and teamwork</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDetail;
