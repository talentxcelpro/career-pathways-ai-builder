import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, GraduationCap, Users, BookOpen, Plus } from "lucide-react";

export default function EnhancedDirectoryNavigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="bg-gradient-to-br from-background to-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Professional Directory</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover top companies and colleges, connect with professionals, and advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {/* Companies Card */}
          <Card className={`transition-all duration-300 hover:shadow-lg ${isActive('/companies') ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Companies</h3>
                  <p className="text-sm text-muted-foreground">Explore top employers and opportunities</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>500+ verified companies</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Detailed company profiles</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full" variant={isActive('/companies') ? 'default' : 'outline'}>
                  <Link to="/companies">
                    <Building2 className="h-4 w-4 mr-2" />
                    Browse Companies
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to="/companies/submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Company
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Colleges Card */}
          <Card className={`transition-all duration-300 hover:shadow-lg ${isActive('/colleges') ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Colleges</h3>
                  <p className="text-sm text-muted-foreground">Find the perfect educational institution</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>300+ verified colleges</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Comprehensive college info</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full" variant={isActive('/colleges') ? 'default' : 'outline'}>
                  <Link to="/colleges">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Browse Colleges
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to="/colleges/submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit College
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> to add your organization.
          </p>
        </div>
      </div>
    </div>
  );
}