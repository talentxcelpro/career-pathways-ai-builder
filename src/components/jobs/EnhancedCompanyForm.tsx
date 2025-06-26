
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Sparkles, Globe, MapPin, Users, Calendar, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  founded_year?: number;
  employee_count_range?: string;
}

interface EnhancedCompanyFormProps {
  value: string;
  onValueChange: (companyId: string) => void;
  onCompanyCreate?: (company: Company) => void;
}

export default function EnhancedCompanyForm({ value, onValueChange, onCompanyCreate }: EnhancedCompanyFormProps) {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    founded_year: '',
    employee_count_range: ''
  });

  const queryClient = useQueryClient();

  // Fetch companies with search
  const { data: companies = [] } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Get selected company
  const selectedCompany = companies.find(company => company.id === value);

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let logoUrl = '';
      
      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          logo_url: logoUrl || null,
          created_by: user.id,
          founded_year: companyData.founded_year ? parseInt(companyData.founded_year) : null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Company created successfully!');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onValueChange(data.id);
      onCompanyCreate?.(data);
      setMode('select');
      // Reset form
      setNewCompany({
        name: '',
        description: '',
        website: '',
        location: '',
        industry: '',
        founded_year: '',
        employee_count_range: ''
      });
      setLogoFile(null);
      setLogoPreview('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create company');
    }
  });

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate AI description
  const generateDescription = async () => {
    if (!newCompany.name) {
      toast.error('Please enter a company name first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      // Simple AI description generation (you can enhance this with actual AI API)
      const description = `${newCompany.name} is a forward-thinking company committed to innovation and excellence. We provide cutting-edge solutions and foster a collaborative work environment where talented professionals can grow and make a meaningful impact.`;
      
      setNewCompany(prev => ({ ...prev, description }));
      toast.success('Description generated successfully!');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Handle company selection from suggestions
  const handleCompanySelect = (company: Company) => {
    onValueChange(company.id);
    setSearchTerm(company.name);
    setShowSuggestions(false);
  };

  // Auto-fill when searching matches existing company
  useEffect(() => {
    if (searchTerm && companies.length > 0) {
      const exactMatch = companies.find(c => 
        c.name.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactMatch && value !== exactMatch.id) {
        onValueChange(exactMatch.id);
      }
    }
  }, [searchTerm, companies, value, onValueChange]);

  if (mode === 'create') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create New Company</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMode('select')}
            >
              Back to Selection
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Name */}
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={newCompany.name}
              onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Company Logo</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={logoPreview} alt="Company logo preview" />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB • JPG, PNG, WebP, SVG
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description with AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="company-description">Company Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGeneratingDescription || !newCompany.name}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="company-description"
              placeholder="Tell candidates about your company's mission, values, and culture"
              value={newCompany.description}
              onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              type="url"
              placeholder="https://company.com"
              value={newCompany.website}
              onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="company-location">Location</Label>
            <Input
              id="company-location"
              placeholder="e.g., Bengaluru, India"
              value={newCompany.location}
              onChange={(e) => setNewCompany(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Industry and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                placeholder="e.g., Technology, Finance"
                value={newCompany.industry}
                onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="founded-year">Founded Year</Label>
              <Input
                id="founded-year"
                type="number"
                placeholder="2020"
                value={newCompany.founded_year}
                onChange={(e) => setNewCompany(prev => ({ ...prev, founded_year: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="employee-count">Company Size</Label>
            <Select
              value={newCompany.employee_count_range}
              onValueChange={(value) => setNewCompany(prev => ({ ...prev, employee_count_range: value }))}
            >
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

          <Button
            onClick={() => createCompanyMutation.mutate(newCompany)}
            disabled={!newCompany.name.trim() || createCompanyMutation.isPending}
            className="w-full"
          >
            {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Search/Select */}
        <div className="relative">
          <Label htmlFor="company-search">Company Name *</Label>
          <div className="flex space-x-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="company-search"
                placeholder="Search for your company or create new"
                value={selectedCompany ? selectedCompany.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) {
                    onValueChange('');
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {companies.length > 0 ? (
                    <>
                      {companies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCompanySelect(company)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={company.logo_url} alt={company.name} />
                            <AvatarFallback>
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.location && (
                              <p className="text-xs text-gray-500">{company.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-200">
                        <button
                          onClick={() => {
                            setNewCompany(prev => ({ ...prev, name: searchTerm }));
                            setMode('create');
                            setShowSuggestions(false);
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 text-blue-600 font-medium"
                        >
                          + Create "{searchTerm}" as new company
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-gray-500 mb-2">No companies found</p>
                      <button
                        onClick={() => {
                          setNewCompany(prev => ({ ...prev, name: searchTerm }));
                          setMode('create');
                          setShowSuggestions(false);
                        }}
                        className="w-full p-2 text-left hover:bg-gray-50 text-blue-600 font-medium rounded"
                      >
                        + Create "{searchTerm}" as new company
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode('create')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              New Company
            </Button>
          </div>
        </div>

        {/* Selected Company Preview */}
        {selectedCompany && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCompany.logo_url} alt={selectedCompany.name} />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{selectedCompany.name}</h3>
                  {selectedCompany.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{selectedCompany.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.industry && (
                      <Badge variant="secondary">
                        <Building2 className="h-3 w-3 mr-1" />
                        {selectedCompany.industry}
                      </Badge>
                    )}
                    {selectedCompany.location && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedCompany.location}
                      </Badge>
                    )}
                    {selectedCompany.employee_count_range && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {selectedCompany.employee_count_range}
                      </Badge>
                    )}
                    {selectedCompany.founded_year && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Founded {selectedCompany.founded_year}
                      </Badge>
                    )}
                  </div>
                  
                  {selectedCompany.website && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={selectedCompany.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {selectedCompany.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Click outside to close suggestions */}
        {showSuggestions && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
