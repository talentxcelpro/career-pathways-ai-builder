
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ServiceFormProps {
  serviceId?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

interface ServiceData {
  title: string;
  professional_title: string;
  years_experience: string;
  location: string;
  description: string;
  whats_included: string[];
  client_requirements: string;
  delivery_time_days: number;
  price: number;
  currency: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url: string;
  phone_number: string;
  tags: string[];
  portfolio_files: string[];
}

const paymentMethodOptions = ['UPI', 'Bank Transfer', 'PayPal', 'Cash on Delivery', 'Cryptocurrency'];

export default function ServiceForm({ serviceId, onCancel, onSaved }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceData>({
    title: '',
    professional_title: '',
    years_experience: '',
    location: '',
    description: '',
    whats_included: [],
    client_requirements: '',
    delivery_time_days: 3,
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
  const [uploading, setUploading] = useState(false);
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
        setFormData(data);
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

  const handleInputChange = (field: keyof ServiceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: 'whats_included' | 'tags', value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const handleArrayRemove = (field: 'whats_included' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: checked
        ? [...prev.payment_methods, method]
        : prev.payment_methods.filter(m => m !== method)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('service-portfolios')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-portfolios')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        portfolio_files: [...prev.portfolio_files, ...uploadedUrls]
      }));

      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        provider_id: user?.id,
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {serviceId ? 'Edit Service' : 'Create New Service'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details for your professional service
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Professional Resume Review & Enhancement"
                  required
                />
              </div>
              <div>
                <Label htmlFor="professional_title">Your Professional Title *</Label>
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => handleInputChange('professional_title', e.target.value)}
                  placeholder="e.g., Senior HR Manager & Career Coach"
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
                  onChange={(e) => handleInputChange('years_experience', e.target.value)}
                  placeholder="e.g., 10+ Years"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
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
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Briefly explain what your service offers, your expertise, and who it's for..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>What's Included</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Add service feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('whats_included', newIncluded, setNewIncluded))}
                />
                <Button 
                  type="button" 
                  onClick={() => handleArrayAdd('whats_included', newIncluded, setNewIncluded)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.whats_included.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArrayRemove('whats_included', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="client_requirements">What You Need from Client *</Label>
              <Textarea
                id="client_requirements"
                value={formData.client_requirements}
                onChange={(e) => handleInputChange('client_requirements', e.target.value)}
                placeholder="e.g., Current Resume (PDF or Word), Target Job Titles"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="delivery_time_days">Delivery Time (Days) *</Label>
                <Input
                  id="delivery_time_days"
                  type="number"
                  min="1"
                  value={formData.delivery_time_days}
                  onChange={(e) => handleInputChange('delivery_time_days', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Payment & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payment Methods Accepted</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {paymentMethodOptions.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={formData.payment_methods.includes(method)}
                      onCheckedChange={(checked) => handlePaymentMethodChange(method, checked as boolean)}
                    />
                    <Label htmlFor={method} className="text-sm">{method}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Contact Options</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_email"
                    checked={formData.contact_email}
                    onCheckedChange={(checked) => handleInputChange('contact_email', checked)}
                  />
                  <Label htmlFor="contact_email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_phone"
                    checked={formData.contact_phone}
                    onCheckedChange={(checked) => handleInputChange('contact_phone', checked)}
                  />
                  <Label htmlFor="contact_phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_website"
                    checked={formData.contact_website}
                    onCheckedChange={(checked) => handleInputChange('contact_website', checked)}
                  />
                  <Label htmlFor="contact_website">Website</Label>
                </div>
              </div>
            </div>

            {formData.contact_phone && (
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
            )}

            {formData.contact_website && (
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags & Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Tags & Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Service Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add relevant tags"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('tags', newTag, setNewTag))}
                />
                <Button 
                  type="button" 
                  onClick={() => handleArrayAdd('tags', newTag, setNewTag)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <span className="text-sm">{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArrayRemove('tags', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Portfolio Files (Optional)</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-1">Uploading files...</p>
                )}
              </div>
              {formData.portfolio_files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {formData.portfolio_files.length} file(s) uploaded
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : serviceId ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}
