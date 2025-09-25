import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, Shield, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
  };
  images: string[];
  location?: string;
  deliveryTime?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  category,
  subcategory,
  price,
  currency,
  provider,
  images,
  location,
  deliveryTime,
  tags,
  rating,
  reviewCount,
  isFavorite = false,
  onFavorite,
  onShare,
  onClick,
  className
}) => {
  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-border",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0">
        {/* Service Image */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {subcategory || category}
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background",
                isFavorite && "text-red-500 hover:text-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-semibold">
              {formatPrice(price)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Provider Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={provider.avatar} alt={provider.name} />
            <AvatarFallback className="text-xs">
              {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium truncate">{provider.name}</span>
              {provider.verified && (
                <Shield className="h-3 w-3 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {provider.rating} ({provider.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
          {deliveryTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{deliveryTime}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount} reviews)
            </span>
          </div>
          <Button size="sm" className="group-hover:bg-primary/90">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};