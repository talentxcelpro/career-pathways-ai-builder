import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InlineAIEnhancer } from "../ai/InlineAIEnhancer";

interface PersonalInfoEditorProps {
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={data.fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={data.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <InlineAIEnhancer
            content={data.summary || ''}
            type="summary"
            onEnhanced={(enhanced) => onChange('summary', enhanced)}
            label="Generate Summary"
          />
        </div>
        <Textarea
          id="summary"
          value={data.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          placeholder="Write a brief professional summary highlighting your experience and expertise..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
};
