import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  ExternalLink,
  MapPin,
  Briefcase,
  Calendar,
  User,
  Phone,
  LinkedinIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface CVRecord {
  application_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string;
  applied_at: string;
  status: string;
  application_source: string;
}

export const CVDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [showOutreachModal, setShowOutreachModal] = useState(false);

  const { data: cvData, isLoading } = useQuery({
    queryKey: ['employer_cv_database_secure'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employer_cv_database_secure')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: outreachUsage } = useQuery({
    queryKey: ['outreach_usage'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data, error } = await supabase
        .from('outreach_usage')
        .select('*')
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { emails_sent: 0, is_premium: false };
    }
  });

  const filteredCVs = cvData?.filter(cv =>
    cv.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectCV = (applicationId: string) => {
    setSelectedCVs(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCVs.length === filteredCVs.length) {
      setSelectedCVs([]);
    } else {
      setSelectedCVs(filteredCVs.map(cv => cv.application_id));
    }
  };

  const remainingEmails = outreachUsage?.is_premium 
    ? 'Unlimited' 
    : Math.max(0, 50 - (outreachUsage?.emails_sent || 0));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CV Database</h1>
          <p className="text-gray-600">Access all candidate profiles and resumes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Email Outreach: </span>
            <Badge variant={typeof remainingEmails === 'string' ? 'default' : remainingEmails > 10 ? 'default' : 'destructive'}>
              {remainingEmails} {typeof remainingEmails === 'number' ? 'remaining this month' : ''}
            </Badge>
          </div>
          {selectedCVs.length > 0 && (
            <Button onClick={() => setShowOutreachModal(true)} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Outreach ({selectedCVs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {filteredCVs.length} candidates found
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCVs.length === filteredCVs.length && filteredCVs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">Select All</span>
          </div>
        </div>
      </div>

      {/* CV Cards */}
      <div className="grid gap-4">
        {filteredCVs.map((cv) => (
          <Card key={cv.application_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedCVs.includes(cv.application_id)}
                  onCheckedChange={() => handleSelectCV(cv.application_id)}
                />
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {cv.full_name?.charAt(0) || 'C'}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{cv.full_name}</h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Applied to: {cv.job_title} {cv.company_name && `at ${cv.company_name}`}
                      </p>
                      {cv.location && (
                        <p className="text-gray-500 flex items-center gap-1 text-sm">
                          <MapPin className="h-4 w-4" />
                          {cv.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {cv.resume_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={cv.resume_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied: {format(new Date(cv.applied_at), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {cv.email}
                      </span>
                      {cv.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {cv.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Job:</span>
                      <span className="text-sm">{cv.job_title}</span>
                      <Badge variant="outline">{cv.status}</Badge>
                      <Badge variant={cv.application_source === 'scraped' ? 'secondary' : 'default'} className="flex items-center gap-1">
                        {cv.application_source === 'scraped' && <ExternalLink className="h-3 w-3" />}
                        {cv.application_source === 'scraped' ? 'External' : 'Platform'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCVs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};