import React from 'react';
import { 
  Building, MapPin, Users, Star, Globe, Calendar, Award, 
  TrendingUp, DollarSign, Clock, CheckCircle, ExternalLink 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface Company {
  id?: string;
  name: string;
  logo_url?: string;
  industry?: string;
  is_verified?: boolean;
  description?: string;
  website?: string;
  employee_count?: string;
  founded_year?: number;
  locations?: string[];
  benefits?: string[];
  rating?: number;
  total_jobs?: number;
  recent_hires?: number;
  avg_salary_range?: {
    min: number;
    max: number;
  };
  company_culture?: {
    work_life_balance: number;
    career_growth: number;
    compensation: number;
    management: number;
  };
  tech_stack?: string[];
  recent_funding?: {
    amount: string;
    round: string;
    date: string;
  };
}

interface EnhancedCompanyProfileProps {
  company: Company;
  children: React.ReactNode;
}

export const EnhancedCompanyProfile: React.FC<EnhancedCompanyProfileProps> = ({
  company,
  children
}) => {
  const renderRating = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const mockCompanyData = {
    description: company.description || "Leading technology company focused on innovation and digital transformation. We build products that millions of users rely on every day.",
    website: company.website || "https://company.com",
    employee_count: company.employee_count || "1,000-5,000",
    founded_year: company.founded_year || 2010,
    locations: company.locations || ["Bangalore", "Mumbai", "Delhi"],
    benefits: company.benefits || [
      "Health Insurance",
      "Remote Work",
      "Learning Budget",
      "Stock Options",
      "Flexible Hours",
      "Gym Membership"
    ],
    rating: company.rating || 4.2,
    total_jobs: company.total_jobs || 23,
    recent_hires: company.recent_hires || 45,
    avg_salary_range: company.avg_salary_range || { min: 12, max: 35 },
    company_culture: company.company_culture || {
      work_life_balance: 4.1,
      career_growth: 4.3,
      compensation: 4.0,
      management: 3.9
    },
    tech_stack: company.tech_stack || [
      "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"
    ],
    recent_funding: company.recent_funding || {
      amount: "$50M",
      round: "Series B",
      date: "2024"
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{company.name}</h2>
                {company.is_verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="font-semibold">{mockCompanyData.rating}</div>
              <div className="text-xs text-muted-foreground">Company Rating</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="font-semibold">{mockCompanyData.employee_count}</div>
              <div className="text-xs text-muted-foreground">Employees</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="font-semibold">{mockCompanyData.total_jobs}</div>
              <div className="text-xs text-muted-foreground">Open Positions</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="font-semibold">{mockCompanyData.founded_year}</div>
              <div className="text-xs text-muted-foreground">Founded</div>
            </div>
          </div>

          {/* Company Overview */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              About Company
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mockCompanyData.description}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={mockCompanyData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{mockCompanyData.locations.join(", ")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Salary Range */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Range
            </h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Salary Range</span>
                <span className="font-semibold text-green-700">
                  ₹{mockCompanyData.avg_salary_range.min}L - ₹{mockCompanyData.avg_salary_range.max}L
                </span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on {mockCompanyData.recent_hires} recent hires
              </p>
            </div>
          </div>

          {/* Company Culture */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Company Culture
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(mockCompanyData.company_culture).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium">{value}/5</span>
                  </div>
                  <Progress value={(value / 5) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-3">Benefits & Perks</h3>
            <div className="flex flex-wrap gap-2">
              {mockCompanyData.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-semibold mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {mockCompanyData.tech_stack.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent Funding */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Recent Funding
            </h3>
            <p className="text-sm">
              Raised <span className="font-semibold">{mockCompanyData.recent_funding.amount}</span> in {mockCompanyData.recent_funding.round} ({mockCompanyData.recent_funding.date})
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1">
              View All Jobs ({mockCompanyData.total_jobs})
            </Button>
            <Button variant="outline">
              Follow Company
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};