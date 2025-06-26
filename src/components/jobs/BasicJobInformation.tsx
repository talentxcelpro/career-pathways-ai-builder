
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  };
  categories: Category[];
  onInputChange: (key: string, value: any) => void;
}

export default function BasicJobInformation({ formData, categories, onInputChange }: BasicJobInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Senior Frontend Developer"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id}
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

        <div>
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={6}
            required
          />
        </div>

        <div>
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            placeholder="List the qualifications, experience, and skills required..."
            value={formData.requirements}
            onChange={(e) => onInputChange('requirements', e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
