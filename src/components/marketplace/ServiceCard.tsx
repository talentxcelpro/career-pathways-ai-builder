
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, CheckCircle, User } from "lucide-react";
import { formatCompactCurrency } from "@/utils/currencyUtils";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    delivery_time_days: number;
    provider_name: string;
    provider_id: string;
    provider_avatar?: string;
    provider_location?: string;
    average_rating: number;
    total_reviews: number;
    total_orders: number;
    is_featured: boolean;
    is_verified?: boolean;
    tags: string[];
  };
  onServiceClick?: (serviceId: string) => void;
}

export default function ServiceCard({ service, onServiceClick }: ServiceCardProps) {
  const handleViewService = () => {
    onServiceClick?.(service.id);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/profile/${service.provider_id}`, '_blank');
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/services/book/${service.id}`, '_blank');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-border/60 cursor-pointer h-full">
      <CardHeader className="pb-3" onClick={handleViewService}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={service.provider_avatar} />
              <AvatarFallback>
                {service.provider_name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {service.provider_name}
                </h3>
                {service.is_verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {service.provider_location && (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span>{service.provider_location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {service.is_featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4" onClick={handleViewService}>
        <div>
          <h4 className="font-medium line-clamp-2 mb-2">{service.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {service.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {service.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{service.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{service.average_rating}</span>
            <span className="text-muted-foreground">
              ({service.total_reviews} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{service.delivery_time_days} days</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold">
                ₹{formatCompactCurrency(service.price)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {service.total_orders > 0 && `(${service.total_orders} orders)`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewProfile}
              >
                <User className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>Payment handled directly between buyer and seller</p>
        </div>
      </CardContent>
    </Card>
  );
}
