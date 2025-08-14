import React from 'react';
import { usePrefillData, useBulkPrefill } from '@/hooks/usePrefillData';
import { PrefillCard } from '@/components/shared/PrefillCard';
import { PrefillButton } from '@/components/ui/prefill-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PrefillDashboard() {
  const networkPrefill = usePrefillData({ module: 'network' });
  const resumePrefill = usePrefillData({ module: 'resume' });
  const { bulkTemplates, applyBulkTemplate, isApplying } = useBulkPrefill();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prefill Dashboard</h2>
        <Badge variant="secondary">Ultra-Fast Enabled</Badge>
      </div>

      {/* Bulk Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bulkTemplates?.map((template) => (
              <PrefillCard
                key={template.id}
                title={template.template_name}
                description={template.description || ''}
                modules={JSON.parse(template.modules as any)}
                onApply={() => applyBulkTemplate(template.id)}
                isLoading={isApplying}
                type="bulk"
                isPremium={template.is_premium}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module-specific Prefills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <PrefillButton
                onClick={() => networkPrefill.generateAIPrefill({})}
                isLoading={networkPrefill.isGenerating}
                variant="ai"
                size="sm"
              />
              <PrefillButton
                onClick={() => console.log('Template fill')}
                variant="template"
                size="sm"
              />
            </div>
            {networkPrefill.prefillData && (
              <div className="text-sm text-muted-foreground">
                ✓ Prefill data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <PrefillButton
                onClick={() => resumePrefill.generateAIPrefill({})}
                isLoading={resumePrefill.isGenerating}
                variant="ai"
                size="sm"
              />
              <PrefillButton
                onClick={() => console.log('Template fill')}
                variant="template"
                size="sm"
              />
            </div>
            {resumePrefill.prefillData && (
              <div className="text-sm text-muted-foreground">
                ✓ Prefill data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}