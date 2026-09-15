import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Users, Mail, BarChart3, Settings } from 'lucide-react';
import { ImportUploader } from '@/components/admin/bulk-imports/ImportUploader';
import { ImportBatchMonitor } from '@/components/admin/bulk-imports/ImportBatchMonitor';
import { LeadManagement } from '@/components/admin/bulk-imports/LeadManagement';
import { EmailCampaigns } from '@/components/admin/bulk-imports/EmailCampaigns';
import { ImportAnalytics } from '@/components/admin/bulk-imports/ImportAnalytics';
import { EnrichmentSettings } from '@/components/admin/bulk-imports/EnrichmentSettings';

export default function BulkUserImports() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bulk User Import System</h1>
          <p className="text-muted-foreground">
            Import millions of users with automated follow-ups and profile enrichment
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <ImportUploader />
          </TabsContent>

          <TabsContent value="batches">
            <ImportBatchMonitor />
          </TabsContent>

          <TabsContent value="leads">
            <LeadManagement />
          </TabsContent>

          <TabsContent value="campaigns">
            <EmailCampaigns />
          </TabsContent>

          <TabsContent value="analytics">
            <ImportAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <EnrichmentSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
