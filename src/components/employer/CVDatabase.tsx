import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  FileText,
  Users,
  Database,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppliedResumes } from './cv-database/AppliedResumes';
import { PlatformCVs } from './cv-database/PlatformCVs';
import { UnifiedCVSearch } from './cv-database/UnifiedCVSearch';

export const CVDatabase: React.FC = () => {
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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

  // Get unified stats from a single source of truth
  const { data: stats } = useQuery({
    queryKey: ['cv_database_stats_unified'],
    queryFn: async () => {
      // Total
      const { count: total } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true });

      // Applied
      const { count: applied } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'application');

      // Platform
      const { count: platform } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'platform');

      return {
        appliedCandidates: applied || 0,
        platformCandidates: platform || 0,
        totalCandidates: total || 0,
      };
    }
  });

  const handleSelectCV = (id: string) => {
    setSelectedCVs(prev => 
      prev.includes(id) 
        ? prev.filter(cvId => cvId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedCVs(ids);
  };

  const remainingEmails = outreachUsage?.is_premium 
    ? 'Unlimited' 
    : Math.max(0, 50 - (outreachUsage?.emails_sent || 0));

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.appliedCandidates || 0}</p>
                <p className="text-sm text-gray-600">Applied Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.platformCandidates || 0}</p>
                <p className="text-sm text-gray-600">Platform CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCandidates || 0}</p>
                <p className="text-sm text-gray-600">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different CV Sources */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Candidates ({stats?.totalCandidates || 0})
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Applied Resumes ({stats?.appliedCandidates || 0})
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Platform CVs ({stats?.platformCandidates || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Unified CV Database</h3>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Search and filter through all available candidates from both applied resumes and platform CVs in one unified view.
            </p>
          </div>
          
          <UnifiedCVSearch
            selectedCVs={selectedCVs}
            onSelectCV={handleSelectCV}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Applied Resumes</h3>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              View candidates who have directly applied to your job postings. These candidates have shown specific interest in your open positions.
            </p>
          </div>
          
          <AppliedResumes
            selectedCVs={selectedCVs}
            onSelectCV={handleSelectCV}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Platform CV Database</h3>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Browse all candidate profiles available on the platform. These are public profiles of job seekers who haven't necessarily applied to your jobs yet.
            </p>
          </div>
          
          <PlatformCVs
            selectedCVs={selectedCVs}
            onSelectCV={handleSelectCV}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};