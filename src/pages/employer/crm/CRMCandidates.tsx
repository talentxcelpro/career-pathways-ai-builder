
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, ArrowLeft, Search, Filter, Download, 
  Mail, UserPlus, Eye, Tag, FileText
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CandidateCard } from "@/components/employer/crm/CandidateCard";
import { CandidateTagManager } from "@/components/employer/crm/CandidateTagManager";
import { OutreachModal } from "@/components/employer/cv-database/OutreachModal";
import { toast } from "sonner";

const CRMCandidates = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch unified candidates from multiple sources
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['crm-candidates', searchTerm, selectedSource],
    queryFn: async () => {
      if (!user?.id) return { candidates: [], total: 0 };

      const { data, error } = await supabase.functions.invoke('cv-search', {
        body: {
          searchTerm,
          filters: selectedSource !== 'all' ? { source: [selectedSource] } : {},
          page: 1,
          limit: 50
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch tags and notes for candidates
  const { data: candidateMetadata } = useQuery({
    queryKey: ['candidate-metadata', candidatesData?.candidates?.map((c: any) => c.id)],
    queryFn: async () => {
      if (!user?.id || !candidatesData?.candidates?.length) return {};

      const candidateIds = candidatesData.candidates.map((c: any) => c.id);
      
      const [tagsResult, notesResult] = await Promise.all([
        supabase
          .from('candidate_tags')
          .select('*')
          .eq('employer_id', user.id)
          .in('candidate_id', candidateIds),
        supabase
          .from('candidate_notes')
          .select('*')
          .eq('employer_id', user.id)
          .in('candidate_id', candidateIds)
          .order('created_at', { ascending: false })
      ]);

      const metadata: Record<string, { tags: any[], notes: any[] }> = {};
      
      candidateIds.forEach(id => {
        metadata[id] = {
          tags: tagsResult.data?.filter(t => t.candidate_id === id) || [],
          notes: notesResult.data?.filter(n => n.candidate_id === id) || []
        };
      });

      return metadata;
    },
    enabled: !!user?.id && !!candidatesData?.candidates?.length
  });

  const handleViewProfile = (candidateId: string) => {
    navigate(`/employer/crm/${candidateId}`);
  };

  const handleDownloadResume = async (candidate: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-download-cvs', {
        body: {
          candidateFiles: [{
            name: candidate.name,
            resumeUrl: candidate.resume_url
          }]
        }
      });

      if (error) throw error;

      if (data.files && data.files.length > 0) {
        const link = document.createElement('a');
        link.href = data.files[0].url;
        link.download = data.files[0].filename;
        link.click();
        toast.success('Resume download started');
      }
    } catch (error: any) {
      toast.error('Failed to download resume: ' + error.message);
    }
  };

  const handleEmailCandidate = (candidate: any) => {
    setSelectedCandidates([candidate.id]);
    setOutreachModalOpen(true);
  };

  const handleBulkEmail = () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates first');
      return;
    }
    setOutreachModalOpen(true);
  };

  const handleBulkDownload = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates first');
      return;
    }

    try {
      const selectedCandidateData = candidatesData?.candidates?.filter((c: any) => 
        selectedCandidates.includes(c.id) && c.resume_url
      );

      if (!selectedCandidateData?.length) {
        toast.error('No resumes available for selected candidates');
        return;
      }

      const candidateFiles = selectedCandidateData.map((c: any) => ({
        name: c.name,
        resumeUrl: c.resume_url
      }));

      const { data, error } = await supabase.functions.invoke('bulk-download-cvs', {
        body: { candidateFiles }
      });

      if (error) throw error;

      data.files.forEach((file: any) => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.filename;
        link.click();
      });

      toast.success(`Started download of ${data.files.length} resumes`);
    } catch (error: any) {
      toast.error('Failed to download resumes: ' + error.message);
    }
  };

  const filteredCandidates = candidatesData?.candidates || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">CRM - All Candidates</h1>
          <p className="text-muted-foreground">Unified candidate relationship management</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, email, title, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="applied">Job Applications</SelectItem>
                <SelectItem value="platform">Platform CVs</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleBulkEmail}
                disabled={selectedCandidates.length === 0}
                className="flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
                Email ({selectedCandidates.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleBulkDownload}
                disabled={selectedCandidates.length === 0}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download ({selectedCandidates.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {candidatesData?.total || 0} candidates found
          </Badge>
          {selectedSource !== 'all' && (
            <Badge variant="secondary">
              {selectedSource === 'applied' ? 'Job Applications' : 'Platform CVs'}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setSelectedCandidates(
            selectedCandidates.length === filteredCandidates.length 
              ? [] 
              : filteredCandidates.map((c: any) => c.id)
          )}
          size="sm"
        >
          {selectedCandidates.length === filteredCandidates.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {/* Candidates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms or filters.' : 'No candidates available yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate: any) => (
            <div key={candidate.id} className="relative">
              <input
                type="checkbox"
                checked={selectedCandidates.includes(candidate.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCandidates([...selectedCandidates, candidate.id]);
                  } else {
                    setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                  }
                }}
                className="absolute top-2 left-2 z-10"
              />
              
              <CandidateCard
                candidate={candidate}
                onViewProfile={handleViewProfile}
                onDownloadResume={handleDownloadResume}
                onEmailCandidate={handleEmailCandidate}
                tags={candidateMetadata?.[candidate.id]?.tags || []}
                notes={candidateMetadata?.[candidate.id]?.notes || []}
              />
            </div>
          ))}
        </div>
      )}

      {/* Outreach Modal */}
      <OutreachModal
        isOpen={outreachModalOpen}
        onClose={() => {
          setOutreachModalOpen(false);
          setSelectedCandidates([]);
        }}
        selectedCandidates={selectedCandidates.map(id => 
          filteredCandidates.find((c: any) => c.id === id)
        ).filter(Boolean)}
        onSuccess={() => {
          setOutreachModalOpen(false);
          setSelectedCandidates([]);
          toast.success('Outreach emails sent successfully');
        }}
      />
    </div>
  );
};

export default CRMCandidates;
