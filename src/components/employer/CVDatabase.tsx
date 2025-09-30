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
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppliedResumes } from './cv-database/AppliedResumes';
import { PlatformCVs } from './cv-database/PlatformCVs';
import { UnifiedCVSearch } from './cv-database/UnifiedCVSearch';
import { OutreachModal } from './cv-database/OutreachModal';
import { UnifiedCandidatesTable } from './UnifiedCandidatesTable';

export const CVDatabase: React.FC = () => {
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Real-time application monitoring
  const { data: recentApplications } = useQuery({
    queryKey: ['recent_applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          applied_at,
          status,
          user_id,
          job_id,
          jobs!fk_job_applications_job_id(title, company_name),
          profiles(full_name, email, title)
        `)
        .order('applied_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Real-time updates every 30 seconds
  });

  const { data: outreachUsage } = useQuery({
    queryKey: ['outreach_usage'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase
        .from('outreach_usage')
        .select('*')
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { emails_sent: 0, is_premium: false };
    }
  });

  // Enhanced unified stats with real-time updates
  const { data: stats } = useQuery({
    queryKey: ['cv_database_stats_realtime'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Total candidates
      const { count: total } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true });

      // Applied candidates with recent applications
      const { count: applied } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'application');

      // Today's applications
      const { count: todayApplied } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .gte('applied_at', today);

      // Platform candidates
      const { count: platform } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'platform');

      return {
        appliedCandidates: applied || 0,
        platformCandidates: platform || 0,
        totalCandidates: total || 0,
        todayApplications: todayApplied || 0,
      };
    },
    refetchInterval: 15000 // Real-time updates every 15 seconds
  });

  // Get selected candidates data for outreach
  const { data: selectedCandidatesData } = useQuery({
    queryKey: ['selected_candidates', selectedCVs],
    queryFn: async () => {
      if (selectedCVs.length === 0) return [];
      
      const { data, error } = await supabase
        .from('unified_candidates')
        .select('id, name, email, title, company')
        .in('id', selectedCVs);
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedCVs.length > 0
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="space-y-6 p-6">
        {/* Apple-inspired Header */}
        <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-card">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">CV Database</h1>
            <p className="text-sm text-muted-foreground font-medium">Real-time candidate management and outreach</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 rounded-full text-xs font-medium">
              <span className="text-muted-foreground">Email Outreach:</span>
              <Badge 
                variant={typeof remainingEmails === 'string' ? 'default' : remainingEmails > 10 ? 'default' : 'destructive'}
                className="text-xs"
              >
                {remainingEmails} {typeof remainingEmails === 'number' ? 'remaining' : ''}
              </Badge>
            </div>
            {selectedCVs.length > 0 && (
              <Button 
                onClick={() => setShowOutreachModal(true)} 
                className="bg-gradient-to-r from-primary to-ai-violet-600 text-white shadow-card hover:shadow-elegant transition-all duration-300 rounded-lg h-10 px-4 text-sm font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Outreach ({selectedCVs.length})
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{stats?.appliedCandidates || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Applied Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{stats?.platformCandidates || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Platform CVs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{stats?.totalCandidates || 0}</p>
                  <p className="text-xs text-muted-foreground font-medium">Total Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-ai-violet-500/5 to-primary/5 backdrop-blur-sm border-ai-violet-200/30 shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ai-violet-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-ai-violet-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-ai-violet-700">{stats?.todayApplications || 0}</p>
                  <p className="text-xs text-ai-violet-600/80 font-medium">Today's Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Recent Applications Alert */}
        {recentApplications && recentApplications.length > 0 && (
          <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-200/30 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Recent Applications</h3>
                <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                  Live Updates
                </Badge>
              </div>
              <div className="space-y-2">
                {recentApplications.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">
                      {(application.profiles as any)?.full_name || 'Unknown'} applied to {(application.jobs as any)?.title || 'Unknown Job'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(application.applied_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/60 backdrop-blur-sm rounded-xl p-1 h-12">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              All Candidates ({stats?.totalCandidates || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="applied" 
              className="flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Applied ({stats?.appliedCandidates || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="platform" 
              className="flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Database className="h-4 w-4" />
              Platform ({stats?.platformCandidates || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Unified CV Database</h3>
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">Real-time</Badge>
              </div>
              <p className="text-blue-700/80 text-sm mt-1 font-medium">
                All candidates including CV uploads and user profiles with activation system.
              </p>
            </div>
            
            <UnifiedCandidatesTable />
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Applied Resumes</h3>
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                  {stats?.todayApplications || 0} today
                </Badge>
              </div>
              <p className="text-blue-700/80 text-sm mt-1 font-medium">
                View candidates who have directly applied to your job postings with duplicate prevention.
              </p>
            </div>
            
            <AppliedResumes
              selectedCVs={selectedCVs}
              onSelectCV={handleSelectCV}
              onSelectAll={handleSelectAll}
            />
          </TabsContent>

          <TabsContent value="platform" className="space-y-4">
            <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Platform CV Database</h3>
                <Badge variant="outline" className="text-xs text-green-700 border-green-300">Verified</Badge>
              </div>
              <p className="text-green-700/80 text-sm mt-1 font-medium">
                Browse verified candidate profiles with automated matching and real-time availability.
              </p>
            </div>
            
            <PlatformCVs
              selectedCVs={selectedCVs}
              onSelectCV={handleSelectCV}
              onSelectAll={handleSelectAll}
            />
          </TabsContent>
        </Tabs>

        {/* Enhanced Outreach Modal */}
        <OutreachModal
          isOpen={showOutreachModal}
          onClose={() => setShowOutreachModal(false)}
          selectedCandidates={selectedCandidatesData?.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            title: c.title,
            company: c.company
          })) || []}
          onSuccess={() => {
            setSelectedCVs([]);
            setShowOutreachModal(false);
          }}
        />
      </div>
    </div>
  );
};