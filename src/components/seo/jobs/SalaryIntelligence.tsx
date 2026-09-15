// src/components/seo/jobs/SalaryIntelligence.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Award, DollarSign, Info } from 'lucide-react';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';

interface SalaryIntelligenceProps {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
}

export const SalaryIntelligence: React.FC<SalaryIntelligenceProps> = ({ role, experience, location }) => {
  // Compute benchmark ranges based on experience tier & city tier
  const isIndia = location.countryCode === 'IN';
  
  let baseMin = 3.5;
  let baseMid = 5.5;
  let baseMax = 8.5;

  if (experience.slug === '1-3-years') {
    baseMin = 6.0;
    baseMid = 9.5;
    baseMax = 14.0;
  } else if (experience.slug === '3-5-years') {
    baseMin = 12.0;
    baseMid = 18.0;
    baseMax = 26.0;
  }

  // Tier 1 Metro bonus
  if (location.tier === 1) {
    baseMin = parseFloat((baseMin * 1.25).toFixed(1));
    baseMid = parseFloat((baseMid * 1.25).toFixed(1));
    baseMax = parseFloat((baseMax * 1.25).toFixed(1));
  }

  return (
    <Card className="border border-border/60 bg-card rounded-2xl overflow-hidden shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            {role.title} Salary Benchmark ({location.cityName})
          </CardTitle>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> Market Intelligence
          </span>
        </div>
        <CardDescription>
          Typical annual compensation for {experience.label} professionals in {location.cityName}, based on industry hiring bands.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Entry / 25th Pct</span>
            <p className="text-2xl font-extrabold text-foreground">
              {isIndia ? `₹${baseMin} LPA` : `$${Math.round(baseMin * 9000)}/yr`}
            </p>
            <span className="text-[11px] text-muted-foreground">Standard starting band</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center space-y-1">
            <span className="text-xs text-blue-600 uppercase font-semibold">Median / Market Avg</span>
            <p className="text-2xl font-extrabold text-blue-600">
              {isIndia ? `₹${baseMid} LPA` : `$${Math.round(baseMid * 9000)}/yr`}
            </p>
            <span className="text-[11px] text-blue-600/80">Typical competitive offer</span>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-center space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Top Tier / 90th Pct</span>
            <p className="text-2xl font-extrabold text-foreground">
              {isIndia ? `₹${baseMax} LPA` : `$${Math.round(baseMax * 9000)}/yr`}
            </p>
            <span className="text-[11px] text-muted-foreground">High-growth product firms</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" /> Key Skills Driving Higher Compensation:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {role.skills.map((skill, idx) => (
              <span key={idx} className="bg-background border border-border/60 px-2 py-0.5 rounded-md text-foreground font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
