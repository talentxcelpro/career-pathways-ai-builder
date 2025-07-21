import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

const CollegeAdmissions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            College Admissions Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate your college admission journey with expert guidance and resources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>College Search</CardTitle>
              <CardDescription>Find the perfect college for your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Search Colleges</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Application Help</CardTitle>
              <CardDescription>Get assistance with your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Get Help</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Counseling</CardTitle>
              <CardDescription>Connect with admission counselors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Book Session</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Scholarships</CardTitle>
              <CardDescription>Discover scholarship opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Find Scholarships</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollegeAdmissions;