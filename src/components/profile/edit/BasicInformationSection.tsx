import React from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicInformationSectionProps {
  formData: {
    full_name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ 
  formData, 
  onFieldChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Your primary contact and professional details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => onFieldChange('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Professional Title</label>
            <Input
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => onFieldChange('location', e.target.value)}
              placeholder="City, State/Country"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Website/Portfolio</label>
            <Input
              value={formData.website}
              onChange={(e) => onFieldChange('website', e.target.value)}
              placeholder="yourwebsite.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};