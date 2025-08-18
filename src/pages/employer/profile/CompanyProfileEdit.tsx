
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowLeft, Save, Upload, X, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import CompanyImageUpload from '@/components/company/CompanyImageUpload';

const CompanyProfileEdit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: '',
    employee_count_range: '',
    founded_year: '',
    logo_url: '',
    cover_image_url: '',
    benefits: [] as string[],
    tech_stack: [] as string[],
    culture_description: '',
    social_links: {}
  });

  const [newBenefit, setNewBenefit] = useState('');
  const [newTech, setNewTech] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  // Fetch current user's company
  const { data: company, isLoading } = useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // First check if user has a company through company_profiles (get the most recent one)
      const { data: profile } = await supabase
        .from('company_profiles')
        .select('company_id, companies(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profile?.companies) {
        return profile.companies;
      }

      // If not owner, check if they're a team member with admin/owner role (get the most recent one)
      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('company_id, companies(*)')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (teamMember?.companies) {
        return teamMember.companies;
      }

      // Return null if no company found (don't throw error)
      return null;
    },
    enabled: !!user?.id
  });

  // Update form data when company data is loaded
  useEffect(() => {
    if (company) {
      const companyData = company as any;
      setFormData({
        name: companyData.name || '',
        description: companyData.description || '',
        website: companyData.website || '',
        industry: companyData.industry || '',
        location: companyData.location || '',
        employee_count_range: companyData.employee_count_range || '',
        founded_year: companyData.founded_year?.toString() || '',
        logo_url: companyData.logo_url || '',
        cover_image_url: companyData.cover_image_url || '',
        benefits: companyData.benefits || [],
        tech_stack: companyData.tech_stack || [],
        culture_description: companyData.culture_description || '',
        social_links: companyData.social_links || {}
      });
    }
  }, [company]);

  // Create new company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const companyData = {
        ...data,
        founded_year: data.founded_year ? parseInt(data.founded_year) : null,
        created_by: user.id,
        is_verified: false
      };

      // Create the company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (companyError) throw companyError;

      // Create company profile linking user as owner
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          company_id: newCompany.id,
          owner_id: user.id
        });

      if (profileError) throw profileError;

      // Update user's employer status
      const { error: userError } = await supabase
        .from('profiles')
        .update({
          is_employer: true,
          employer_status: 'approved'
        })
        .eq('id', user.id);

      if (userError) throw userError;

      return newCompany;
    },
    onSuccess: () => {
      toast.success('Company created successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-company'] });
      setIsCreatingCompany(false);
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create company');
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!(company as any)?.id) throw new Error('No company ID');

      const updateData = {
        ...data,
        founded_year: data.founded_year ? parseInt(data.founded_year) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', (company as any).id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Company profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-company'] });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update company profile');
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        benefits: [...prev.benefits, newBenefit.trim()] 
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const addTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tech_stack: [...prev.tech_stack, newTech.trim()] 
      }));
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (company) {
      updateCompanyMutation.mutate(formData);
    } else {
      createCompanyMutation.mutate(formData);
    }
  };

  const handleCreateCompany = () => {
    setIsCreatingCompany(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Show create company option if no company exists
  if (!company && !isCreatingCompany) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" onClick={() => navigate('/employer')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-gray-600">Set up your company profile</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Create Your Company Profile</h3>
            <p className="text-gray-500 mb-6">Set up your company profile to start posting jobs and managing your team.</p>
            <Button onClick={handleCreateCompany} className="mb-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Company Profile
            </Button>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/employer')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {company ? 'Edit Company Profile' : 'Create Company Profile'}
          </h1>
          <p className="text-gray-600">
            {company ? 'Update your company information' : 'Set up your company profile'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              {company ? 'Update your company\'s basic details' : 'Enter your company\'s basic details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Company Name" 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your company..." 
                rows={4} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.com" 
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State, Country" 
                />
              </div>
              
              <div>
                <Label htmlFor="employee_count">Employee Count</Label>
                <Select value={formData.employee_count_range} onValueChange={(value) => handleInputChange('employee_count_range', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input 
                id="founded_year" 
                type="number"
                value={formData.founded_year}
                onChange={(e) => handleInputChange('founded_year', e.target.value)}
                placeholder="2020" 
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Images */}
        <CompanyImageUpload
          logoUrl={formData.logo_url}
          bannerUrl={formData.cover_image_url}
          onLogoUpload={(url) => handleInputChange('logo_url', url)}
          onBannerUpload={(url) => handleInputChange('cover_image_url', url)}
          companyName={formData.name}
        />

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits & Perks</CardTitle>
            <CardDescription>Add benefits offered by your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a benefit"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit) => (
                <Badge key={benefit} variant="secondary" className="px-3 py-1">
                  {benefit}
                  <button
                    type="button"
                    onClick={() => removeBenefit(benefit)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>Technologies used at your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a technology"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              />
              <Button type="button" onClick={addTech}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map((tech) => (
                <Badge key={tech} variant="outline" className="px-3 py-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Culture */}
        <Card>
          <CardHeader>
            <CardTitle>Company Culture</CardTitle>
            <CardDescription>Describe your company culture and work environment</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={formData.culture_description}
              onChange={(e) => handleInputChange('culture_description', e.target.value)}
              placeholder="Describe your company culture, values, and work environment..." 
              rows={4} 
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/employer/profile')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateCompanyMutation.isPending || createCompanyMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {(updateCompanyMutation.isPending || createCompanyMutation.isPending) ? 'Saving...' : company ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileEdit;
