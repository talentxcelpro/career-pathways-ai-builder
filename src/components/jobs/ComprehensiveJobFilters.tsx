import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IndustrySelector } from '@/components/jobs/IndustrySelector';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Building2,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  Briefcase
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface JobFilters {
  search: string;
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  skills: string[];
  department?: string[];
  company_type?: string[];
  work_mode?: string[];
  industry?: string[];
  role_category?: string[];
  education?: string[];
  posted_by?: string[];
  freshness?: string[];
  company_id?: string;
}

interface ComprehensiveJobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const FilterSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-2 h-auto text-sm font-medium"
        >
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-sm">{title}</span>
          </div>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const CheckboxFilter: React.FC<{
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (values: string[]) => void;
  showCount?: boolean;
}> = ({ options, selected, onChange, showCount = true }) => {
  const handleChange = (value: string, checked: boolean) => {
    const newSelected = checked
      ? [...selected, value]
      : selected.filter(item => item !== value);
    onChange(newSelected);
  };

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-1.5">
          <Checkbox
            id={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
          />
          <label htmlFor={option.value} className="text-xs cursor-pointer flex-1 flex items-center justify-between">
            <span className="text-xs">{option.label}</span>
            {showCount && option.count && (
              <span className="text-xs text-muted-foreground">({option.count})</span>
            )}
          </label>
        </div>
      ))}
    </div>
  );
};

export const ComprehensiveJobFilters: React.FC<ComprehensiveJobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const updateFilters = (updates: Partial<JobFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleSalaryChange = (values: number[]) => {
    updateFilters({ 
      salary_min: values[0] * 1000,
      salary_max: values[1] * 1000
    });
  };

  const activeFiltersCount = 
    filters.employment_type.length +
    filters.experience_level.length +
    (filters.department?.length || 0) +
    (filters.company_type?.length || 0) +
    (filters.work_mode?.length || 0) +
    (filters.industry?.length || 0) +
    (filters.role_category?.length || 0) +
    (filters.education?.length || 0) +
    (filters.posted_by?.length || 0) +
    (filters.freshness?.length || 0) +
    filters.skills.length +
    (filters.is_remote ? 1 : 0) +
    (filters.salary_min > 0 || filters.salary_max > 0 ? 1 : 0);

  const EXPERIENCE_OPTIONS = [
    { value: 'fresher', label: '0-1 Years', count: 245 },
    { value: 'junior', label: '1-3 Years', count: 189 },
    { value: 'mid-level', label: '3-7 Years', count: 156 },
    { value: 'senior-level', label: '5-10 Years', count: 89 },
    { value: 'lead', label: '7-12 Years', count: 45 },
    { value: 'manager', label: '8+ Years', count: 32 },
    { value: 'director', label: '12+ Years', count: 18 },
    { value: 'executive', label: '15+ Years', count: 12 }
  ];

  const DEPARTMENT_OPTIONS = [
    { value: 'engineering', label: 'Engineering', count: 234 },
    { value: 'marketing', label: 'Marketing', count: 89 },
    { value: 'sales', label: 'Sales', count: 145 },
    { value: 'design', label: 'Design', count: 67 },
    { value: 'product', label: 'Product', count: 78 },
    { value: 'hr', label: 'Human Resources', count: 45 },
    { value: 'finance', label: 'Finance', count: 56 },
    { value: 'operations', label: 'Operations', count: 89 }
  ];

  const COMPANY_TYPE_OPTIONS = [
    { value: 'startup', label: 'Startup', count: 189 },
    { value: 'mnc', label: 'MNC', count: 134 },
    { value: 'product', label: 'Product Company', count: 98 },
    { value: 'service', label: 'Service Company', count: 156 },
    { value: 'nonprofit', label: 'Non-Profit', count: 23 },
    { value: 'government', label: 'Government', count: 45 }
  ];

  const WORK_MODE_OPTIONS = [
    { value: 'remote', label: 'Work from Home', count: 156 },
    { value: 'hybrid', label: 'Hybrid', count: 234 },
    { value: 'office', label: 'Work from Office', count: 189 }
  ];

  const INDUSTRY_OPTIONS = [
    { value: 'technology', label: 'Technology', count: 234 },
    { value: 'finance', label: 'Financial Services', count: 145 },
    { value: 'healthcare', label: 'Healthcare', count: 89 },
    { value: 'ecommerce', label: 'E-commerce', count: 134 },
    { value: 'education', label: 'Education', count: 67 },
    { value: 'consulting', label: 'Consulting', count: 78 }
  ];

  const ROLE_CATEGORY_OPTIONS = [
    { value: 'software-development', label: 'Software Development', count: 189 },
    { value: 'data-science', label: 'Data Science', count: 89 },
    { value: 'devops', label: 'DevOps', count: 56 },
    { value: 'qa', label: 'Quality Assurance', count: 67 },
    { value: 'mobile', label: 'Mobile Development', count: 45 },
    { value: 'frontend', label: 'Frontend', count: 134 },
    { value: 'backend', label: 'Backend', count: 123 },
    { value: 'fullstack', label: 'Full Stack', count: 156 }
  ];

  const EDUCATION_OPTIONS = [
    { value: 'bachelors', label: "Bachelor's Degree", count: 345 },
    { value: 'masters', label: "Master's Degree", count: 189 },
    { value: 'phd', label: 'PhD', count: 23 },
    { value: 'diploma', label: 'Diploma', count: 78 },
    { value: 'certification', label: 'Professional Certification', count: 134 }
  ];

  const POSTED_BY_OPTIONS = [
    { value: 'company', label: 'Company', count: 234 },
    { value: 'recruiter', label: 'Recruiter', count: 189 },
    { value: 'consultant', label: 'Consultant', count: 78 }
  ];

  const FRESHNESS_OPTIONS = [
    { value: 'today', label: 'Today', count: 45 },
    { value: 'week', label: 'This Week', count: 189 },
    { value: 'month', label: 'This Month', count: 345 },
    { value: '3months', label: 'Last 3 Months', count: 456 }
  ];

  return (
    <Card className={`h-fit sticky top-4 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            <CardTitle className="text-sm">Job Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1">
          
          {/* Experience */}
          <FilterSection title="Experience" icon={<Clock className="h-3 w-3" />}>
            <CheckboxFilter
              options={EXPERIENCE_OPTIONS}
              selected={filters.experience_level}
              onChange={(values) => updateFilters({ experience_level: values })}
            />
          </FilterSection>

          <Separator />

          {/* Salary Range */}
          <FilterSection title="Salary" icon={<span className="text-sm">₹</span>}>
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={[filters.salary_min / 1000, filters.salary_max / 1000]}
                  onValueChange={handleSalaryChange}
                  max={5000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span className="text-xs">₹{filters.salary_min / 1000}k</span>
                  <span className="text-xs">₹{filters.salary_max / 1000}k</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  { range: '0-3 Lakhs', count: 145 },
                  { range: '3-6 Lakhs', count: 189 },
                  { range: '6-10 Lakhs', count: 134 },
                  { range: '10-15 Lakhs', count: 89 },
                  { range: '15-25 Lakhs', count: 56 },
                  { range: '25+ Lakhs', count: 34 }
                ].map((item) => (
                  <div key={item.range} className="flex justify-between text-muted-foreground text-xs">
                    <span className="text-xs">{item.range}</span>
                    <span className="text-xs">({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Department */}
          <FilterSection title="Department" icon={<Briefcase className="h-3 w-3" />}>
            <CheckboxFilter
              options={DEPARTMENT_OPTIONS}
              selected={filters.department || []}
              onChange={(values) => updateFilters({ department: values })}
            />
          </FilterSection>

          <Separator />

          {/* Company Type */}
          <FilterSection title="Company Type" icon={<Building2 className="h-3 w-3" />}>
            <CheckboxFilter
              options={COMPANY_TYPE_OPTIONS}
              selected={filters.company_type || []}
              onChange={(values) => updateFilters({ company_type: values })}
            />
          </FilterSection>

          <Separator />

          {/* Work Mode */}
          <FilterSection title="Work Mode" icon={<MapPin className="h-3 w-3" />}>
            <CheckboxFilter
              options={WORK_MODE_OPTIONS}
              selected={filters.work_mode || []}
              onChange={(values) => updateFilters({ work_mode: values })}
            />
          </FilterSection>

          <Separator />

          {/* Industry */}
          <FilterSection title="Industry" icon={<Building2 className="h-3 w-3" />} defaultOpen={false}>
            <div className="px-2">
              <IndustrySelector
                selectedIndustries={filters.industry || []}
                onIndustryChange={(industries) => updateFilters({ industry: industries })}
                maxSelections={10}
                showTrending={true}
                compact={true}
              />
            </div>
          </FilterSection>

          <Separator />

          {/* Role Category */}
          <FilterSection title="Role Category" icon={<Users className="h-3 w-3" />} defaultOpen={false}>
            <CheckboxFilter
              options={ROLE_CATEGORY_OPTIONS}
              selected={filters.role_category || []}
              onChange={(values) => updateFilters({ role_category: values })}
            />
          </FilterSection>

          <Separator />

          {/* Education */}
          <FilterSection title="Education" icon={<GraduationCap className="h-3 w-3" />} defaultOpen={false}>
            <CheckboxFilter
              options={EDUCATION_OPTIONS}
              selected={filters.education || []}
              onChange={(values) => updateFilters({ education: values })}
            />
          </FilterSection>

          <Separator />

          {/* Posted By */}
          <FilterSection title="Posted By" icon={<Users className="h-3 w-3" />} defaultOpen={false}>
            <CheckboxFilter
              options={POSTED_BY_OPTIONS}
              selected={filters.posted_by || []}
              onChange={(values) => updateFilters({ posted_by: values })}
            />
          </FilterSection>

          <Separator />

          {/* Freshness */}
          <FilterSection title="Freshness" icon={<Clock className="h-3 w-3" />} defaultOpen={false}>
            <CheckboxFilter
              options={FRESHNESS_OPTIONS}
              selected={filters.freshness || []}
              onChange={(values) => updateFilters({ freshness: values })}
            />
          </FilterSection>

        </div>
      </CardContent>
    </Card>
  );
};