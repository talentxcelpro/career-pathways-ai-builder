import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Globe, Briefcase } from 'lucide-react';

const CompanyDetail = () => {
  const { slug } = useParams();
  
  // Mock company data - in real app this would be fetched based on slug
  const company = {
    name: 'TechCorp Solutions',
    description: 'Leading technology company specializing in innovative software solutions for enterprises worldwide.',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    employees: '1,000-5,000',
    industry: 'Technology',
    founded: '2010',
    logo: '/api/placeholder/100/100'
  };

  const jobs = [
    { title: 'Senior Software Engineer', location: 'Remote', type: 'Full-time' },
    { title: 'Product Manager', location: 'San Francisco, CA', type: 'Full-time' },
    { title: 'UX Designer', location: 'Remote', type: 'Contract' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{company.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {company.employees} employees
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {company.industry}
                </div>
              </div>
              <div className="flex gap-2">
                <Button>Follow Company</Button>
                <Button variant="outline" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            {company.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Founded</h4>
                  <p className="text-muted-foreground">{company.founded}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Industry</h4>
                  <Badge variant="outline">{company.industry}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Company Size</h4>
                  <p className="text-muted-foreground">{company.employees} employees</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p className="text-muted-foreground">{company.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Open Positions ({jobs.length})
                </CardTitle>
                <CardDescription>Current job opportunities at {company.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {job.type}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;