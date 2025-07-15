import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  created_at: string;
  profile_id: string;
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  type: string;
  external_url?: string;
  created_at: string;
  profile_id: string;
}

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const { toast } = useToast();

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: '',
    pricing_type: 'fixed',
    base_price: '',
    hourly_rate: '',
    delivery_time_days: '',
    is_active: true
  });

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    type: 'image',
    external_url: ''
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First, get or create the pro service profile
    const { data: profile, error: profileError } = await supabase
      .from('pro_service_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      toast({ title: 'Error', description: 'Failed to access profile', variant: 'destructive' });
      return;
    }

    let currentProfileId = profile?.id;

    // Create profile if it doesn't exist
    if (!profile) {
      const profileSlug = `user-${user.id.slice(0, 8)}-${Date.now()}`;
      const { data: newProfile, error: createError } = await supabase
        .from('pro_service_profiles')
        .insert([{ 
          user_id: user.id,
          profile_slug: profileSlug,
          subscription_tier: 'pro_starter',
          is_active: true
        }])
        .select('id')
        .single();

      if (createError) {
        toast({ title: 'Error', description: 'Failed to create profile', variant: 'destructive' });
        return;
      }
      currentProfileId = newProfile.id;
    }

    setProfileId(currentProfileId);
    await fetchServices(currentProfileId);
    await fetchPortfolios(currentProfileId);
  };

  const fetchServices = async (profileId: string) => {
    const { data, error } = await supabase
      .from('pro_services')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching services', description: error.message, variant: 'destructive' });
    } else {
      setServices(data || []);
    }
  };

  const fetchPortfolios = async (profileId: string) => {
    const { data, error } = await supabase
      .from('pro_portfolios')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching portfolio', description: error.message, variant: 'destructive' });
    } else {
      setPortfolios(data || []);
    }
    setLoading(false);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    if (services.length >= 15 && !editingService) {
      toast({ 
        title: 'Service limit reached', 
        description: 'You can only create up to 15 services per profile.',
        variant: 'destructive' 
      });
      return;
    }

    const serviceData = {
      title: serviceForm.title,
      description: serviceForm.description,
      category: serviceForm.category,
      pricing_type: serviceForm.pricing_type,
      base_price: serviceForm.base_price ? parseFloat(serviceForm.base_price) : null,
      hourly_rate: serviceForm.hourly_rate ? parseFloat(serviceForm.hourly_rate) : null,
      delivery_time_days: serviceForm.delivery_time_days ? parseInt(serviceForm.delivery_time_days) : null,
      is_active: serviceForm.is_active,
      profile_id: profileId
    };

    let error;
    if (editingService) {
      ({ error } = await supabase
        .from('pro_services')
        .update(serviceData)
        .eq('id', editingService.id));
    } else {
      ({ error } = await supabase
        .from('pro_services')
        .insert([serviceData]));
    }

    if (error) {
      toast({ title: 'Error saving service', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Service ${editingService ? 'updated' : 'created'} successfully` });
      setShowServiceDialog(false);
      setEditingService(null);
      setServiceForm({
        title: '',
        description: '',
        category: '',
        pricing_type: 'fixed',
        base_price: '',
        hourly_rate: '',
        delivery_time_days: '',
        is_active: true
      });
      if (profileId) fetchServices(profileId);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    const portfolioData = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      type: portfolioForm.type,
      external_url: portfolioForm.external_url,
      profile_id: profileId
    };

    const { error } = await supabase
      .from('pro_portfolios')
      .insert([portfolioData]);

    if (error) {
      toast({ title: 'Error adding portfolio item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Portfolio item added successfully' });
      setShowPortfolioDialog(false);
      setPortfolioForm({
        title: '',
        description: '',
        type: 'image',
        external_url: ''
      });
      if (profileId) fetchPortfolios(profileId);
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('pro_services')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting service', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Service deleted successfully' });
      if (profileId) fetchServices(profileId);
    }
  };

  const deletePortfolio = async (id: string) => {
    const { error } = await supabase
      .from('pro_portfolios')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting portfolio item', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Portfolio item deleted successfully' });
      if (profileId) fetchPortfolios(profileId);
    }
  };

  const getPriceDisplay = (service: Service) => {
    if (service.pricing_type === 'contact') return 'Contact for Quote';
    if (service.pricing_type === 'hourly' && service.hourly_rate) return `₹${service.hourly_rate}/hour`;
    if (service.base_price) return `₹${service.base_price}`;
    return 'Price not set';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Services Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Services ({services.length}/15)</CardTitle>
          <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
            <DialogTrigger asChild>
              <Button disabled={services.length >= 15}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Service Title</Label>
                    <Input
                      id="title"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={serviceForm.category}
                      onValueChange={(value) => setServiceForm({...serviceForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pricing_type">Pricing Type</Label>
                    <Select
                      value={serviceForm.pricing_type}
                      onValueChange={(value) => setServiceForm({...serviceForm, pricing_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="package">Package Deal</SelectItem>
                        <SelectItem value="contact">Contact for Quote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {serviceForm.pricing_type === 'fixed' && (
                    <div>
                      <Label htmlFor="base_price">Base Price (₹)</Label>
                      <Input
                        id="base_price"
                        type="number"
                        value={serviceForm.base_price}
                        onChange={(e) => setServiceForm({...serviceForm, base_price: e.target.value})}
                      />
                    </div>
                  )}

                  {serviceForm.pricing_type === 'hourly' && (
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={serviceForm.hourly_rate}
                        onChange={(e) => setServiceForm({...serviceForm, hourly_rate: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="delivery_time_days">Delivery Time (Days)</Label>
                    <Input
                      id="delivery_time_days"
                      type="number"
                      value={serviceForm.delivery_time_days}
                      onChange={(e) => setServiceForm({...serviceForm, delivery_time_days: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowServiceDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Update' : 'Create'} Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{service.title}</h3>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{getPriceDisplay(service)}</span>
                      {service.delivery_time_days && (
                        <span>{service.delivery_time_days} days delivery</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingService(service);
                        setServiceForm({
                          title: service.title,
                          description: service.description,
                          category: service.category,
                          pricing_type: service.pricing_type || 'fixed',
                          base_price: service.base_price?.toString() || '',
                          hourly_rate: service.hourly_rate?.toString() || '',
                          delivery_time_days: service.delivery_time_days?.toString() || '',
                          is_active: service.is_active || true
                        });
                        setShowServiceDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Portfolio ({portfolios.length})</CardTitle>
          <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="portfolio-title">Title</Label>
                  <Input
                    id="portfolio-title"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="portfolio-description">Description</Label>
                  <Textarea
                    id="portfolio-description"
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={portfolioForm.type}
                    onValueChange={(value) => setPortfolioForm({...portfolioForm, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="external-url">URL</Label>
                  <Input
                    id="external-url"
                    type="url"
                    value={portfolioForm.external_url}
                    onChange={(e) => setPortfolioForm({...portfolioForm, external_url: e.target.value})}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowPortfolioDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Item</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePortfolio(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.type}</Badge>
                  {item.external_url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManagement;