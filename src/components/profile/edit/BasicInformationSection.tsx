import React from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicInformationSectionProps {
  formData: {
    full_name: string;
    title: string;
    headline: string;
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
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Basic Information</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">Your primary contact and professional details</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => onFieldChange('full_name', e.target.value)}
              placeholder="Your full name"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Professional Title</label>
            <Input
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Professional Headline</label>
          <Input
            value={formData.headline}
            onChange={(e) => onFieldChange('headline', e.target.value)}
            placeholder="e.g. Experienced developer passionate about AI and innovation"
            className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => onFieldChange('location', e.target.value)}
              placeholder="City, State/Country"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Website/Portfolio</label>
            <Input
              value={formData.website}
              onChange={(e) => onFieldChange('website', e.target.value)}
              placeholder="yourwebsite.com"
              className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};