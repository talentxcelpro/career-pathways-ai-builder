import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, Briefcase, TrendingUp, Star, ArrowRight } from "lucide-react";

const featuredCompanies = [
  {
    id: "1",
    name: "TalentXcel Services",
    logo: "",
    industry: "Technology",
    size: "11-50",
    openJobs: 2,
    rating: 4.7,
    description: "TalentXcel is a forward-thinking company committed to innovation and excellence. We provide cutting-edge solutions and foster a collaborative work environment where talented professionals can grow and make a meaningful impact.",
    benefits: ["Health Insurance", "Remote Work", "Learning Budget", "Flexible Hours"],
    techStack: ["React", "Node.js", "Python", "AWS"],
    recentHires: 15,
    isHiring: true,
    featured: true
  },
  {
    id: "2", 
    name: "InnovateTech Solutions",
    logo: "",
    industry: "Software Development",
    size: "51-200",
    openJobs: 8,
    rating: 4.5,
    description: "Leading software development company specializing in AI and machine learning solutions for enterprises.",
    benefits: ["Stock Options", "Health Insurance", "Gym Membership", "Work from Home"],
    techStack: ["Python", "TensorFlow", "Docker", "Kubernetes"],
    recentHires: 32,
    isHiring: true,
    featured: false
  },
  {
    id: "3",
    name: "DataDriven Analytics",
    logo: "",
    industry: "Data Science",
    size: "201-500",
    openJobs: 12,
    rating: 4.6,
    description: "Transforming businesses through advanced data analytics and business intelligence solutions.",
    benefits: ["Performance Bonus", "Training Programs", "Flexible Schedule", "Team Outings"],
    techStack: ["SQL", "Python", "Tableau", "Spark"],
    recentHires: 24,
    isHiring: true,
    featured: false
  }
];

export const CompanyShowcase: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">💼 New Companies Hiring</h2>
          <p className="text-muted-foreground">Discover 150+ companies that started hiring this week</p>
        </div>
        <Button variant="outline">
          View Companies
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-6">
        {featuredCompanies.map((company) => (
          <Card key={company.id} className={`hover:shadow-lg transition-all duration-300 ${company.featured ? 'ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <Avatar className="h-16 w-16 border-2">
                  <AvatarImage src={company.logo} alt={company.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {company.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Company Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold hover:text-primary cursor-pointer">
                          {company.name}
                        </h3>
                        {company.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            🏷️ Featured
                          </Badge>
                        )}
                        {company.isHiring && (
                          <Badge className="bg-green-500 text-white animate-pulse">
                            🔥 Actively Hiring
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {company.industry}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {company.size} employees
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {company.rating}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{company.openJobs}</div>
                      <div className="text-sm text-muted-foreground">open positions</div>
                    </div>
                  </div>

                  {/* Company Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">🛠️ Tech Stack:</div>
                    <div className="flex flex-wrap gap-2">
                      {company.techStack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">🎁 Benefits:</div>
                    <div className="flex flex-wrap gap-2">
                      {company.benefits.slice(0, 4).map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>+{company.recentHires} hired this month</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Jobs
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Follow Company
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browse All Companies CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">🏢 Companies with Hot Jobs</h3>
          <p className="text-muted-foreground mb-4">
            Explore 1,250+ companies actively hiring across all industries
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            View All Companies
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};