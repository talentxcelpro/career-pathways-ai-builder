import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, MapPin, Phone, Mail, Globe, MessageCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ServiceProfile {
  id: string;
  user_id: string;
  profile_slug: string;
  business_name?: string;
  bio?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  logo_url?: string;
  cover_image_url?: string;
  average_rating?: number;
  total_reviews?: number;
  response_time_hours?: number;
  is_verified?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  pricing_type?: string;
  base_price?: number;
  hourly_rate?: number;
  delivery_time_days?: number;
  is_active?: boolean;
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  type: string;
  external_url?: string;
  thumbnail_url?: string;
}

const PublicServiceProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Fetch profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from('pro_service_profiles')
        .select('*')
        .eq('profile_slug', username)
        .eq('is_active', true)
        .single();

      if (profileError) {
        toast({ title: 'Profile not found', description: 'The requested service profile does not exist.', variant: 'destructive' });
        return;
      }

      setProfile(profileData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('pro_services')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!servicesError) {
        setServices(servicesData || []);
      }

      // Fetch portfolio
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('pro_portfolios')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false });

      if (!portfoliosError) {
        setPortfolios(portfoliosData || []);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getPriceDisplay = (service: Service) => {
    if (service.pricing_type === 'contact') return 'Contact for Quote';
    if (service.pricing_type === 'hourly' && service.hourly_rate) return `₹${service.hourly_rate}/hour`;
    if (service.base_price) return `₹${service.base_price}`;
    return 'Price on request';
  };

  const handleBookService = (serviceId: string) => {
    // TODO: Implement booking functionality
    toast({ title: 'Booking', description: 'Booking functionality will be implemented soon.' });
  };

  const handleContactProvider = () => {
    // TODO: Implement contact functionality
    toast({ title: 'Contact', description: 'Contact functionality will be implemented soon.' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Cover Image */}
      {profile.cover_image_url && (
        <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.cover_image_url})` }}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.logo_url} alt={profile.business_name} />
                <AvatarFallback className="text-2xl">
                  {profile.business_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.business_name || 'Service Provider'}</h1>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="text-blue-600">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.response_time_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Responds in {profile.response_time_hours} hours
                    </div>
                  )}
                  {profile.average_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {profile.average_rating.toFixed(1)} ({profile.total_reviews} reviews)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleContactProvider}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                {profile.contact_phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${profile.contact_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Services ({services.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          <Badge variant="outline" className="mt-1">{service.category}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{getPriceDisplay(service)}</div>
                          {service.delivery_time_days && (
                            <div className="text-sm text-muted-foreground">
                              {service.delivery_time_days} days delivery
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => handleBookService(service.id)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                        <Button variant="outline" onClick={handleContactProvider}>
                          Get Quote
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            {portfolios.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolios.map((item) => (
                      <Card key={item.id} className="p-4">
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{item.type}</Badge>
                          {item.external_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.contact_email}`} className="text-sm hover:underline">
                      {profile.contact_email}
                    </a>
                  </div>
                )}
                {profile.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.contact_phone}`} className="text-sm hover:underline">
                      {profile.contact_phone}
                    </a>
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicServiceProfile;