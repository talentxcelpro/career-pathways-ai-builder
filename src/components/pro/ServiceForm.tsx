
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";
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
    payment_methods: [],
    contact_email: false,
    contact_phone: false,
    contact_website: false,
    website_url: '',
    phone_number: '',
    tags: [],
    portfolio_files: []
  });

  const [newIncluded, setNewIncluded] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    if (!serviceId) return;
    
    setFetchingData(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;

      // Transform database data to form data structure
      setFormData({
        title: data.title || '',
        professional_title: data.professional_title || '',
        years_experience: data.years_experience || '',
        location: data.location || '',
        description: data.description || '',
        whats_included: data.what_included || [],
        client_requirements: data.client_requirements || '',
        delivery_time_days: data.delivery_time_days || 7,
        price: data.base_price || 0,
        currency: data.currency || 'INR',
        payment_methods: data.payment_methods || [],
        contact_email: data.contact_email || false,
        contact_phone: data.contact_phone || false,
        contact_website: data.contact_website || false,
        website_url: data.website_url || '',
        phone_number: data.phone_number || '',
        tags: data.tags || [],
        portfolio_files: data.portfolio_items || []
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Failed to load service data",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Transform form data to database structure
      const serviceData = {
        provider_id: user.id,
        title: formData.title,
        professional_title: formData.professional_title,
        years_experience: formData.years_experience,
        location: formData.location,
        description: formData.description,
        what_included: formData.whats_included,
        client_requirements: formData.client_requirements,
        delivery_time_days: formData.delivery_time_days,
        base_price: formData.price,
        currency: formData.currency,
        payment_methods: formData.payment_methods,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        contact_website: formData.contact_website,
        website_url: formData.website_url,
        phone_number: formData.phone_number,
        tags: formData.tags,
        portfolio_items: formData.portfolio_files,
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

  const addIncluded = () => {
    if (newIncluded.trim()) {
      setFormData(prev => ({
        ...prev,
        whats_included: [...prev.whats_included, newIncluded.trim()]
      }));
      setNewIncluded('');
    }
  };

  const removeIncluded = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whats_included: prev.whats_included.filter((_, i) => i !== index)
    }));
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

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading service data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            {serviceId ? 'Edit Service' : 'Create New Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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
                  placeholder="e.g., Senior HR Consultant"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Select value={formData.years_experience} onValueChange={(value) => setFormData(prev => ({ ...prev, years_experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="6-10 years">6-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Mumbai, India or Remote"
                />
              </div>
            </div>

            {/* Description */}
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

            {/* What's Included */}
            <div>
              <Label>What's Included</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Add what's included..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                />
                <Button type="button" onClick={addIncluded} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.whats_included.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeIncluded(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Client Requirements */}
            <div>
              <Label htmlFor="client_requirements">Client Requirements</Label>
              <Textarea
                id="client_requirements"
                value={formData.client_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, client_requirements: e.target.value }))}
                placeholder="What do you need from the client to get started?"
                rows={3}
              />
            </div>

            {/* Pricing and Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery_time">Delivery Time (Days) *</Label>
                <Input
                  id="delivery_time"
                  type="number"
                  value={formData.delivery_time_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) || 1 }))}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label>Accepted Payment Methods</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {['UPI', 'Bank Transfer', 'Credit Card', 'PayPal'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={formData.payment_methods.includes(method)}
                      onCheckedChange={() => togglePaymentMethod(method)}
                    />
                    <Label htmlFor={method} className="text-sm">{method}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <Label>Contact Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_email"
                    checked={formData.contact_email}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_email: !!checked }))}
                  />
                  <Label htmlFor="contact_email" className="text-sm">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_phone"
                    checked={formData.contact_phone}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_phone: !!checked }))}
                  />
                  <Label htmlFor="contact_phone" className="text-sm">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_website"
                    checked={formData.contact_website}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_website: !!checked }))}
                  />
                  <Label htmlFor="contact_website" className="text-sm">Website</Label>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {formData.contact_website && (
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://your-website.com"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (serviceId ? 'Update Service' : 'Create Service')}
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
