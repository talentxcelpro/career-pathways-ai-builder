import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Shield, 
  Trophy,
  Zap,
  Heart,
  Play,
  Users,
  IndianRupee,
  Calendar,
  RefreshCcw,
  Phone,
  Video,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  delivery_days: number;
  revisions_included?: number;
  popular?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;
  delivery_time_days: number;
  rating: number;
  reviews_count: number;
  orders_completed: number;
  is_featured: boolean;
  is_verified: boolean;
  provider_name: string;
  provider_location: string;
  provider_response_time: string;
  provider_avatar: string;
  provider_badge?: string;
  packages?: ServicePackage[];
  trust_signals?: string[];
  success_stories?: number;
  video_preview?: string;
}

interface ServiceDetailDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookService: (service: Service, packageType?: string) => Promise<void>;
}

export const ServiceDetailDialog: React.FC<ServiceDetailDialogProps> = ({
  service,
  open,
  onOpenChange,
  onBookService
}) => {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service?.packages) {
      setSelectedPackage(service.packages.find(p => p.popular) || service.packages[0]);
    }
  }, [service]);

  if (!service) return null;

  const handleBookNow = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    try {
      await onBookService(service, selectedPackage.name);
      onOpenChange(false);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = () => {
    toast.info("Messaging feature coming soon!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{service.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-blue-200">
                    <AvatarImage src={service.provider_avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold">
                      {service.provider_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-gray-900">{service.provider_name}</h3>
                      {service.is_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {service.provider_badge && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          {service.provider_badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">{service.rating.toFixed(1)}</span>
                        <span className="ml-1">({service.reviews_count} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-blue-500 mr-1" />
                        <span>Responds in {service.provider_response_time}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-purple-500 mr-1" />
                        <span>{service.orders_completed} orders completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleContactProvider}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-500" />
                  About This Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
                
                {/* Trust Signals */}
                {service.trust_signals && service.trust_signals.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.trust_signals.map((signal, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {signal}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Preview */}
            {service.video_preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="w-5 h-5 mr-2 text-red-500" />
                    Service Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Button variant="ghost" size="lg">
                      <Play className="w-8 h-8 mr-2" />
                      Watch Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Special Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="requirements">Tell the provider about your specific needs</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe any special requirements, preferences, or additional details for your project..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Package Selection */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-center">Choose Your Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Package Selection */}
                {service.packages && service.packages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedPackage?.id === pkg.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{pkg.name}</h4>
                          {pkg.popular && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-baseline mb-3">
                          <IndianRupee className="w-4 h-4 text-gray-600 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{pkg.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{pkg.delivery_days} day delivery</span>
                          </div>
                          {pkg.revisions_included && (
                            <div className="flex items-center text-gray-600">
                              <RefreshCcw className="w-4 h-4 mr-2" />
                              <span>{pkg.revisions_included === -1 ? 'Unlimited' : pkg.revisions_included} revisions</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 space-y-1">
                          {pkg.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {pkg.features.length > 3 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{pkg.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Book Now Button */}
                <Button 
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleBookNow}
                  disabled={loading || !selectedPackage}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      Book Now - ₹{selectedPackage?.price.toLocaleString()}
                    </>
                  )}
                </Button>

                {/* Additional Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            {service.success_stories && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{service.success_stories}+</div>
                  <div className="text-sm text-gray-600">Successful Projects</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};