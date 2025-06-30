import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  TrendingUp,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch company data from Supabase
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) throw new Error('Company ID is required');
      
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            location,
            employment_type,
            created_at,
            salary_min,
            salary_max,
            salary_currency,
            description,
            skills_required,
            applications_count,
            views_count,
            is_active
          )
        `)
        .eq('id', id)
        .eq('is_verified', true)
        .eq('jobs.is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <p className="text-gray-600 mb-4">The company you're looking for doesn't exist or is not publicly available.</p>
          <Link to="/companies">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sample reviews and rating data (in real app, this would come from database)
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

  const averageRating = 4.5;
  const reviewCount = reviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Cover Image with Overlay */}
      <div className="relative h-80 overflow-hidden">
        {company.cover_image_url ? (
          <img 
            src={company.cover_image_url} 
            alt={`${company.name} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${company.cover_image_url ? 'hidden' : ''} absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700`}></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Back Button Overlay */}
        <div className="absolute top-6 left-6 z-10">
          <Link to="/companies">
            <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Company Header */}
        <div className="relative -mt-24 mb-8">
          <Card className="p-8 shadow-xl backdrop-blur-sm bg-white/95">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Enhanced Company Logo */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-blue-100">
                    <AvatarImage 
                      src={company.logo_url} 
                      alt={company.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {company.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {company.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.name}</h1>
                    {company.description && (
                      <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                        {company.description}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">{averageRating}</span>
                      <span>({reviewCount} reviews)</span>
                    </div>
                    {company.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.employee_count_range && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span>{company.employee_count_range}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Badges */}
                  <div className="flex flex-wrap gap-2">
                    {company.industry && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Building className="h-3 w-3 mr-1" />
                        {company.industry}
                      </Badge>
                    )}
                    {company.founded_year && (
                      <Badge variant="outline" className="border-gray-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        Founded {company.founded_year}
                      </Badge>
                    )}
                    {company.jobs && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {company.jobs.length} open positions
                      </Badge>
                    )}
                    {company.is_verified && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <Award className="h-3 w-3 mr-1" />
                        Verified Company
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="flex items-center gap-2 min-w-[120px]"
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

        {/* Content Tabs - keep existing tab structure */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
            <TabsTrigger value="jobs" className="text-sm font-medium">Jobs ({company.jobs?.length || 0})</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm font-medium">Reviews ({reviewCount})</TabsTrigger>
            <TabsTrigger value="culture" className="text-sm font-medium">Culture</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description && (
                      <p className="text-gray-600 mb-4">{company.description}</p>
                    )}
                    {company.culture_description && (
                      <p className="text-gray-600">{company.culture_description}</p>
                    )}
                  </CardContent>
                </Card>

                {company.tech_stack && company.tech_stack.length > 0 && (
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
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.industry && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-medium">{company.industry}</span>
                      </div>
                    )}
                    {company.employee_count_range && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Size</span>
                        <span className="font-medium">{company.employee_count_range}</span>
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Founded</span>
                        <span className="font-medium">{company.founded_year}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Website</span>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {company.benefits && company.benefits.length > 0 && (
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
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4">
              {company.jobs && company.jobs.length > 0 ? (
                company.jobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span>{job.location || 'Remote'}</span>
                            <span>•</span>
                            <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center text-green-600 mb-3">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                {job.salary_currency || 'INR'} {job.salary_min?.toLocaleString()}{job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : '+'}
                              </span>
                            </div>
                          )}
                          {job.skills_required && job.skills_required.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills_required.slice(0, 5).map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills_required.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Link to={`/jobs/${job.id}`}>
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No current job openings</p>
                </div>
              )}
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
                    <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-gray-600">{reviewCount} reviews</div>
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
