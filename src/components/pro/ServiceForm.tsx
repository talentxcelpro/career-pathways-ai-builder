
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const paymentMethodOptions = [
  'UPI', 'Bank Transfer', 'PayPal', 'Cash on Delivery', 'Credit Card', 'Razorpay'
];

const experienceOptions = [
  '1-2 Years', '3-5 Years', '6-10 Years', '10+ Years', '15+ Years'
];

export default function ServiceForm({ serviceId, onCancel, onSaved }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    professional_title: '',
    years_experience: '',
    location: '',
    description: '',
    whats_included: [],
    client_requirements: '',
    delivery_time_days: 1,
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

  const [newIncluded, setNewIncluded] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
          whats_included: data.whats_included || [],
          client_requirements: data.client_requirements,
          delivery_time_days: data.delivery_time_days,
          price: data.price,
          currency: data.currency,
          payment_methods: data.payment_methods || [],
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_website: data.contact_website,
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
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {serviceId ? 'Edit Service' : 'Create New Service'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Professional Resume Review & Enhancement"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Professional Title *</label>
              <Input
                value={formData.professional_title}
                onChange={(e) => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                placeholder="Senior HR Manager & Career Coach"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience *</label>
              <select
                value={formData.years_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                className="w-full p-2 border border-input rounded-md"
                required
              >
                <option value="">Select experience</option>
                {experienceOptions.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Mumbai, India"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your service, expertise, and what makes it unique..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">What's Included *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Resume Review"
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
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeIncluded(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Client Requirements *</label>
            <Textarea
              value={formData.client_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, client_requirements: e.target.value }))}
              placeholder="Current Resume (PDF or Word), Target Job Titles..."
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Time (Days) *</label>
              <Input
                type="number"
                min="1"
                value={formData.delivery_time_days}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Methods *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethodOptions.map(method => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={formData.payment_methods.includes(method)}
                    onCheckedChange={(checked) => handlePaymentMethodChange(method, checked as boolean)}
                  />
                  <label htmlFor={method} className="text-sm">{method}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Options</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_email"
                  checked={formData.contact_email}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_email: checked as boolean }))}
                />
                <label htmlFor="contact_email" className="text-sm">Enable Email Contact</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_phone"
                  checked={formData.contact_phone}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_phone: checked as boolean }))}
                />
                <label htmlFor="contact_phone" className="text-sm">Enable Phone Contact</label>
              </div>
              
              {formData.contact_phone && (
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Phone Number"
                />
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_website"
                  checked={formData.contact_website}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_website: checked as boolean }))}
                />
                <label htmlFor="contact_website" className="text-sm">Enable Website Contact</label>
              </div>
              
              {formData.contact_website && (
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="Website URL"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags / Keywords</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Resume Review"
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
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
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
