
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserRole } from '@/utils/roleRouting';

interface ProfileSetupProps {
  userRole: UserRole;
  onComplete: (profileData: {
    fullName: string;
    location?: string;
    about?: string;
    companyName?: string;
    instituteName?: string;
  }) => void;
  initialData?: {
    fullName?: string;
    location?: string;
    about?: string;
  };
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ 
  userRole, 
  onComplete, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    location: initialData?.location || '',
    about: initialData?.about || '',
    companyName: '',
    instituteName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const getRoleSpecificFields = () => {
    switch (userRole) {
      case 'employer':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your company name"
              />
            </div>
          </div>
        );
      case 'institute':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="instituteName">Institute Name</Label>
              <Input
                id="instituteName"
                value={formData.instituteName}
                onChange={(e) => setFormData(prev => ({ ...prev, instituteName: e.target.value }))}
                placeholder="Your institute name"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    const titles = {
      candidate: 'Complete Your Profile',
      employer: 'Set Up Your Company Profile',
      institute: 'Set Up Your Institute Profile',
      mentor: 'Complete Your Mentor Profile',
      admin: 'Complete Your Admin Profile'
    };
    return titles[userRole] || 'Complete Your Profile';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {getRoleTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>

            {getRoleSpecificFields()}

            <div>
              <Label htmlFor="about">About You</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
