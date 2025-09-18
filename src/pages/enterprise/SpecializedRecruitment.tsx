import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Shield,
  Code,
  Brain,
  Database,
  Briefcase,
  CheckCircle,
  Award,
  Globe,
  Filter
} from 'lucide-react';

export const SpecializedRecruitment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ai-ml');

  const specialties = [
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: <Brain className="h-5 w-5" />, count: 2847 },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: <Shield className="h-5 w-5" />, count: 1923 },
    { id: 'data-science', name: 'Data Science', icon: <Database className="h-5 w-5" />, count: 3456 },
    { id: 'blockchain', name: 'Blockchain', icon: <Code className="h-5 w-5" />, count: 987 },
    { id: 'cloud', name: 'Cloud Architecture', icon: <Globe className="h-5 w-5" />, count: 2134 }
  ];

  const candidates = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Senior AI Research Scientist',
      location: 'San Francisco, CA',
      experience: '8 years',
      rate: '$180/hour',
      rating: 4.9,
      skills: ['TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
      verified: true,
      availability: 'Available',
      pastProjects: 23,
      successRate: 98
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      title: 'Machine Learning Engineer',
      location: 'Austin, TX',
      experience: '6 years',
      rate: '$150/hour',
      rating: 4.8,
      skills: ['Python', 'Scikit-learn', 'AWS SageMaker', 'MLOps'],
      verified: true,
      availability: 'Next week',
      pastProjects: 18,
      successRate: 96
    },
    {
      id: 3,
      name: 'Dr. Priya Sharma',
      title: 'AI Solutions Architect',
      location: 'Remote (India)',
      experience: '10 years',
      rate: '$120/hour',
      rating: 4.9,
      skills: ['Deep Learning', 'Azure ML', 'Model Deployment', 'AI Strategy'],
      verified: true,
      availability: 'Available',
      pastProjects: 31,
      successRate: 99
    }
  ];

  const freelancerMetrics = {
    totalFreelancers: 12847,
    avgRating: 4.7,
    projectSuccess: 96,
    avgResponseTime: '2 hours'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Specialized Recruitment & Freelancer Platform
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Curated marketplace for niche skills and freelance talent with verified credentials
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">Talent Search</TabsTrigger>
            <TabsTrigger value="freelancers">Freelancer Pool</TabsTrigger>
            <TabsTrigger value="projects">Project Management</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Advanced Talent Search
                </CardTitle>
                <CardDescription>
                  Find specialized talent across AI, cybersecurity, data science, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input 
                      placeholder="Search by skills, role, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>

                  {/* Specialty Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {specialties.map((specialty) => (
                      <Button
                        key={specialty.id}
                        variant={selectedSpecialty === specialty.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSpecialty(specialty.id)}
                        className="flex items-center gap-2 h-auto p-3"
                      >
                        {specialty.icon}
                        <div className="text-left">
                          <div className="font-medium text-xs">{specialty.name}</div>
                          <div className="text-xs text-muted-foreground">{specialty.count}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <p className="text-sm text-gray-600">{candidate.title}</p>
                        </div>
                      </div>
                      {candidate.verified && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{candidate.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{candidate.rate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{candidate.rating} ({candidate.pastProjects})</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Availability:</span>
                        <div className={candidate.availability === 'Available' ? 'text-green-600' : 'text-yellow-600'}>
                          {candidate.availability}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <div className="text-green-600">{candidate.successRate}%</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="freelancers" className="space-y-6">
            {/* Freelancer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{freelancerMetrics.totalFreelancers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Verified professionals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{freelancerMetrics.avgRating}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5 stars
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Success</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{freelancerMetrics.projectSuccess}%</div>
                  <p className="text-xs text-muted-foreground">
                    Completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{freelancerMetrics.avgResponseTime}</div>
                  <p className="text-xs text-muted-foreground">
                    Average response
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Freelancer Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Freelancer Categories</CardTitle>
                <CardDescription>Browse by specialty and skill level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { category: 'AI & Machine Learning', count: 2847, avgRate: '$165/hr', topSkill: 'TensorFlow' },
                    { category: 'Cybersecurity', count: 1923, avgRate: '$145/hr', topSkill: 'Penetration Testing' },
                    { category: 'Data Science', count: 3456, avgRate: '$135/hr', topSkill: 'Python' },
                    { category: 'Blockchain', count: 987, avgRate: '$175/hr', topSkill: 'Solidity' },
                    { category: 'Cloud Architecture', count: 2134, avgRate: '$155/hr', topSkill: 'AWS' },
                    { category: 'DevOps', count: 1876, avgRate: '$140/hr', topSkill: 'Kubernetes' }
                  ].map((cat, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{cat.category}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="font-medium">{cat.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Rate:</span>
                            <span className="font-medium">{cat.avgRate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Top Skill:</span>
                            <Badge variant="outline" className="text-xs">{cat.topSkill}</Badge>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3">
                          Browse {cat.category}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'ML Model Development', freelancer: 'Dr. Sarah Chen', progress: 75, deadline: '2 weeks', budget: '$15,000' },
                      { title: 'Security Audit', freelancer: 'Alex Rodriguez', progress: 45, deadline: '3 weeks', budget: '$8,500' },
                      { title: 'Data Pipeline Setup', freelancer: 'Dr. Priya Sharma', progress: 90, deadline: '1 week', budget: '$12,000' }
                    ].map((project, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{project.title}</h3>
                          <Badge variant="outline">{project.deadline}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Freelancer: {project.freelancer}</p>
                          <p>Budget: {project.budget}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quality Assurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
                      <p className="text-sm text-gray-600">Project Success Rate</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Quality Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>On-time Delivery:</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Client Satisfaction:</span>
                          <span className="font-medium">4.8/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Code Quality Score:</span>
                          <span className="font-medium">9.2/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Communication Rating:</span>
                          <span className="font-medium">4.9/5</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Verification Process</h4>
                      <div className="space-y-2">
                        {[
                          'Identity verification',
                          'Skill assessment tests',
                          'Portfolio review',
                          'Reference checks',
                          'Background screening'
                        ].map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$245K</div>
                  <p className="text-xs text-green-600">+18% vs last quarter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$180K</div>
                  <p className="text-xs text-gray-600">vs. traditional hiring</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Project Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6.5 weeks</div>
                  <p className="text-xs text-green-600">-25% improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Freelancer Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-gray-600">Return for new projects</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Dashboard</CardTitle>
                <CardDescription>Key metrics and trends for your freelance workforce</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Project Categories</h3>
                    <div className="space-y-3">
                      {[
                        { category: 'AI/ML Development', projects: 23, spend: 85000 },
                        { category: 'Cybersecurity', projects: 12, spend: 45000 },
                        { category: 'Data Science', projects: 18, spend: 67000 },
                        { category: 'Cloud Architecture', projects: 8, spend: 48000 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{item.category}</p>
                            <p className="text-xs text-gray-600">{item.projects} projects</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">${item.spend.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Top Performers</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Dr. Sarah Chen', projects: 8, rating: 4.9, earnings: 45000 },
                        { name: 'Alex Rodriguez', projects: 6, rating: 4.8, earnings: 38000 },
                        { name: 'Dr. Priya Sharma', projects: 7, rating: 4.9, earnings: 42000 }
                      ].map((performer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{performer.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{performer.projects} projects</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                {performer.rating}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">${performer.earnings.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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