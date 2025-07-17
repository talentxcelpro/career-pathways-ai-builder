
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ServiceFormData } from "@/types/service";

interface ServiceFormProps {
  serviceId?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function ServiceForm({ serviceId, onSaved, onCancel }: ServiceFormProps) {
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
  
  const [loading, setLoading] = useState(false);
  const [newIncluded, setNewIncluded] = useState('');
  const [newTag, setNewTag] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
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
          professional_title: data.professional_title || '',
          years_experience: data.years_experience || '',
          location: data.location || '',
          description: data.description,
          whats_included: data.whats_included || [],
          client_requirements: data.client_requirements || '',
          delivery_time_days: data.delivery_time_days,
          price: data.price,
          currency: data.currency,
          payment_methods: data.payment_methods || [],
          contact_email: data.contact_email || false,
          contact_phone: data.contact_phone || false,
          contact_website: data.contact_website || false,
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const serviceData = {
        provider_id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (serviceId) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: serviceId ? "Service updated successfully" : "Service created successfully",
      });

      onSaved?.();
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

  const addIncludedItem = () => {
    if (newIncluded.trim()) {
      setFormData(prev => ({
        ...prev,
        whats_included: [...prev.whats_included, newIncluded.trim()]
      }));
      setNewIncluded('');
    }
  };

  const removeIncludedItem = (index: number) => {
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

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{serviceId ? 'Edit Service' : 'Create New Service'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Custom Website Development"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_title">Your Professional Title *</Label>
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                  placeholder="e.g., Full Stack Developer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience *</Label>
                <Select
                  value={formData.years_experience}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, years_experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-3">2-3 years</SelectItem>
                    <SelectItem value="4-5">4-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your service in detail..."
                className="min-h-32"
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludedItem())}
              />
              <Button type="button" onClick={addIncludedItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.whats_included.map((item, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeIncludedItem(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Pricing & Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing & Delivery</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="10000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
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

              <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="client_requirements">Client Requirements</Label>
              <Textarea
                id="client_requirements"
                value={formData.client_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, client_requirements: e.target.value }))}
                placeholder="What do you need from the client to get started?"
              />
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Options</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_email"
                  checked={formData.contact_email}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_email: !!checked }))}
                />
                <Label htmlFor="contact_email">Allow contact via email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_phone"
                  checked={formData.contact_phone}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_phone: !!checked }))}
                />
                <Label htmlFor="contact_phone">Allow contact via phone</Label>
              </div>

              {formData.contact_phone && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_website"
                  checked={formData.contact_website}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_website: !!checked }))}
                />
                <Label htmlFor="contact_website">Allow contact via website</Label>
              </div>

              {formData.contact_website && (
                <div className="space-y-2 ml-6">
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
                placeholder="Add tags (skills, technologies, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
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
          <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : serviceId ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
