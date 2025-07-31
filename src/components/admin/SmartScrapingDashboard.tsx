import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useJobPortalBlocklist, 
  useJobSourceValidations, 
  useJobQualityScores,
  useScrapingSchedules,
  useSmartJobScraping,
  useAutomatedJobProcessor,
  useAddToBlocklist,
  useRemoveFromBlocklist
} from '@/hooks/useSmartJobScraping';
import { useBots } from '@/hooks/useBotManagement';
import { 
  Shield, 
  Bot, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Play,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export const SmartScrapingDashboard = () => {
  const [testUrls, setTestUrls] = useState('');
  const [selectedBotId, setSelectedBotId] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newDomainReason, setNewDomainReason] = useState('');

  // Queries
  const { data: blocklist } = useJobPortalBlocklist();
  const { data: validations } = useJobSourceValidations();
  const { data: qualityScores } = useJobQualityScores();
  const { data: schedules } = useScrapingSchedules();
  const { data: bots } = useBots();

  // Mutations
  const smartScraping = useSmartJobScraping();
  const automatedProcessor = useAutomatedJobProcessor();
  const addToBlocklist = useAddToBlocklist();
  const removeFromBlocklist = useRemoveFromBlocklist();

  const handleTestScraping = () => {
    if (!testUrls.trim() || !selectedBotId) {
      toast.error('Please enter URLs and select a bot');
      return;
    }

    const urls = testUrls.split('\n').map(url => url.trim()).filter(Boolean);
    
    smartScraping.mutate({
      sourceUrls: urls,
      botId: selectedBotId,
      maxJobs: 10,
      testMode: true,
      sourceCategory: 'test'
    });
  };

  const handleRunAutomation = () => {
    automatedProcessor.mutate();
  };

  const handleAddToBloclist = () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    addToBlocklist.mutate({
      domain: newDomain.toLowerCase(),
      portal_type: 'job_portal',
      reason: newDomainReason || 'Manually added'
    });

    setNewDomain('');
    setNewDomainReason('');
  };

  const getValidationBadgeColor = (result: string) => {
    switch (result) {
      case 'company_website': return 'bg-green-500';
      case 'job_portal': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const activeSchedules = schedules?.filter(s => s.is_active) || [];
  const recentValidations = validations?.slice(0, 10) || [];
  const topQualityJobs = qualityScores?.filter(q => q.overall_score >= 70).slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Job Scraping</h1>
          <p className="text-muted-foreground">AI-powered job scraping with portal filtering and quality scoring</p>
        </div>
        <Button 
          onClick={handleRunAutomation}
          disabled={automatedProcessor.isPending}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {automatedProcessor.isPending ? 'Running...' : 'Run Automation'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Domains</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocklist?.filter(b => b.is_active).length || 0}</div>
            <p className="text-xs text-muted-foreground">Job portals blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Automated scrapers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Validations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">AI validations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityScores?.length ? 
                Math.round(qualityScores.reduce((acc, q) => acc + q.overall_score, 0) / qualityScores.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average quality</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">Test Scraping</TabsTrigger>
          <TabsTrigger value="blocklist">Portal Blocklist</TabsTrigger>
          <TabsTrigger value="validations">Source Validations</TabsTrigger>
          <TabsTrigger value="quality">Quality Scores</TabsTrigger>
          <TabsTrigger value="schedules">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Job Scraping</CardTitle>
              <CardDescription>Test the smart scraping system with custom URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-select">Select Bot</Label>
                <select 
                  id="bot-select"
                  value={selectedBotId} 
                  onChange={(e) => setSelectedBotId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a bot...</option>
                  {bots?.map(bot => (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-urls">Test URLs (one per line)</Label>
                <Textarea
                  id="test-urls"
                  placeholder="https://company1.com/careers&#10;https://company2.com/jobs&#10;https://startup.com/opportunities"
                  value={testUrls}
                  onChange={(e) => setTestUrls(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleTestScraping}
                disabled={smartScraping.isPending}
                className="w-full"
              >
                {smartScraping.isPending ? 'Testing...' : 'Test Scraping'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add to Blocklist</CardTitle>
              <CardDescription>Block job portals and aggregator sites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Domain (e.g., jobportal.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <Input
                  placeholder="Reason (optional)"
                  value={newDomainReason}
                  onChange={(e) => setNewDomainReason(e.target.value)}
                />
                <Button onClick={handleAddToBloclist} disabled={addToBlocklist.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked Domains ({blocklist?.filter(b => b.is_active).length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blocklist?.filter(b => b.is_active).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{item.domain}</span>
                      {item.reason && <p className="text-sm text-muted-foreground">{item.reason}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromBlocklist.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Source Validations</CardTitle>
              <CardDescription>AI-powered classification of job sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentValidations.map(validation => (
                  <div key={validation.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{validation.domain}</span>
                        <Badge className={getValidationBadgeColor(validation.validation_result)}>
                          {validation.validation_result.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {(validation.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      {validation.ai_reasoning && (
                        <p className="text-sm text-muted-foreground mt-1">{validation.ai_reasoning}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Quality Jobs</CardTitle>
              <CardDescription>Jobs with highest quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topQualityJobs.map(score => (
                  <div key={score.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${getQualityColor(score.overall_score)}`}>
                          {score.overall_score}%
                        </span>
                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>Completeness: {score.completeness_score}%</div>
                            <div>Relevance: {score.relevance_score}%</div>
                            <div>Freshness: {score.freshness_score}%</div>
                            <div>Trust: {score.source_trust_score}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Schedules</CardTitle>
              <CardDescription>Automated job scraping configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSchedules.map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{schedule.source_category}</span>
                        <Badge variant="outline">{schedule.scraping_frequency}</Badge>
                        <Badge variant="secondary">{schedule.max_jobs_per_run} jobs/run</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Success: {schedule.success_count} | Errors: {schedule.error_count}
                        {schedule.last_run_at && (
                          <span> | Last run: {new Date(schedule.last_run_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={schedule.is_active} />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};