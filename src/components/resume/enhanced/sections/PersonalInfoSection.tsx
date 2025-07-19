
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { PersonalInfo } from "@/types/enhanced-resume";

interface PersonalInfoSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  data,
  onChange
}) => {
  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                className="pl-10 mt-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="pl-10 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={data.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="pl-10 mt-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedin"
                value={data.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
                className="pl-10 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="website">Website/Portfolio</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                value={data.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="johndoe.com"
                className="pl-10 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="github">GitHub Profile</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="github"
                value={data.github || ''}
                onChange={(e) => updateField('github', e.target.value)}
                placeholder="github.com/johndoe"
                className="pl-10 mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Write a brief professional summary highlighting your key skills and experience..."
            rows={4}
            className="mt-1 resize-none"
          />
          <div className="text-xs text-muted-foreground mt-1">
            This will be used as a fallback if no detailed professional summary is provided.
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm">
            <strong>Tips for a great personal section:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Use a professional email address</li>
              <li>Include your full name as you'd like it to appear on official documents</li>
              <li>Add your LinkedIn profile to show your professional network</li>
              <li>Keep your location general (city, state) for privacy</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
