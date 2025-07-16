import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Users, Award, CheckCircle } from "lucide-react";
import { formatCompactCurrency } from "@/utils/currencyUtils";

interface RecommendationProps {
  type: 'trending' | 'featured' | 'recommended';
  services: any[];
  onServiceClick?: (serviceId: string) => void;
}

export default function ServiceRecommendations({ type, services, onServiceClick }: RecommendationProps) {
  const getHeaderInfo = () => {
    switch (type) {
      case 'trending':
        return {
          title: 'Trending Services',
          icon: TrendingUp,
          description: 'Popular services this week',
          color: 'text-orange-500'
        };
      case 'featured':
        return {
          title: 'Featured Experts',
          icon: Award,
          description: 'Top-rated professionals',
          color: 'text-purple-500'
        };
      case 'recommended':
        return {
          title: 'Recommended for You',
          icon: Users,
          description: 'Based on your profile',
          color: 'text-blue-500'
        };
      default:
        return {
          title: 'Services',
          icon: Users,
          description: '',
          color: 'text-gray-500'
        };
    }
  };

  const { title, icon: Icon, description, color } = getHeaderInfo();

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.slice(0, 5).map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onServiceClick?.(service.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={service.provider_avatar} />
                <AvatarFallback>
                  {service.provider_name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm line-clamp-1">{service.title}</h4>
                  {service.is_verified && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{service.provider_name}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{service.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {service.category}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">₹{formatCompactCurrency(service.base_price)}</p>
                <p className="text-xs text-muted-foreground">
                  {service.price_type === 'hourly' ? '/hour' : 'fixed'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {services.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" className="w-full">
              View All {title}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}