import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, TrendingUp } from "lucide-react";

interface TopCompany {
  name: string;
  logo_url: string;
  min_salary: number;
  max_salary: number;
  is_verified: boolean;
  color_scheme: string;
}

const topCompanies: TopCompany[] = [
  {
    name: "Google",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    min_salary: 2500000,
    max_salary: 4500000,
    is_verified: true,
    color_scheme: "from-blue-500 to-green-500"
  },
  {
    name: "Microsoft",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    min_salary: 2200000,
    max_salary: 4000000,
    is_verified: true,
    color_scheme: "from-blue-600 to-indigo-600"
  },
  {
    name: "Amazon",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    min_salary: 2000000,
    max_salary: 3800000,
    is_verified: true,
    color_scheme: "from-orange-500 to-yellow-500"
  },
  {
    name: "Flipkart",
    logo_url: "https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png",
    min_salary: 1800000,
    max_salary: 3500000,
    is_verified: false,
    color_scheme: "from-blue-500 to-purple-500"
  },
  {
    name: "Zomato",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    min_salary: 1500000,
    max_salary: 3000000,
    is_verified: true,
    color_scheme: "from-red-500 to-pink-500"
  }
];

export const TopCompaniesSalaries: React.FC = () => {
  const formatSalary = (amount: number) => {
    return `₹${(amount / 100000).toFixed(0)}L`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">Top Company Salaries</h2>
        <Badge variant="outline" className="text-xs">
          Updated Daily
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCompanies.map((company, index) => (
          <Card 
            key={company.name} 
            className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${company.color_scheme} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <CardContent className="p-4 relative">
              <div className="flex items-start gap-3">
                {/* Company Logo */}
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border">
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Company Name & Verification */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    {company.is_verified && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-blue-500 fill-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Salary Range */}
                  <div className="space-y-1">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${company.color_scheme} text-white text-sm font-bold`}>
                      {formatSalary(company.min_salary)} - {formatSalary(company.max_salary)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average annual package
                    </p>
                  </div>
                </div>
                
                {/* Ranking Badge */}
                <div className="text-right">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${company.color_scheme} flex items-center justify-center text-white text-xs font-bold`}>
                    {index + 1}
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Software Engineer</span>
                  <span className="text-green-600 font-medium">+12% this year</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* View More */}
      <div className="text-center">
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View all company salaries →
        </button>
      </div>
    </div>
  );
};