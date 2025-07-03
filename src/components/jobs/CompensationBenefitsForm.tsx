import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IndianRupee } from "lucide-react";

interface CompensationBenefitsFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

const salaryOptions = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
  60000, 70000, 80000, 90000, 100000, 125000, 150000, 175000, 200000,
  250000, 300000, 350000, 400000, 450000, 500000, 600000, 700000, 800000, 900000, 1000000
];

const benefitsOptions = [
  'Health Insurance',
  'Paid Time Off',
  'Performance Bonus',
  'Work from Home',
  'Stock Options',
  'Flexible Hours',
  'Internet Allowance',
  'Cab Facility',
  'Maternity / Paternity Leave',
  'Free Meals',
  'Gym / Wellness Access',
  'Learning Budget',
  'Other'
];

export default function CompensationBenefitsForm({ formData, onInputChange }: CompensationBenefitsFormProps) {
  const handleBenefitChange = (benefit: string, checked: boolean) => {
    const current = formData.benefits_offered || [];
    if (checked) {
      onInputChange('benefits_offered', [...current, benefit]);
    } else {
      onInputChange('benefits_offered', current.filter((b: string) => b !== benefit));
    }
  };

  const formatSalary = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
    }
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Compensation & Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium">Salary Range (Monthly INR)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Salary</Label>
              <Select
                value={formData.salary_min?.toString() || ''}
                onValueChange={(value) => onInputChange('salary_min', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum salary" />
                </SelectTrigger>
                <SelectContent>
                  {salaryOptions.map((amount) => (
                    <SelectItem key={amount} value={amount.toString()}>
                      {formatSalary(amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Salary</Label>
              <Select
                value={formData.salary_max?.toString() || ''}
                onValueChange={(value) => onInputChange('salary_max', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum salary" />
                </SelectTrigger>
                <SelectContent>
                  {salaryOptions.filter(amount => !formData.salary_min || amount >= parseInt(formData.salary_min)).map((amount) => (
                    <SelectItem key={amount} value={amount.toString()}>
                      {formatSalary(amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Salary range will be shown on job card publicly.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Benefits Offered (Multiple Selections)</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {benefitsOptions.map((benefit) => (
              <div key={benefit} className="flex items-center space-x-2">
                <Checkbox
                  id={`benefit-${benefit}`}
                  checked={(formData.benefits_offered || []).includes(benefit)}
                  onCheckedChange={(checked) => handleBenefitChange(benefit, !!checked)}
                />
                <Label htmlFor={`benefit-${benefit}`} className="text-sm">
                  {benefit}
                </Label>
              </div>
            ))}
          </div>

          {(formData.benefits_offered || []).length > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected benefits:</p>
              <div className="flex flex-wrap gap-2">
                {(formData.benefits_offered || []).map((benefit: string) => (
                  <span key={benefit} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}