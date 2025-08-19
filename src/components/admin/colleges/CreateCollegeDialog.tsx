import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { useCollegesManagement } from '@/hooks/useCollegesManagement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateCollegeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCollegeDialog: React.FC<CreateCollegeDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createCollege } = useCollegesManagement();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createCollege.mutateAsync({
        college_name: data.college_name,
        college_code: data.college_code,
        college_type: data.college_type,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pincode: data.pincode,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        website_url: data.website_url,
        description: data.description,
        vision: data.vision,
        mission: data.mission,
        established_year: data.established_year ? parseInt(data.established_year) : null,
        student_count: data.student_count ? parseInt(data.student_count) : 0,
        faculty_count: data.faculty_count ? parseInt(data.faculty_count) : 0,
        logo_url: data.logo_url,
        banner_image_url: data.banner_image_url
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create college:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New College</DialogTitle>
          <DialogDescription>
            Add a new college to the TalentXcel directory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="college_name">College Name *</Label>
                <Input
                  id="college_name"
                  {...register('college_name', { required: true })}
                  placeholder="Indian Institute of Technology Delhi"
                />
              </div>
              <div>
                <Label htmlFor="college_code">College Code</Label>
                <Input
                  id="college_code"
                  {...register('college_code')}
                  placeholder="IITD"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="college_type">College Type *</Label>
                <Select onValueChange={(value) => setValue('college_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="autonomous">Autonomous</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="deemed">Deemed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="established_year">Established Year</Label>
                <Input
                  id="established_year"
                  type="number"
                  {...register('established_year')}
                  placeholder="1961"
                  min="1800"
                  max="2024"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  {...register('website_url')}
                  placeholder="https://www.iitd.ac.in"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description about the college"
                rows={3}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Details</h3>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                {...register('address', { required: true })}
                placeholder="Complete address"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('city', { required: true })}
                  placeholder="New Delhi"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register('state', { required: true })}
                  placeholder="Delhi"
                />
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  {...register('pincode')}
                  placeholder="110016"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register('contact_email')}
                  placeholder="admissions@college.edu"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  {...register('contact_phone')}
                  placeholder="+91-11-26591023"
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student_count">Student Count</Label>
                <Input
                  id="student_count"
                  type="number"
                  {...register('student_count')}
                  placeholder="8000"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="faculty_count">Faculty Count</Label>
                <Input
                  id="faculty_count"
                  type="number"
                  {...register('faculty_count')}
                  placeholder="600"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Branding & Media</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register('logo_url')}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="banner_image_url">Banner Image URL</Label>
                <Input
                  id="banner_image_url"
                  type="url"
                  {...register('banner_image_url')}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vision & Mission</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vision">Vision</Label>
                <Textarea
                  id="vision"
                  {...register('vision')}
                  placeholder="College vision statement"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="mission">Mission</Label>
                <Textarea
                  id="mission"
                  {...register('mission')}
                  placeholder="College mission statement"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCollege.isPending}>
              {createCollege.isPending ? 'Creating...' : 'Create College'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};