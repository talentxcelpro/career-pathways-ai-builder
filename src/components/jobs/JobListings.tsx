import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernJobCard } from "./ModernJobCard";
import { AlertTriangle, Filter, RefreshCw, TrendingDown } from "lucide-react";

// Sample job data with realistic information
const sampleJobs = [
  {
    id: "1",
    title: "SAP ABAP Consultant",
    description: "Looking for experienced SAP ABAP consultant to work on S/4HANA implementation projects.",
    company: { id: "jb1", name: "JB Technologies", logo_url: "", industry: "Technology" },
    location: "Bangalore",
    salary_min: 2,
    salary_max: 4,
    employment_type: "contract",
    experience_level: "mid-level",
    skills_required: ["S/4HANA", "SAP", "ABAP Consultant"],
    views_count: 33,
    applications_count: 1,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    is_urgent: true,
    ai_match_score: 89,
    competition_level: "low" as const,
    easy_apply: true
  },
  {
    id: "2",
    title: "Service Desk Engineer",
    description: "Join our technical support team to provide excellent customer service and technical solutions.",
    company: { id: "jb2", name: "TechSupport Pro", logo_url: "", industry: "IT Services" },
    location: "Noida",
    salary_min: 2,
    salary_max: 2,
    employment_type: "contract",
    experience_level: "fresher",
    skills_required: ["Communication Skills"],
    views_count: 13,
    applications_count: 1,
    posted_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    is_urgent: true,
    ai_match_score: 83,
    competition_level: "low" as const,
    easy_apply: true
  },
  {
    id: "3",
    title: "Sales Executive",
    description: "Drive sales growth by building relationships with clients and identifying new business opportunities.",
    company: { id: "jb3", name: "SalesForce India", logo_url: "", industry: "Sales" },
    location: "Mumbai",
    salary_min: 20000,
    salary_max: 25000,
    employment_type: "full-time",
    experience_level: "fresher",
    views_count: 6,
    applications_count: 1,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ai_match_score: 75,
    competition_level: "medium" as const
  },
  {
    id: "4",
    title: "Service Desk Engineer L1",
    description: "Provide first-level technical support and troubleshooting for enterprise clients.",
    company: { id: "jb4", name: "Global IT Solutions", logo_url: "", industry: "IT Support" },
    location: "Noida",
    salary_min: 3,
    salary_max: 4,
    employment_type: "contract",
    experience_level: "fresher",
    skills_required: ["Communication Skills", "Ticketing tool", "Troubleshooting", "Active Directory"],
    views_count: 23,
    applications_count: 1,
    posted_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    ai_match_score: 87,
    is_remote: true,
    competition_level: "low" as const
  },
  {
    id: "5",
    title: "Customer Service Representative",
    description: "Deliver exceptional customer service and support across multiple communication channels.",
    company: { id: "jb5", name: "Customer First Ltd", logo_url: "", industry: "Customer Service" },
    location: "Noida",
    salary_min: 12000,
    salary_max: 20000,
    employment_type: "full-time",
    experience_level: "fresher",
    views_count: 58,
    applications_count: 2,
    posted_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    ai_match_score: 75,
    competition_level: "medium" as const
  },
  {
    id: "6",
    title: "Sales Manager",
    description: "Lead sales team and drive revenue growth through strategic account management and team leadership.",
    company: { id: "jb6", name: "Enterprise Sales Corp", logo_url: "", industry: "Enterprise Sales" },
    location: "Noida",
    salary_min: 415,
    salary_max: 664,
    employment_type: "full-time",
    experience_level: "mid-level",
    views_count: 6,
    applications_count: 2,
    posted_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    ai_match_score: 75,
    competition_level: "high" as const
  },
  {
    id: "7",
    title: "Software Developer",
    description: "Build innovative software solutions using modern technologies and best practices.",
    company: { id: "jb7", name: "CodeCraft Technologies", logo_url: "", industry: "Software Development" },
    location: "Bangalore",
    employment_type: "full-time",
    experience_level: "senior-level",
    views_count: 6,
    applications_count: 2,
    posted_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    ai_match_score: 75,
    competition_level: "high" as const
  }
];

interface JobListingsProps {
  filters?: any;
  onClearFilters?: () => void;
}

export const JobListings: React.FC<JobListingsProps> = ({ filters, onClearFilters }) => {
  const [sortBy, setSortBy] = useState("newest");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Filter and sort jobs based on current filters
  const filteredJobs = useMemo(() => {
    let filtered = [...sampleJobs];

    // Apply filters here based on filters prop
    if (filters?.is_remote) {
      filtered = filtered.filter(job => job.is_remote);
    }

    // Sort jobs
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.posted_at || '').getTime() - new Date(a.posted_at || '').getTime());
        break;
      case "relevance":
        filtered.sort((a, b) => (b.ai_match_score || 0) - (a.ai_match_score || 0));
        break;
      case "salary":
        filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [filters, sortBy]);

  const featuredJobs = filteredJobs.filter(job => job.is_featured);
  const regularJobs = filteredJobs.filter(job => !job.is_featured);

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with job count and sorting */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Job Opportunities</h2>
          <p className="text-muted-foreground">
            Find your perfect match from <span className="font-semibold text-primary">{filteredJobs.length}</span> active positions
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Just now</span>
            </div>
            <span className="text-muted-foreground">Updated less than a minute ago</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{filteredJobs.length} jobs found</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert for early application advantage */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-orange-800">⚠️ Don't Miss Out!</h4>
              <p className="text-sm text-orange-700">
                📢 Most job posts get their first 5 applications within 6-12 hours.
                🔥 Early applicants have 3x higher chance of getting shortlisted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">🏆 Featured Jobs (Top Priority)</h3>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Premium Listings
            </Badge>
          </div>
          <div className="grid gap-6">
            {featuredJobs.map((job) => (
              <ModernJobCard
                key={job.id}
                job={job}
                variant="featured"
                onSave={handleSaveJob}
                isSaved={savedJobs.includes(job.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Jobs Section */}
      {regularJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">🗂 All Jobs List</h3>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          <div className="grid gap-4">
            {regularJobs.map((job) => (
              <ModernJobCard
                key={job.id}
                job={job}
                onSave={handleSaveJob}
                isSaved={savedJobs.includes(job.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredJobs.length === 0 && (
        <Card className="p-12 text-center">
          <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search criteria to find more opportunities.
          </p>
          <Button onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </Card>
      )}
    </div>
  );
};