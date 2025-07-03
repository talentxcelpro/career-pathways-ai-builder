import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobOverviewFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
  categories: any[];
}

const employmentTypeOptions = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary'
];

const workModeOptions = [
  'On-site',
  'Remote',
  'Hybrid',
  'Field-based'
];

const workScheduleOptions = [
  'General Shift',
  'Morning Shift',
  'Night Shift',
  'Rotational Shift',
  'Flexible Hours'
];

const experienceLevelOptions = [
  'Fresher',
  '0–2 Years',
  '2–5 Years',
  '5–10 Years',
  '10+ Years'
];

export default function JobOverviewForm({ formData, onInputChange, categories }: JobOverviewFormProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onInputChange('application_deadline', date.toISOString().split('T')[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title || ''}
              onChange={(e) => onInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select
              value={formData.employment_type || ''}
              onValueChange={(value) => onInputChange('employment_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work_mode">Work Mode *</Label>
            <Select
              value={formData.work_mode || ''}
              onValueChange={(value) => onInputChange('work_mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                {workModeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (City, State) *</Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Maharashtra"
              value={formData.location || ''}
              onChange={(e) => onInputChange('location', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="work_schedule">Work Schedule *</Label>
            <Select
              value={formData.work_schedule || ''}
              onValueChange={(value) => onInputChange('work_schedule', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work schedule" />
              </SelectTrigger>
              <SelectContent>
                {workScheduleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience Level *</Label>
            <Select
              value={formData.experience_level || ''}
              onValueChange={(value) => onInputChange('experience_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Application Deadline *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.application_deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.application_deadline ? (
                  format(new Date(formData.application_deadline), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.application_deadline ? new Date(formData.application_deadline) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Note: Job will expire 15 days from posting. Extendable.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Job Category</Label>
          <Select
            value={formData.category_id || ''}
            onValueChange={(value) => onInputChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}