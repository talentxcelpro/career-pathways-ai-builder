
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface JobDetailsFormProps {
  formData: {
    employment_type: string;
    experience_level: string;
    application_deadline: string;
    location: string;
    is_remote: boolean;
    salary_min: string;
    salary_max: string;
  };
  onInputChange: (key: string, value: any) => void;
}

export default function JobDetailsForm({ formData, onInputChange }: JobDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="employment_type">Employment Type</Label>
            <Select
              value={formData.employment_type}
              onValueChange={(value) => onInputChange('employment_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience_level">Experience Level</Label>
            <Select
              value={formData.experience_level}
              onValueChange={(value) => onInputChange('experience_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry-level">Entry Level</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior-level">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => onInputChange('application_deadline', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={formData.is_remote}
            onCheckedChange={(checked) => onInputChange('is_remote', checked)}
          />
          <Label htmlFor="remote">This is a remote position</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_min">Minimum Salary</Label>
            <Input
              id="salary_min"
              type="number"
              placeholder="50000"
              value={formData.salary_min}
              onChange={(e) => onInputChange('salary_min', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="salary_max">Maximum Salary</Label>
            <Input
              id="salary_max"
              type="number"
              placeholder="80000"
              value={formData.salary_max}
              onChange={(e) => onInputChange('salary_max', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
