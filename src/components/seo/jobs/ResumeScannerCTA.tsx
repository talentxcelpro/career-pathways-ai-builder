// src/components/seo/jobs/ResumeScannerCTA.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobLocationConfig } from '@/config/jobs/locations';

interface ResumeScannerCTAProps {
  role: JobRoleConfig;
  location: JobLocationConfig;
}

export const ResumeScannerCTA: React.FC<ResumeScannerCTAProps> = ({ role, location }) => {
  return (
    <Card className="border border-border/70 bg-card rounded-2xl overflow-hidden shadow-xs hover:border-blue-500/30 transition-all">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1">
              <Zap className="h-3 w-3 fill-amber-500" />
              Free Tool
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">10-Second Automated Analysis</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Is your resume ATS-ready for {role.title} jobs in {location.cityName}?
          </h3>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Over 75% of resumes are filtered out before reaching a human recruiter. Scan your resume against {role.title} job descriptions to detect missing keywords, formatting errors, and recruiter match score.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Role-Specific Keyword Match
            </span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Section Formatting Audit
            </span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Instant PDF Scorecard
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0">
          <Button asChild size="lg" className="w-full md:w-auto bg-foreground hover:bg-foreground/90 text-background font-bold text-sm gap-2 px-6 h-12 shadow-sm">
            <a href="/resume/ats-scanner">
              <FileText className="h-4 w-4 text-blue-500" />
              Scan My Resume Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
