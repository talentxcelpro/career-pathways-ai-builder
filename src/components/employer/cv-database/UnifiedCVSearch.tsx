import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Download, 
  MapPin, 
  Building2, 
  User, 
  Mail,
  Calendar,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';

interface Candidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  skills: string[];
  description: string;
  resume_url?: string;
  location?: string;
  profile_photo_url?: string;
  linkedin_url?: string;
  applied: boolean;
  source: 'application' | 'platform';
  applied_at?: string;
  created_at: string;
}

interface SearchFilters {
  source: string[];
  skills: string[];
  location: string[];
  companies: string[];
  titles: string[];
  hasResume: boolean | null;
}

interface UnifiedCVSearchProps {
  selectedCVs: string[];
  onSelectCV: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export const UnifiedCVSearch: React.FC<UnifiedCVSearchProps> = ({
  selectedCVs,
  onSelectCV,
  onSelectAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    source: [],
    skills: [],
    location: [],
    companies: [],
    titles: [],
    hasResume: null
  });
  const [filterOptions, setFilterOptions] = useState({
    skills: [] as string[],
    locations: [] as string[],
    companies: [] as string[],
    titles: [] as string[]
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const searchCandidates = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('cv-search', {
        body: {
          searchTerm: debouncedSearchTerm,
          filters,
          page,
          limit: pagination.limit,
          sortBy: 'created_at',
          sortOrder: 'desc'
        }
      });

      if (error) throw error;

      setCandidates(data.candidates || []);
      setPagination(data.pagination);
      setFilterOptions(data.filterOptions);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search candidates');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters, pagination.limit]);

  // Initial search on mount is handled by the effect below

  useEffect(() => {
    searchCandidates(1);
  }, [searchCandidates]);

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      source: [],
      skills: [],
      location: [],
      companies: [],
      titles: [],
      hasResume: null
    });
  };

  const handleSelectAll = () => {
    const allIds = candidates.map(c => c.id);
    onSelectAll(allIds);
  };

  const activeFiltersCount = Object.values(filters).filter(f => 
    Array.isArray(f) ? f.length > 0 : f !== null
  ).length;

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search candidates by name, title, company, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Source Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <div className="space-y-2">
                    {[
                      { value: 'applied', label: 'Applied Candidates' },
                      { value: 'platform', label: 'Platform CVs' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${option.value}`}
                          checked={filters.source.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const newSources = checked
                              ? [...filters.source, option.value]
                              : filters.source.filter(s => s !== option.value);
                            handleFilterChange('source', newSources);
                          }}
                        />
                        <label htmlFor={`source-${option.value}`} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Resume Available</label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-resume"
                      checked={filters.hasResume === true}
                      onCheckedChange={(checked) => {
                        handleFilterChange('hasResume', checked ? true : null);
                      }}
                    />
                    <label htmlFor="has-resume" className="text-sm">
                      Has Resume File
                    </label>
                  </div>
                </div>

                {/* Top Skills Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills</label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filterOptions.skills.slice(0, 10).map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={filters.skills.includes(skill)}
                          onCheckedChange={(checked) => {
                            const newSkills = checked
                              ? [...filters.skills, skill]
                              : filters.skills.filter(s => s !== skill);
                            handleFilterChange('skills', newSkills);
                          }}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-xs">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {loading ? 'Searching...' : `${pagination.total} candidates found`}
          </span>
          {candidates.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={candidates.every(c => selectedCVs.includes(c.id))}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All ({candidates.length})
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedCVs.includes(candidate.id)}
                  onCheckedChange={() => onSelectCV(candidate.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {candidate.name}
                        </h3>
                        <p className="text-primary font-medium">{candidate.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          {candidate.company}
                          {candidate.location && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={candidate.applied ? 'default' : 'secondary'}>
                          {candidate.applied ? 'Applied' : 'Platform'}
                        </Badge>
                        {candidate.resume_url && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Resume
                          </Badge>
                        )}
                      </div>
                    </div>

                    {candidate.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {candidate.description}
                      </p>
                    )}

                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {candidate.applied_at 
                        ? `Applied ${new Date(candidate.applied_at).toLocaleDateString()}`
                        : `Added ${new Date(candidate.created_at).toLocaleDateString()}`
                      }
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {candidate.email}
                    </div>
                    {candidate.resume_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.open(candidate.resume_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download CV
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev || loading}
            onClick={() => searchCandidates(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext || loading}
            onClick={() => searchCandidates(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && candidates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || activeFiltersCount > 0
              ? 'Try adjusting your search or filters'
              : 'No candidates available in the database'
            }
          </p>
        </div>
      )}
    </div>
  );
};