import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface ContactPersonFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

export default function ContactPersonForm({ formData, onInputChange }: ContactPersonFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Contact Person (Optional)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide contact details for candidates to reach out directly.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Full Name</Label>
            <Input
              id="contact_name"
              placeholder="e.g., John Doe"
              value={formData.contact_name || ''}
              onChange={(e) => onInputChange('contact_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_designation">Designation</Label>
            <Input
              id="contact_designation"
              placeholder="e.g., HR Manager"
              value={formData.contact_designation || ''}
              onChange={(e) => onInputChange('contact_designation', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email Address</Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="john.doe@company.com"
              value={formData.contact_email || ''}
              onChange={(e) => onInputChange('contact_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone Number</Label>
            <Input
              id="contact_phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.contact_phone || ''}
              onChange={(e) => onInputChange('contact_phone', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}