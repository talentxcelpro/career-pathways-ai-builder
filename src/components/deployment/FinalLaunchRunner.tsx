import React from 'react';
import { FinalLaunchChecklist } from './FinalLaunchChecklist';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Rocket, CheckCircle } from 'lucide-react';

export const FinalLaunchRunner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <Rocket className="w-8 h-8 text-primary" />
              Final Launch Readiness Check
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">
              Complete verification of all systems before production deployment
            </p>
          </CardHeader>
        </Card>

        {/* Checklist */}
        <FinalLaunchChecklist />

        {/* Footer Status */}
        <Card className="border-green-500/20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Ready for Production Launch</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};