// src/components/conversion/GrowthExperimentWrapper.tsx
import React, { useEffect, useState } from 'react';
import { TenSecondCareerMatchWidget } from './TenSecondCareerMatchWidget';
import { 
  GrowthWedgeExperimentEngine, 
  ExperimentVariant, 
  ExperimentKey, 
  CohortName 
} from '@/lib/seo/searchUniverse/growthWedgeExperimentEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

interface GrowthExperimentWrapperProps {
  role?: string;
  location?: string;
  sourcePage?: string;
  className?: string;
  forceVariant?: ExperimentVariant;
}

export const GrowthExperimentWrapper: React.FC<GrowthExperimentWrapperProps> = ({
  role = '',
  location = '',
  sourcePage = '',
  className = '',
  forceVariant,
}) => {
  const [variant, setVariant] = useState<ExperimentVariant>('TREATMENT');
  const [experimentKey, setExperimentKey] = useState<ExperimentKey>('EXP_GLOBAL_WEDGE');
  const [cohortName, setCohortName] = useState<CohortName>('Global Organic Pages');

  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const resolved = GrowthWedgeExperimentEngine.resolveExperimentKey(currentPath, role, location);
    setExperimentKey(resolved.experimentKey);
    setCohortName(resolved.cohortName);

    const activeVariant = forceVariant || GrowthWedgeExperimentEngine.getVariant(resolved.experimentKey);
    setVariant(activeVariant);

    // Track STAGE 1: LANDING VIEW for this cohort & variant
    GrowthWedgeExperimentEngine.trackFunnelStep({
      step: 'STAGE_1_LANDING_VIEW',
      experimentKey: resolved.experimentKey,
      variant: activeVariant,
      cohortName: resolved.cohortName,
      pageUrl: currentPath,
      metadata: { role, location, sourcePage },
    });
  }, [role, location, sourcePage, forceVariant]);

  const handleControlCtaClick = () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    GrowthWedgeExperimentEngine.trackFunnelStep({
      step: 'STAGE_3_AUTH_STARTED',
      experimentKey,
      variant: 'CONTROL',
      cohortName,
      pageUrl: currentPath,
      metadata: { role, location, source: 'control_banner' },
    });

    window.location.href = `/auth?mode=signup&source=control_${experimentKey}&role=${encodeURIComponent(role)}&city=${encodeURIComponent(location)}`;
  };

  // TREATMENT VARIANT: Render the 10-Second Career Match Widget
  if (variant === 'TREATMENT') {
    return (
      <div className={`relative ${className}`}>
        <TenSecondCareerMatchWidget
          role={role}
          location={location}
          sourcePage={sourcePage}
        />
      </div>
    );
  }

  // CONTROL VARIANT: Render the baseline standard search CTA (prior to 10-second match widget)
  return (
    <Card className={`w-full border border-border/80 bg-muted/20 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border/40 bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Standard Search Directory
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Verified Employer Directory
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>TalentXcel Verified</span>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {role && location ? `${role} Openings in ${location}` : (location ? `Jobs in ${location}` : (role ? `${role} Vacancies` : 'Career Opportunities'))}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse verified opportunities and register your profile to connect with hiring managers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 border rounded-md bg-background text-sm text-muted-foreground">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{role || 'Search roles, skills...'}</span>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2 px-3 py-2 border rounded-md bg-background text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{location || 'India'}</span>
          </div>

          <Button 
            onClick={handleControlCtaClick}
            className="w-full sm:w-auto h-10 px-6 font-semibold"
          >
            <span>Browse Jobs & Register</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthExperimentWrapper;
