import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Compass, Users, Briefcase, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Discover = () => {
  return (
    <>
      <Helmet>
        <title>Discover | Explore Opportunities & Connections</title>
        <meta name="description" content="Discover new opportunities, jobs, events, and professional connections. Explore what's possible in your career." />
        <link rel="canonical" href="https://talentxcel.in/discover" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Compass className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Discover</h1>
            </div>
            <p className="text-muted-foreground">Explore opportunities, connections, and insights tailored for you</p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search for jobs, companies, people, or skills..."
                    className="pl-10"
                  />
                </div>
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {/* Discovery Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
                  <p className="text-muted-foreground mb-4">Discover your next career move</p>
                  <Badge variant="secondary">1,234 new jobs</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">People</h3>
                  <p className="text-muted-foreground mb-4">Connect with industry professionals</p>
                  <Badge variant="secondary">567 suggested</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Events</h3>
                  <p className="text-muted-foreground mb-4">Join professional events</p>
                  <Badge variant="secondary">23 upcoming</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Featured Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Featured Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Senior React Developer", company: "TechCorp", location: "Remote", salary: "$80-120k", type: "Full-time" },
                    { title: "Product Manager", company: "StartupXYZ", location: "San Francisco", salary: "$100-140k", type: "Full-time" },
                    { title: "UX/UI Designer", company: "DesignStudio", location: "New York", salary: "$70-100k", type: "Contract" }
                  ].map((job, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <p className="text-muted-foreground">{job.company} • {job.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{job.salary}</Badge>
                            <Badge variant="secondary">{job.type}</Badge>
                          </div>
                        </div>
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning & Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Advanced React Patterns", type: "Course", duration: "6 hours", level: "Advanced" },
                    { title: "Leadership Skills Workshop", type: "Workshop", duration: "2 days", level: "Intermediate" },
                    { title: "Data Science Fundamentals", type: "Course", duration: "12 hours", level: "Beginner" },
                    { title: "Agile Project Management", type: "Certification", duration: "4 weeks", level: "Intermediate" }
                  ].map((course, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.type} • {course.duration}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline">{course.level}</Badge>
                        <Button size="sm" variant="outline">Learn More</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Discover;