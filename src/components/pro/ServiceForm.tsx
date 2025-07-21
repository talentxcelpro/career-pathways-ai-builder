
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

const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' }
];

const PAYMENT_METHOD_OPTIONS = [
  'UPI', 'Bank Transfer', 'PayPal', 'Cryptocurrency', 'Cash', 'Cheque'
];

export default function ServiceForm({ serviceId, onCancel, onSaved }: ServiceFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
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
      fetchServiceData(serviceId);
    }
  }, [serviceId]);

  const fetchServiceData = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('provider_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          professional_title: data.professional_title || '',
          years_experience: data.years_experience || '',
          location: data.location || '',
          description: data.description || '',
          whats_included: data.whats_included || [],
          client_requirements: data.client_requirements || '',
          delivery_time_days: data.delivery_time_days || 7,
          price: data.price || 0,
          currency: data.currency || 'INR',
          payment_methods: data.payment_methods || [],
          contact_email: data.contact_email ?? true,
          contact_phone: data.contact_phone ?? false,
          contact_website: data.contact_website ?? false,
          website_url: data.website_url || '',
          phone_number: data.phone_number || '',
          tags: data.tags || [],
          portfolio_files: data.portfolio_files || []
        });
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Failed to load service data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const addIncluded = () => {
    if (newIncluded.trim() && !formData.whats_included.includes(newIncluded.trim())) {
      setFormData(prev => ({
        ...prev,
        whats_included: [...prev.whats_included, newIncluded.trim()]
      }));
      setNewIncluded('');
    }
  };

  const removeIncluded = (item: string) => {
    setFormData(prev => ({
      ...prev,
      whats_included: prev.whats_included.filter(i => i !== item)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save services",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const serviceData = {
        provider_id: user.id,
        title: formData.title.trim(),
        professional_title: formData.professional_title.trim() || null,
        years_experience: formData.years_experience.trim() || null,
        location: formData.location.trim() || null,
        description: formData.description.trim(),
        whats_included: formData.whats_included,
        client_requirements: formData.client_requirements.trim() || null,
        delivery_time_days: formData.delivery_time_days,
        price: formData.price,
        currency: formData.currency,
        payment_methods: formData.payment_methods,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        contact_website: formData.contact_website,
        website_url: formData.website_url.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        tags: formData.tags,
        portfolio_files: formData.portfolio_files
      };

      let result;
      if (serviceId) {
        // Update existing service
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceId)
          .eq('provider_id', user.id);
      } else {
        // Create new service
        result = await supabase
          .from('services')
          .insert([serviceData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: serviceId ? "Service updated successfully" : "Service created successfully",
      });

      onSaved();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <CardTitle>{serviceId ? 'Update Service' : 'Create New Service'}</CardTitle>
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
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Professional Resume Writing"
                  required
                />
              </div>
              <div>
                <Label htmlFor="professional_title">Your Professional Title</Label>
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => handleInputChange('professional_title', e.target.value)}
                  placeholder="e.g., Senior UX Designer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', e.target.value)}
                  placeholder="e.g., 5+ years"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Mumbai, India"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                  placeholder="Add an item..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                />
                <Button type="button" onClick={addIncluded}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.whats_included.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeIncluded(item)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
                onChange={(e) => handleInputChange('client_requirements', e.target.value)}
                placeholder="What do you need from the client to get started?"
                rows={3}
              />
            </div>

            {/* Pricing & Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {CURRENCY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="delivery_time_days">Delivery Time (Days)</Label>
                <Input
                  id="delivery_time_days"
                  type="number"
                  value={formData.delivery_time_days}
                  onChange={(e) => handleInputChange('delivery_time_days', parseInt(e.target.value) || 7)}
                  placeholder="7"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label>Payment Methods</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {PAYMENT_METHOD_OPTIONS.map(method => (
                  <label key={method} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.payment_methods.includes(method)}
                      onChange={() => togglePaymentMethod(method)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Options */}
            <div>
              <Label>Contact Options</Label>
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <span>Email contact</span>
                  <Switch
                    checked={formData.contact_email}
                    onCheckedChange={(checked) => handleInputChange('contact_email', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Phone contact</span>
                    <Switch
                      checked={formData.contact_phone}
                      onCheckedChange={(checked) => handleInputChange('contact_phone', checked)}
                    />
                  </div>
                  {formData.contact_phone && (
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="Phone number"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Website contact</span>
                    <Switch
                      checked={formData.contact_website}
                      onCheckedChange={(checked) => handleInputChange('contact_website', checked)}
                    />
                  </div>
                  {formData.contact_website && (
                    <Input
                      value={formData.website_url}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      placeholder="Website URL"
                      type="url"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : (serviceId ? 'Update Service' : 'Create Service')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
