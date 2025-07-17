
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { ServiceFormData } from "@/types/service";

interface ServiceFormProps {
  serviceId?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
];

const paymentMethods = [
  'PayPal',
  'Bank Transfer',
  'Credit Card',
  'Cryptocurrency',
  'Cash',
  'UPI',
  'Razorpay',
  'Stripe'
];

export default function ServiceForm({ serviceId, onCancel, onSaved }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(['']);
  const [portfolioFiles, setPortfolioFiles] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const { user } = useAuth();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    defaultValues: {
      title: '',
      professional_title: '',
      years_experience: '',
      location: '',
      description: '',
      whats_included: [''],
      client_requirements: '',
      delivery_time_days: 7,
      price: 0,
      currency: 'USD',
      payment_methods: [],
      contact_email: true,
      contact_phone: false,
      contact_website: false,
      website_url: '',
      phone_number: '',
      tags: [],
      portfolio_files: []
    }
  });

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
        setValue('title', data.title);
        setValue('professional_title', data.professional_title || '');
        setValue('years_experience', data.years_experience || '');
        setValue('location', data.location || '');
        setValue('description', data.description);
        setValue('client_requirements', data.client_requirements || '');
        setValue('delivery_time_days', data.delivery_time_days);
        setValue('price', data.price);
        setValue('currency', data.currency);
        setValue('contact_email', data.contact_email);
        setValue('contact_phone', data.contact_phone);
        setValue('contact_website', data.contact_website);
        setValue('website_url', data.website_url || '');
        setValue('phone_number', data.phone_number || '');
        
        setWhatsIncluded(data.whats_included || ['']);
        setTags(data.tags || []);
        setPortfolioFiles(data.portfolio_files || []);
        setSelectedPaymentMethods(data.payment_methods || []);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const serviceData = {
        provider_id: user.id,
        title: data.title,
        professional_title: data.professional_title,
        years_experience: data.years_experience,
        location: data.location,
        description: data.description,
        whats_included: whatsIncluded.filter(item => item.trim() !== ''),
        client_requirements: data.client_requirements,
        delivery_time_days: data.delivery_time_days,
        price: data.price,
        currency: data.currency,
        payment_methods: selectedPaymentMethods,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        contact_website: data.contact_website,
        website_url: data.website_url,
        phone_number: data.phone_number,
        tags: tags,
        portfolio_files: portfolioFiles,
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
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addWhatsIncluded = () => {
    setWhatsIncluded([...whatsIncluded, '']);
  };

  const updateWhatsIncluded = (index: number, value: string) => {
    const updated = [...whatsIncluded];
    updated[index] = value;
    setWhatsIncluded(updated);
  };

  const removeWhatsIncluded = (index: number) => {
    if (whatsIncluded.length > 1) {
      setWhatsIncluded(whatsIncluded.filter((_, i) => i !== index));
    }
  };

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{serviceId ? 'Edit Service' : 'Create New Service'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Service title is required' })}
                placeholder="e.g., Professional Resume Writing"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_title">Your Professional Title</Label>
              <Input
                id="professional_title"
                {...register('professional_title')}
                placeholder="e.g., Senior HR Consultant"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                {...register('years_experience')}
                placeholder="e.g., 5+ years"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Service description is required' })}
              rows={4}
              placeholder="Describe your service in detail..."
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* What's Included */}
          <div className="space-y-2">
            <Label>What's Included *</Label>
            <div className="space-y-2">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateWhatsIncluded(index, e.target.value)}
                    placeholder="e.g., Professional formatting"
                  />
                  {whatsIncluded.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWhatsIncluded(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWhatsIncluded}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_requirements">Client Requirements</Label>
            <Textarea
              id="client_requirements"
              {...register('client_requirements')}
              rows={3}
              placeholder="What do you need from clients to get started?"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { required: 'Price is required', min: 0 })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={watch('currency')} onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_time_days">Delivery Time (Days)</Label>
              <Input
                id="delivery_time_days"
                type="number"
                {...register('delivery_time_days', { required: 'Delivery time is required', min: 1 })}
                placeholder="7"
              />
              {errors.delivery_time_days && <p className="text-sm text-red-500">{errors.delivery_time_days.message}</p>}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Payment Methods</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {paymentMethods.map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={selectedPaymentMethods.includes(method)}
                    onCheckedChange={() => togglePaymentMethod(method)}
                  />
                  <Label htmlFor={method} className="text-sm">
                    {method}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-4">
            <Label>Contact Preferences</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_email"
                  {...register('contact_email')}
                />
                <Label htmlFor="contact_email">Email Contact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_phone"
                  {...register('contact_phone')}
                />
                <Label htmlFor="contact_phone">Phone Contact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_website"
                  {...register('contact_website')}
                />
                <Label htmlFor="contact_website">Website Contact</Label>
              </div>
            </div>

            {watch('contact_website') && (
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  {...register('website_url')}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            )}

            {watch('contact_phone') && (
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  {...register('phone_number')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : serviceId ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
