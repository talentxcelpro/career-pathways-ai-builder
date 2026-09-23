/**
 * SourceAttribution Component
 * Renders compliant source attribution and provenance citations.
 */

import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SourceAttributionProps {
  sourceName: string;
  sourceUrl: string;
  externalJobId?: string;
  lastVerifiedAt?: string;
  className?: string;
}

export const SourceAttribution: React.FC<SourceAttributionProps> = ({
  sourceName,
  sourceUrl,
  externalJobId,
  lastVerifiedAt,
  className,
}) => {
  const verifiedDate = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <Card className={cn('border border-border/40 bg-muted/20 text-xs text-muted-foreground', className)}>
      <CardContent className="p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Verified Source Notice</span>
          </div>
          {externalJobId && (
            <span className="font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border">
              Ref: {externalJobId}
            </span>
          )}
        </div>

        <p className="leading-relaxed">
          This vacancy notice is curated directly from{' '}
          <strong className="text-foreground font-semibold">{sourceName}</strong>. TalentXcel maintains official
          provenance and directs candidates exclusively to the official agency or government commission portal to complete applications.
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[11px]">
          <span>Last verified: {verifiedDate}</span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            View Official Bulletin <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceAttribution;
