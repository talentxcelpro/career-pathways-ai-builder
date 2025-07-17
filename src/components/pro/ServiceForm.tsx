
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceFormData } from "@/types/service";

interface ServiceFormProps {
  serviceId?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ServiceForm({ serviceId, onCancel, onSaved }: ServiceFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    professional_title: '',
    years_experience: '',
    location: '',
    description: '',
    whats_included: [],
    client_requirements: '',
    delivery_time_days: 7,
    price: 0,
    currency: 'INR',
    payment_methods: ['bank_transfer'],
    contact_email: true,
    contact_phone: false,
    contact_website: false,
    website_url: '',
    phone_number: '',
    tags: [],
    portfolio_files: []
  });

  const [newTag, setNewTag] = useState('');
  const [newIncluded, setNewIncluded] = useState('');

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    if (!serviceId) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          professional_title: data.professional_title,
          years_experience: data.years_experience,
          location: data.location,
          description: data.description,
          whats_included: data.whats_included,
          client_requirements: data.client_requirements,
          delivery_time_days: data.delivery_time_days,
          price: data.price,
          currency: data.currency,
          payment_methods: data.payment_methods,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_website: data.contact_website,
          website_url: data.website_url || '',
          phone_number: data.phone_number || '',
          tags: data.tags,
          portfolio_files: data.portfolio_files
        });
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Failed to load service data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        provider_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (serviceId) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceId);

        if (error) throw error;
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
      }

      onSaved();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addIncluded = () => {
    if (newIncluded.trim() && !formData.whats_included.includes(newIncluded.trim())) {
      setFormData(prev => ({
        ...prev,
        whats_included: [...prev.whats_included, newIncluded.trim()]
      }));
      setNewIncluded('');
    }
  };

  const removeIncluded = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      whats_included: prev.whats_included.filter(item => item !== itemToRemove)
    }));
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {serviceId ? 'Edit Service' : 'Create New Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Professional Resume Writing"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="professional_title">Your Professional Title *</Label>
                  <Input
                    id="professional_title"
                    value={formData.professional_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                    placeholder="e.g., Career Coach, HR Consultant"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_experience">Years of Experience *</Label>
                  <Input
                    id="years_experience"
                    value={formData.years_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                    placeholder="e.g., 5+ years, 10-15 years"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Mumbai, India"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Service Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your service in detail..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What's Included</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Add what's included in your service"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                />
                <Button type="button" onClick={addIncluded}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.whats_included.map((item) => (
                  <Badge key={item} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeIncluded(item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Requirements and Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements & Pricing</h3>
              
              <div>
                <Label htmlFor="client_requirements">Client Requirements</Label>
                <Textarea
                  id="client_requirements"
                  value={formData.client_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_requirements: e.target.value }))}
                  placeholder="What do you need from the client to deliver this service?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    disabled
                  />
                </div>
                
                <div>
                  <Label htmlFor="delivery_time">Delivery Time (Days) *</Label>
                  <Input
                    id="delivery_time"
                    type="number"
                    value={formData.delivery_time_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: Number(e.target.value) }))}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact_email">Allow Email Contact</Label>
                  <Switch
                    id="contact_email"
                    checked={formData.contact_email}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_email: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact_phone">Allow Phone Contact</Label>
                  <Switch
                    id="contact_phone"
                    checked={formData.contact_phone}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_phone: checked }))}
                  />
                </div>
                
                {formData.contact_phone && (
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="contact_website">Allow Website Contact</Label>
                  <Switch
                    id="contact_website"
                    checked={formData.contact_website}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_website: checked }))}
                  />
                </div>
                
                {formData.contact_website && (
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags (e.g., resume, career, coaching)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : serviceId ? 'Update Service' : 'Create Service'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
