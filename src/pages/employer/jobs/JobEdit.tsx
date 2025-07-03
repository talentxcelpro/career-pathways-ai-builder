
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const JobEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Job>>({});

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<Job>) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      navigate('/jobs/manage');
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error('Error updating job:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof Job, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
        <Button onClick={() => navigate('/jobs/manage')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/jobs/manage')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Edit className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Post</h1>
          <p className="text-gray-600">Update your job posting details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Edit your job posting details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input 
                id="title" 
                value={formData.title || ''} 
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description" 
                rows={8} 
                value={formData.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location || ''} 
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select 
                  value={formData.employment_type || ''} 
                  onValueChange={(value) => handleInputChange('employment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select 
                  value={formData.experience_level || ''} 
                  onValueChange={(value) => handleInputChange('experience_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_remote"
                  checked={formData.is_remote || false}
                  onChange={(e) => handleInputChange('is_remote', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_remote">Remote Work Available</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_min">Minimum Salary (₹)</Label>
                <Input 
                  id="salary_min" 
                  type="number"
                  value={formData.salary_min || ''} 
                  onChange={(e) => handleInputChange('salary_min', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="salary_max">Maximum Salary (₹)</Label>
                <Input 
                  id="salary_max" 
                  type="number"
                  value={formData.salary_max || ''} 
                  onChange={(e) => handleInputChange('salary_max', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active !== false}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active">Job is Active</Label>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/jobs/manage')}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobEdit;
