import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building, Users, ArrowRight } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  description: string;
  openJobs: number;
  employees: string;
}

const topCompanies: Company[] = [
  {
    id: '1',
    name: 'Amazon',
    logo_url: '/api/placeholder/60/60',
    industry: 'E-commerce & Cloud',
    description: "World's largest cloud & retail firm",
    openJobs: 45,
    employees: '10,000+'
  },
  {
    id: '2',
    name: 'Microsoft',
    logo_url: '/api/placeholder/60/60',
    industry: 'Technology',
    description: 'Leading technology company',
    openJobs: 32,
    employees: '50,000+'
  },
  {
    id: '3',
    name: 'TCS',
    logo_url: '/api/placeholder/60/60',
    industry: 'IT Services',
    description: 'Top IT services and consulting',
    openJobs: 28,
    employees: '100,000+'
  },
  {
    id: '4',
    name: 'Infosys',
    logo_url: '/api/placeholder/60/60',
    industry: 'IT Services',
    description: 'Global leader in digital services',
    openJobs: 22,
    employees: '80,000+'
  },
  {
    id: '5',
    name: 'Wipro',
    logo_url: '/api/placeholder/60/60',
    industry: 'IT Services',
    description: 'Digital transformation partner',
    openJobs: 19,
    employees: '60,000+'
  },
  {
    id: '6',
    name: 'HCL Technologies',
    logo_url: '/api/placeholder/60/60',
    industry: 'IT Services',
    description: 'Technology and digital services',
    openJobs: 15,
    employees: '40,000+'
  }
];

export const TopCompaniesHiring: React.FC = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            💼 Top Companies Hiring
          </h2>
          <p className="text-gray-600">Join industry leaders and fast-growing startups</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-gray-100">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {company.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                    <p className="text-sm text-gray-500 mb-3">{company.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {company.employees}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.openJobs} open jobs
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      View Jobs
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Companies
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};