import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Users, Zap } from 'lucide-react';
import { PageShell, Section } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

const Careers = () => {
  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$120k - $180k",
      description: "Join our frontend team to build the next generation of career tools for millions of professionals worldwide."
    },
    {
      title: "Product Manager - AI/ML",
      department: "Product",
      location: "Remote / New York",
      type: "Full-time", 
      salary: "$140k - $200k",
      description: "Lead product strategy for our AI-powered career intelligence platform and resume optimization tools."
    },
    {
      title: "Data Scientist",
      department: "Data",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $190k", 
      description: "Build ML models to power job matching, salary insights, and career path recommendations for our users."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote / Austin",
      type: "Full-time",
      salary: "$80k - $120k",
      description: "Help enterprise customers maximize their success with TalentXcel's platform and services."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageShell width="xl" pad="lg">
        <PageHeader
          eyebrow="Careers"
          title="Join the TalentXcel team"
          description="Help us build the future of career development. We're a passionate team creating AI-powered tools that help millions of professionals advance their careers worldwide."
          size="lg"
          align="center"
        />

        {/* Company Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                People First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We believe in empowering both our team and our users to reach their full potential.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Innovation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We're constantly pushing the boundaries of what's possible with AI and career technology.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Work-Life Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We support flexible work arrangements and prioritize sustainable growth.
              </p>
            </CardContent>
          </Card>
        </div>

        <Section spacing="lg">
          <h2 className="text-title-1 text-foreground mb-8 text-center">Open Positions</h2>
          <div className="grid gap-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <CardDescription className="text-lg mt-1">
                        {position.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{position.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {position.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {position.salary}
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-title-1 text-foreground mb-4">
            Don't see a perfect fit?
          </h3>
          <p className="text-body text-muted-foreground mb-6">
            We're always looking for talented individuals to join our team.
          </p>
          <Button variant="outline" size="lg">
            Send Us Your Resume
          </Button>
        </div>
      </PageShell>
    </div>
  );
};

export default Careers;