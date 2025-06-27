import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Globe, Calendar, Heart } from "lucide-react";
import { useCompanyFollow } from "@/hooks/useCompanyFollow";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  location?: string;
  industry?: string;
  size_range?: string;
  website?: string;
  founded_year?: number;
  employee_count_range?: string;
  company_follows?: Array<{ id: string; user_id: string }>;
}

interface CompanyDetailsProps {
  company: Company | null;
}

export default function CompanyDetails({ company }: CompanyDetailsProps) {
  const { followCompany, isFollowing: isFollowingMutation } = useCompanyFollow();

  if (!company) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a company to see details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isFollowing = company.company_follows && company.company_follows.length > 0;

  const handleFollowToggle = () => {
    followCompany({ companyId: company.id, isFollowing });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={company.logo_url} alt={company.name} />
            <AvatarFallback>
              <Building2 className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{company.name}</h3>
                {company.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{company.description}</p>
                )}
              </div>
              <Button
                variant={isFollowing ? "default" : "outline"}
                size="sm"
                onClick={handleFollowToggle}
                disabled={isFollowingMutation}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {company.industry && (
                <Badge variant="secondary">
                  <Building2 className="h-3 w-3 mr-1" />
                  {company.industry}
                </Badge>
              )}
              {company.location && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {company.location}
                </Badge>
              )}
              {company.employee_count_range && (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {company.employee_count_range}
                </Badge>
              )}
              {company.founded_year && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Founded {company.founded_year}
                </Badge>
              )}
            </div>
            
            {company.website && (
              <div className="flex items-center text-sm text-blue-600">
                <Globe className="h-4 w-4 mr-1" />
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
