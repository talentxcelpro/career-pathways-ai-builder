import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Award, 
  TrendingUp,
  Star,
  CheckCircle,
  Briefcase,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  FileText,
  Camera,
  Edit,
  Verified,
  Shield,
  Activity,
  BarChart3,
  MessageSquare,
  UserPlus,
  Trophy,
  Target,
  Clock
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';

interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: string;
  founded_year: number;
  employee_count: string;
  location: string;
  headquarters: string;
  website: string;
  logo_url: string;
  cover_image_url: string;
  is_verified: boolean;
  verification_level: 'basic' | 'enhanced' | 'premium';
  culture_score: number;
  work_life_balance: number;
  growth_opportunities: number;
  compensation_rating: number;
  benefits_rating: number;
  total_reviews: number;
  avg_rating: number;
  glassdoor_rating?: number;
  linkedin_followers: number;
  total_jobs_posted: number;
  active_jobs: number;
  successful_hires: number;
  response_rate: number;
  avg_response_time: number;
  tech_stack?: string[];
  office_photos?: string[];
  company_values?: string[];
  perks_benefits?: string[];
  recent_news?: any[];
  leadership_team?: any[];
  diversity_stats?: any;
  financial_info?: any;
  competitors?: string[];
}

export const EnhancedCompanyProfiles: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock enhanced company data
  const company: CompanyProfile = {
    id: '1',
    name: 'TechCorp Solutions',
    slug: 'techcorp-solutions',
    tagline: 'Building the future of technology',
    description: 'TechCorp Solutions is a leading technology company specializing in AI, machine learning, and cloud solutions. We help businesses transform digitally and achieve their goals through innovative technology.',
    industry: 'Technology',
    founded_year: 2018,
    employee_count: '201-500',
    location: 'Bangalore, India',
    headquarters: 'Bangalore, Karnataka, India',
    website: 'https://techcorp-solutions.com',
    logo_url: '/company-logos/techcorp.png',
    cover_image_url: '/company-covers/techcorp-office.jpg',
    is_verified: true,
    verification_level: 'premium',
    culture_score: 4.2,
    work_life_balance: 4.0,
    growth_opportunities: 4.4,
    compensation_rating: 4.1,
    benefits_rating: 3.9,
    total_reviews: 127,
    avg_rating: 4.1,
    glassdoor_rating: 4.3,
    linkedin_followers: 15420,
    total_jobs_posted: 89,
    active_jobs: 12,
    successful_hires: 156,
    response_rate: 85,
    avg_response_time: 2.4,
    tech_stack: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
    office_photos: [
      '/office-photos/techcorp-1.jpg',
      '/office-photos/techcorp-2.jpg',
      '/office-photos/techcorp-3.jpg'
    ],
    company_values: [
      'Innovation First',
      'Customer Success',
      'Team Collaboration',
      'Continuous Learning',
      'Work-Life Balance'
    ],
    perks_benefits: [
      'Health Insurance',
      'Flexible Working Hours',
      'Remote Work Options',
      'Learning & Development Budget',
      'Free Meals',
      'Gym Membership',
      'Stock Options',
      'Maternity/Paternity Leave'
    ],
    recent_news: [
      {
        title: 'TechCorp Raises $50M Series B',
        date: '2024-01-10',
        source: 'TechCrunch'
      },
      {
        title: 'Named Best Workplace 2024',
        date: '2024-01-05',
        source: 'Great Place to Work'
      }
    ],
    leadership_team: [
      {
        name: 'Rajesh Kumar',
        position: 'CEO & Founder',
        image: '/team/ceo.jpg',
        linkedin: 'https://linkedin.com/in/rajeshkumar'
      },
      {
        name: 'Priya Sharma',
        position: 'CTO',
        image: '/team/cto.jpg',
        linkedin: 'https://linkedin.com/in/priyasharma'
      }
    ],
    diversity_stats: {
      gender_diversity: 42,
      leadership_diversity: 35,
      age_diversity: {
        '20-30': 45,
        '30-40': 35,
        '40+': 20
      }
    },
    financial_info: {
      revenue_growth: '+125%',
      funding_stage: 'Series B',
      total_funding: '$75M',
      valuation: '$300M'
    },
    competitors: ['TechRival Inc', 'Innovation Labs', 'CloudTech Pro']
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'premium':
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Premium Verified
          </Badge>
        );
      case 'enhanced':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <Verified className="h-3 w-3 mr-1" />
            Enhanced Verified
          </Badge>
        );
      case 'basic':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <TieredAccessGuard
      feature="enhanced_company_profiles"
      requiredTier="free"
      requiresAuth={false}
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            {company.cover_image_url ? (
              <img
                src={company.cover_image_url}
                alt="Company cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
            )}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Company Logo */}
            <div className="absolute bottom-4 left-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={company.logo_url} alt={company.name} />
                <AvatarFallback className="text-2xl">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-6 flex gap-2">
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant={isFollowing ? "default" : "secondary"}
                size="sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Website
              </Button>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  {getVerificationBadge(company.verification_level)}
                </div>
                <p className="text-lg text-muted-foreground">{company.tagline}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {company.employee_count} employees
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Founded {company.founded_year}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {company.avg_rating} ({company.total_reviews} reviews)
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Company Score</div>
                <div className="text-2xl font-bold">{company.avg_rating}/5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{company.active_jobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful Hires</p>
                  <p className="text-2xl font-bold">{company.successful_hires}</p>
                </div>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{company.response_rate}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{company.avg_response_time}d</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Company Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{company.employee_count} employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span>{company.founded_year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Headquarters:</span>
                        <span>{company.headquarters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">LinkedIn:</span>
                        <span>{company.linkedin_followers.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.tech_stack?.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Company Values</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {company.company_values?.map((value) => (
                      <Card key={value} className="p-3 text-center">
                        <Award className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium">{value}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Office & Workplace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {company.office_photos?.map((photo, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Office photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Culture Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Culture & Values</span>
                    <div className="flex items-center gap-2">
                      <Progress value={company.culture_score * 20} className="w-32" />
                      <span className="font-medium">{company.culture_score}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Work-Life Balance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={company.work_life_balance * 20} className="w-32" />
                      <span className="font-medium">{company.work_life_balance}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Growth Opportunities</span>
                    <div className="flex items-center gap-2">
                      <Progress value={company.growth_opportunities * 20} className="w-32" />
                      <span className="font-medium">{company.growth_opportunities}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compensation</span>
                    <div className="flex items-center gap-2">
                      <Progress value={company.compensation_rating * 20} className="w-32" />
                      <span className="font-medium">{company.compensation_rating}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diversity & Inclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Gender Diversity</span>
                      <span className="font-medium">{company.diversity_stats?.gender_diversity}% women</span>
                    </div>
                    <Progress value={company.diversity_stats?.gender_diversity} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Leadership Diversity</span>
                      <span className="font-medium">{company.diversity_stats?.leadership_diversity}% diverse</span>
                    </div>
                    <Progress value={company.diversity_stats?.leadership_diversity} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perks & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {company.perks_benefits?.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Open Positions ({company.active_jobs})</CardTitle>
                  <Button>View All Jobs</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock job listings */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Senior React Developer</h3>
                        <p className="text-muted-foreground">Full-time • Remote • ₹15-25 LPA</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">React</Badge>
                          <Badge variant="secondary">TypeScript</Badge>
                          <Badge variant="secondary">Node.js</Badge>
                        </div>
                      </div>
                      <Button variant="outline">Apply</Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">DevOps Engineer</h3>
                        <p className="text-muted-foreground">Full-time • Bangalore • ₹12-20 LPA</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">AWS</Badge>
                          <Badge variant="secondary">Docker</Badge>
                          <Badge variant="secondary">Kubernetes</Badge>
                        </div>
                      </div>
                      <Button variant="outline">Apply</Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock reviews */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">2 weeks ago</span>
                    </div>
                    <h4 className="font-semibold mb-2">Great place to work</h4>
                    <p className="text-muted-foreground mb-2">
                      "Excellent work culture and growth opportunities. Management is supportive and the team is collaborative."
                    </p>
                    <Badge variant="outline">Current Employee</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">1 month ago</span>
                    </div>
                    <h4 className="font-semibold mb-2">Amazing learning environment</h4>
                    <p className="text-muted-foreground mb-2">
                      "Best decision I made was joining TechCorp. The learning opportunities are endless and the work-life balance is perfect."
                    </p>
                    <Badge variant="outline">Former Employee</Badge>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Recent News</h3>
                  <div className="space-y-3">
                    {company.recent_news?.map((news, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{news.title}</h4>
                            <p className="text-sm text-muted-foreground">{news.source}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{news.date}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Financial Health</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue Growth:</span>
                        <span className="font-medium text-green-600">{company.financial_info?.revenue_growth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Funding Stage:</span>
                        <span>{company.financial_info?.funding_stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Funding:</span>
                        <span>{company.financial_info?.total_funding}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valuation:</span>
                        <span>{company.financial_info?.valuation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Leadership Team</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {company.leadership_team?.map((leader, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={leader.image} alt={leader.name} />
                            <AvatarFallback>{leader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{leader.name}</h4>
                            <p className="text-sm text-muted-foreground">{leader.position}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};