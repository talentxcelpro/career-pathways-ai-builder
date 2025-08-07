import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { X, Filter, TrendingUp } from 'lucide-react';
import { useJobFilterCounts } from '@/hooks/useJobFilterCounts';
import { Skeleton } from '@/components/ui/skeleton';

interface JobFilters {
  search: string;
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  skills: string[];
  department: string[];
  company_type: string[];
  work_mode: string[];
  industry: string[];
  role_category: string[];
  education: string[];
  posted_by: string[];
  freshness: string[];
}

interface LiveJobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClearFilters: () => void;
  totalJobs: number;
}

export const LiveJobFilters: React.FC<LiveJobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalJobs
}) => {
  const { data: filterCounts, isLoading } = useJobFilterCounts();

  const updateFilters = (key: keyof JobFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof JobFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.employment_type.length > 0) count++;
    if (filters.experience_level.length > 0) count++;
    if (filters.salary_min > 0 || filters.salary_max > 0) count++;
    if (filters.is_remote) count++;
    if (filters.skills.length > 0) count++;
    if (filters.department.length > 0) count++;
    if (filters.company_type.length > 0) count++;
    if (filters.work_mode.length > 0) count++;
    if (filters.industry.length > 0) count++;
    if (filters.role_category.length > 0) count++;
    if (filters.education.length > 0) count++;
    if (filters.posted_by.length > 0) count++;
    if (filters.freshness.length > 0) count++;
    return count;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Job Filters
            </CardTitle>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      {children}
    </div>
  );

  const CheckboxItem = ({ 
    label, 
    count, 
    checked, 
    onChange 
  }: { 
    label: string; 
    count: number; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={label}
          checked={checked}
          onCheckedChange={onChange}
        />
        <label 
          htmlFor={label}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      </div>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Job Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="default" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary">
              <TrendingUp className="h-3 w-3 mr-1" />
              {totalJobs} jobs
            </Badge>
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <FilterSection title="Experience">
          <div className="space-y-2">
            {filterCounts?.experience.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={filters.experience_level.includes(item.value)}
                onChange={(checked) => {
                  if (checked) {
                    updateFilters('experience_level', [...filters.experience_level, item.value]);
                  } else {
                    updateFilters('experience_level', filters.experience_level.filter(exp => exp !== item.value));
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Salary Range */}
        <FilterSection title="₹ Salary">
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[filters.salary_min || 0, filters.salary_max || 5000000]}
                onValueChange={([min, max]) => {
                  updateFilters('salary_min', min);
                  updateFilters('salary_max', max);
                }}
                min={0}
                max={5000000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹{((filters.salary_min || 0) / 100000).toFixed(0)}L</span>
                <span>₹{((filters.salary_max || 5000000) / 100000).toFixed(0)}L</span>
              </div>
            </div>
            <div className="space-y-2">
              {filterCounts?.salary.map((item) => (
                <CheckboxItem
                  key={item.label}
                  label={item.label}
                  count={item.count}
                  checked={
                    filters.salary_min <= item.min && 
                    (filters.salary_max >= item.max || filters.salary_max === 0)
                  }
                  onChange={(checked) => {
                    if (checked) {
                      updateFilters('salary_min', item.min);
                      updateFilters('salary_max', item.max === 999999999 ? 0 : item.max);
                    } else {
                      updateFilters('salary_min', 0);
                      updateFilters('salary_max', 0);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Department */}
        <FilterSection title="Department">
          <div className="space-y-2">
            {filterCounts?.department.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={filters.department.includes(item.value)}
                onChange={() => toggleArrayFilter('department', item.value)}
              />
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Company Type */}
        <FilterSection title="Company Type">
          <div className="space-y-2">
            {filterCounts?.companyType.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={filters.company_type.includes(item.value)}
                onChange={() => toggleArrayFilter('company_type', item.value)}
              />
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Work Mode */}
        <FilterSection title="Work Mode">
          <div className="space-y-2">
            {filterCounts?.workMode.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={
                  item.value === 'remote' ? filters.is_remote : 
                  filters.work_mode.includes(item.value)
                }
                onChange={(checked) => {
                  if (item.value === 'remote') {
                    updateFilters('is_remote', checked);
                  } else {
                    toggleArrayFilter('work_mode', item.value);
                  }
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Industry */}
        {filterCounts?.industry && filterCounts.industry.length > 0 && (
          <>
            <Separator />
            <FilterSection title="Industry">
              <div className="space-y-2">
                {filterCounts.industry.slice(0, 6).map((item) => (
                  <CheckboxItem
                    key={item.value}
                    label={item.label}
                    count={item.count}
                    checked={filters.industry.includes(item.value)}
                    onChange={() => toggleArrayFilter('industry', item.value)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* Role Category */}
        {filterCounts?.roleCategory && filterCounts.roleCategory.length > 0 && (
          <>
            <Separator />
            <FilterSection title="Role Category">
              <div className="space-y-2">
                {filterCounts.roleCategory.slice(0, 6).map((item) => (
                  <CheckboxItem
                    key={item.value}
                    label={item.label}
                    count={item.count}
                    checked={filters.role_category.includes(item.value)}
                    onChange={() => toggleArrayFilter('role_category', item.value)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* Education */}
        {filterCounts?.education && filterCounts.education.length > 0 && (
          <>
            <Separator />
            <FilterSection title="Education">
              <div className="space-y-2">
                {filterCounts.education.slice(0, 5).map((item) => (
                  <CheckboxItem
                    key={item.value}
                    label={item.label}
                    count={item.count}
                    checked={filters.education.includes(item.value)}
                    onChange={() => toggleArrayFilter('education', item.value)}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* Posted By */}
        <Separator />
        <FilterSection title="Posted By">
          <div className="space-y-2">
            {filterCounts?.postedBy.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={filters.posted_by.includes(item.value)}
                onChange={() => toggleArrayFilter('posted_by', item.value)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Freshness */}
        <Separator />
        <FilterSection title="Freshness">
          <div className="space-y-2">
            {filterCounts?.freshness.map((item) => (
              <CheckboxItem
                key={item.value}
                label={item.label}
                count={item.count}
                checked={filters.freshness.includes(item.value)}
                onChange={() => toggleArrayFilter('freshness', item.value)}
              />
            ))}
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
};