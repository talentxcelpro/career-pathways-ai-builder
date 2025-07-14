import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Linkedin, Globe, Github } from "lucide-react";
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </label>
            <Input
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </label>
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location *
            </label>
            <Input
              value={data.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="New York, NY"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn Profile
            </label>
            <Input
              value={data.linkedin || ''}
              onChange={(e) => updateField('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Personal Website
            </label>
            <Input
              value={data.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="johndoe.com"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Profile
            </label>
            <Input
              value={data.github || ''}
              onChange={(e) => updateField('github', e.target.value)}
              placeholder="github.com/johndoe"
            />
          </div>
        </div>

        <div className="pt-4">
          <div className="text-xs text-muted-foreground">
            * Required fields. This information will be prominently displayed at the top of your resume.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};