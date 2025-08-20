import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, DollarSign, TrendingUp, Users, Award, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProgramsCatalogProps {
  collegeId: string;
  collegeName: string;
}

export const ProgramsCatalog: React.FC<ProgramsCatalogProps> = ({
  collegeId,
  collegeName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  const { data: programs, isLoading } = useQuery({
    queryKey: ['college-programs', collegeId, searchTerm, degreeFilter, disciplineFilter],
    queryFn: async () => {
      let query = supabase
        .from('college_courses')
        .select('*')
        .eq('college_id', collegeId)
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`course_name.ilike.%${searchTerm}%,discipline.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
      }

      if (degreeFilter !== 'all') {
        query = query.eq('degree_type', degreeFilter);
      }

      if (disciplineFilter !== 'all') {
        query = query.eq('discipline', disciplineFilter);
      }

      const { data, error } = await query.order('course_name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const getDegreeTypeColor = (degreeType: string) => {
    const colors = {
      'undergraduate': 'bg-blue-100 text-blue-800',
      'postgraduate': 'bg-green-100 text-green-800',
      'diploma': 'bg-orange-100 text-orange-800',
      'certificate': 'bg-purple-100 text-purple-800',
      'phd': 'bg-red-100 text-red-800'
    };
    return colors[degreeType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatFees = (fees: number) => {
    if (fees >= 100000) {
      return `₹${(fees / 100000).toFixed(1)}L`;
    }
    return `₹${(fees / 1000).toFixed(0)}K`;
  };

  const uniqueDegreeTypes = [...new Set(programs?.map(p => p.degree_type) || [])];
  const uniqueDisciplines = [...new Set(programs?.map(p => p.discipline) || [])];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Programs & Courses at {collegeName}</span>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search programs, disciplines, or specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={degreeFilter} onValueChange={setDegreeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Degree Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {uniqueDegreeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {uniqueDisciplines.map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setDegreeFilter('all');
                setDisciplineFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {programs && programs.length > 0 ? (
          programs.map((program) => (
            <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{program.course_name}</h3>
                    <Badge className={getDegreeTypeColor(program.degree_type)}>
                      {program.degree_type?.toUpperCase()}
                    </Badge>
                    {program.course_mode && (
                      <Badge variant="outline" className="text-xs">
                        {program.course_mode}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{program.discipline}</span>
                    {program.specialization && (
                      <span> • {program.specialization}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {program.duration_years} year{program.duration_years > 1 ? 's' : ''}
                    </div>
                    
                    {program.total_fees && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatFees(program.total_fees)} total
                      </div>
                    )}
                    
                    {program.placement_rate && (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {program.placement_rate}% placement
                      </div>
                    )}
                    
                    {program.total_seats && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {program.total_seats} seats
                      </div>
                    )}
                  </div>
                  
                  {program.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {program.description}
                    </p>
                  )}
                  
                  {program.career_prospects && program.career_prospects.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Career Prospects:</div>
                      <div className="flex flex-wrap gap-1">
                        {program.career_prospects.slice(0, 3).map((career, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {career}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {program.top_recruiters && program.top_recruiters.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Top Recruiters:</div>
                      <div className="text-xs text-gray-600">
                        {program.top_recruiters.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {program.syllabus_url && (
                  <Button size="sm" variant="outline">
                    View Syllabus
                  </Button>
                )}
                
                {program.brochure_url && (
                  <Button size="sm" variant="outline">
                    Download Brochure
                  </Button>
                )}
                
                <Button size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || degreeFilter !== 'all' || disciplineFilter !== 'all'
                ? 'No programs found matching your filters'
                : 'No programs available at the moment'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};