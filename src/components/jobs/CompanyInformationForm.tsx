import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import EnhancedCompanyForm from "./EnhancedCompanyForm";

interface CompanyInformationFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

const industryOptions = [
  'IT / Software',
  'Finance / Banking',
  'Healthcare / Pharma',
  'Education / Training',
  'Marketing / Advertising',
  'Manufacturing / Engineering',
  'Government / PSU',
  'Legal / Compliance',
  'Media / Entertainment',
  'Others'
];

const companySizeOptions = [
  '1–10',
  '11–50',
  '51–200',
  '201–500',
  '501–1000',
  '1000+'
];

export default function CompanyInformationForm({ formData, onInputChange }: CompanyInformationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Company Form */}
        <EnhancedCompanyForm
          value={formData.company_id}
          onValueChange={(value) => onInputChange('company_id', value)}
          onCompanyCreate={(company) => {
            console.log('New company created:', company);
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_website">Company Website</Label>
            <Input
              id="company_website"
              type="url"
              placeholder="https://example.com"
              value={formData.company_website || ''}
              onChange={(e) => onInputChange('company_website', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry_domain">Industry Domain *</Label>
            <Select
              value={formData.industry_domain || ''}
              onValueChange={(value) => onInputChange('industry_domain', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size *</Label>
          <Select
            value={formData.company_size || ''}
            onValueChange={(value) => onInputChange('company_size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}