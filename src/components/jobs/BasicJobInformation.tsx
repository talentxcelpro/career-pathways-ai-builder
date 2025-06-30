
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface BasicJobInformationProps {
  formData: {
    title: string;
    category_id: string;
    description: string;
    requirements: string;
    employment_type: string;
    experience_level: string;
    application_deadline: string;
    location_type: string;
    location: string;
    is_remote: boolean;
    salary_min: string;
    salary_max: string;
    work_schedule: string;
    contact_person_name: string;
    contact_person_designation: string;
  };
  categories: Category[];
  onInputChange: (key: string, value: any) => void;
}

export default function BasicJobInformation({ formData, categories, onInputChange }: BasicJobInformationProps) {
  const [deadlineDate, setDeadlineDate] = React.useState<Date>();

  React.useEffect(() => {
    if (formData.application_deadline) {
      setDeadlineDate(new Date(formData.application_deadline));
    }
  }, [formData.application_deadline]);

  const handleDateSelect = (date: Date | undefined) => {
    setDeadlineDate(date);
    onInputChange('application_deadline', date ? date.toISOString() : '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧾 Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Title */}
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            placeholder="E.g., Software Engineer – Frontend (React.js)"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
          />
        </div>

        {/* Employment Type */}
        <div>
          <Label htmlFor="employment_type">🏢 Employment Type</Label>
          <Select
            value={formData.employment_type}
            onValueChange={(value) => onInputChange('employment_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose the nature of the job role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div>
          <Label htmlFor="experience_level">🎓 Experience Level</Label>
          <Select
            value={formData.experience_level}
            onValueChange={(value) => onInputChange('experience_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select the appropriate experience range for candidates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresher">Fresher (0–1 year)</SelectItem>
              <SelectItem value="junior">Junior (1–3 years)</SelectItem>
              <SelectItem value="mid-level">Mid-level (3–6 years)</SelectItem>
              <SelectItem value="senior">Senior (6–10 years)</SelectItem>
              <SelectItem value="expert">Expert / Leadership (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Application Deadline */}
        <div>
          <Label htmlFor="deadline">📅 Application Deadline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !deadlineDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadlineDate ? format(deadlineDate, "dd/MM/yyyy") : "Select deadline (dd/mm/yyyy)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadlineDate}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">Job post will expire after 15 days automatically</p>
        </div>

        {/* Location Type */}
        <div>
          <Label htmlFor="location_type">📍 Location Type</Label>
          <Select
            value={formData.location_type}
            onValueChange={(value) => onInputChange('location_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose where the job will be conducted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on-site">On-site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Location */}
        <div>
          <Label htmlFor="location">🌐 Job Location (City, State)</Label>
          <Input
            id="location"
            placeholder="E.g., Bengaluru, Karnataka or Mumbai, Maharashtra"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
          />
        </div>

        {/* Salary Range */}
        <div>
          <Label>💰 Salary Range (INR per Month)</Label>
          <p className="text-sm text-muted-foreground mb-2">Enter the minimum and maximum expected salary</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="salary_min"
                  type="number"
                  placeholder="50,000"
                  value={formData.salary_min}
                  onChange={(e) => onInputChange('salary_min', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="salary_max"
                  type="number"
                  placeholder="80,000"
                  value={formData.salary_max}
                  onChange={(e) => onInputChange('salary_max', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            E.g., 50,000 – 80,000 INR/month (Salary is shown publicly on job card to attract relevant applicants)
          </p>
        </div>

        {/* Work Schedule */}
        <div>
          <Label htmlFor="work_schedule">⏱️ Work Schedule</Label>
          <Select
            value={formData.work_schedule}
            onValueChange={(value) => onInputChange('work_schedule', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select work schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general-day">General Day Shift (9 AM – 6 PM)</SelectItem>
              <SelectItem value="night-shift">Night Shift (US/UK Timings)</SelectItem>
              <SelectItem value="rotational">Rotational Shift</SelectItem>
              <SelectItem value="flexible">Flexible Hours</SelectItem>
              <SelectItem value="part-time">Part-Time Hours (Choose Time Slots)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Description */}
        <div>
          <Label htmlFor="description">📃 Job Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed overview of the job responsibilities, expectations, KPIs, and tools used. Include a summary of the team, company mission, and work culture."
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={8}
            required
          />
        </div>

        {/* Requirements */}
        <div>
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            placeholder="List detailed qualifications, experience, certifications, and specific skills required..."
            value={formData.requirements}
            onChange={(e) => onInputChange('requirements', e.target.value)}
            rows={4}
          />
        </div>

        {/* Contact Person */}
        <div>
          <Label>📞 Contact Person (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-3">You may provide a recruiter or hiring manager name</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_name">Full Name</Label>
              <Input
                id="contact_name"
                placeholder="Enter full name"
                value={formData.contact_person_name}
                onChange={(e) => onInputChange('contact_person_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact_designation">Designation</Label>
              <Input
                id="contact_designation"
                placeholder="E.g., HR Manager, Tech Lead"
                value={formData.contact_person_designation}
                onChange={(e) => onInputChange('contact_person_designation', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Visibility Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📢 Visibility & Duration Notice</h4>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 font-medium">✅</span>
            <div className="text-sm text-blue-800">
              <p>This job post will remain live for 15 days from the date of posting.</p>
              <p>After expiry, you will be notified to extend or repost.</p>
            </div>
          </div>
        </div>

        {/* Application Method */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">📨 Application Method</h4>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">✓</span>
            <span className="text-sm text-gray-700">Apply via TalentXcel Profile + Resume Upload (default)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
