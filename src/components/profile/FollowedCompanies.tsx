import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, ExternalLink, Users, Calendar } from "lucide-react";
import { useFollowedCompanies } from "@/hooks/useCompanyFollow";
import { Link } from 'react-router-dom';

interface FollowedCompaniesProps {
  userId: string;
}

export function FollowedCompanies({ userId }: FollowedCompaniesProps) {
  const { data: followedCompanies = [], isLoading } = useFollowedCompanies(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Followed Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (followedCompanies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Followed Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">You haven't followed any companies yet</p>
            <Link to="/companies">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Explore Companies
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Followed Companies ({followedCompanies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followedCompanies.map((follow) => (
            <div 
              key={follow.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={follow.companies?.logo_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {follow.companies?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/companies/${follow.company_id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {follow.companies?.name}
                    </Link>
                    
                    {follow.companies?.industry && (
                      <p className="text-sm text-gray-600 mt-1">
                        {follow.companies.industry}
                      </p>
                    )}
                    
                    {follow.companies?.location && (
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {follow.companies.location}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Followed {formatDate(follow.followed_at)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link to={`/companies/${follow.company_id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                {follow.companies?.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {follow.companies.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {followedCompanies.length > 5 && (
            <div className="text-center pt-4 border-t">
              <Link to="/companies">
                <Button variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  View All Companies
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}