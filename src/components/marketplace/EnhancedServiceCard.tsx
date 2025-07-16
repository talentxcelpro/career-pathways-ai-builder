import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle,
  Shield,
  Heart,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { formatCompactCurrency } from "@/utils/currencyUtils";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    service_type: string;
    price_type: string;
    base_price: number;
    delivery_time_days: number;
    skills_offered: string[];
    rating: number;
    reviews_count: number;
    orders_completed: number;
    is_featured: boolean;
    is_verified?: boolean;
    provider_name: string;
    provider_location?: string;
    provider_response_time?: string;
    provider_avatar?: string;
    provider_badge?: string;
  };
  onFavorite?: (serviceId: string) => void;
  isFavorited?: boolean;
}

export default function EnhancedServiceCard({ service, onFavorite, isFavorited }: ServiceCardProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isCallbackDialogOpen, setIsCallbackDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    message: '',
    preferredDate: '',
    preferredTime: '',
    phone: '',
    email: ''
  });

  const handleBookNow = () => {
    toast.success(`Booking request sent for ${service.title}`);
    setIsBookingDialogOpen(false);
    setBookingForm({
      message: '',
      preferredDate: '',
      preferredTime: '',
      phone: '',
      email: ''
    });
  };

  const handleRequestCallback = () => {
    toast.success(`Callback request sent for ${service.title}`);
    setIsCallbackDialogOpen(false);
    setBookingForm({
      message: '',
      preferredDate: '',
      preferredTime: '',
      phone: '',
      email: ''
    });
  };

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(service.id);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'expert': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'verified': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/40 hover:border-border/60 relative overflow-hidden">
      {/* Featured Badge */}
      {service.is_featured && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 text-sm font-medium z-10">
          ⭐ Featured Service
        </div>
      )}

      {/* Provider Badge */}
      {service.provider_badge && (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getBadgeColor(service.provider_badge)} z-10`}>
          {service.provider_badge === 'expert' && <Award className="w-3 h-3 inline mr-1" />}
          {service.provider_badge === 'verified' && <CheckCircle className="w-3 h-3 inline mr-1" />}
          {service.provider_badge === 'premium' && <Shield className="w-3 h-3 inline mr-1" />}
          {service.provider_badge}
        </div>
      )}

      <CardHeader className={`pb-3 ${service.is_featured ? 'mt-6' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {service.service_type}
              </Badge>
              {service.is_verified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={service.provider_avatar} />
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{service.provider_name}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={`p-2 ${isFavorited ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {service.description}
        </p>

        {/* Rating and Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{service.rating}</span>
            <span className="text-muted-foreground">({service.reviews_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{service.orders_completed} completed</span>
          </div>
        </div>

        {/* Provider Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {service.provider_location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{service.provider_location}</span>
            </div>
          )}
          {service.provider_response_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{service.provider_response_time}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {service.skills_offered.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {service.skills_offered.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{service.skills_offered.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-bold text-lg">
                ₹{formatCompactCurrency(service.base_price)}
              </span>
              <span className="text-sm text-muted-foreground">
                {service.price_type === 'hourly' ? '/hour' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{service.delivery_time_days} days delivery</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Request Callback Dialog */}
            <Dialog open={isCallbackDialogOpen} onOpenChange={setIsCallbackDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Call Back
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Callback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-time">Preferred Time</Label>
                    <Input
                      id="preferred-time"
                      type="time"
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callback-message">Message (Optional)</Label>
                    <Textarea
                      id="callback-message"
                      placeholder="Brief description of your requirements"
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleRequestCallback} className="w-full">
                    Request Callback
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Book Now Dialog */}
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Book Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book {service.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-date">Preferred Date</Label>
                    <Input
                      id="preferred-date"
                      type="date"
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-time">Preferred Time</Label>
                    <Input
                      id="preferred-time"
                      type="time"
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-message">Project Details</Label>
                    <Textarea
                      id="booking-message"
                      placeholder="Describe your project requirements..."
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Total Cost:</span>
                    <span className="font-bold text-lg">₹{formatCompactCurrency(service.base_price)}</span>
                  </div>
                  <Button onClick={handleBookNow} className="w-full">
                    Confirm Booking
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}