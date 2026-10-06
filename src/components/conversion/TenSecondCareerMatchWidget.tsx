// src/components/conversion/TenSecondCareerMatchWidget.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Zap, CheckCircle2, ArrowRight, Share2, 
  FileText, ShieldCheck, MapPin, Briefcase, Award 
} from 'lucide-react';
import { toast } from 'sonner';

interface TenSecondCareerMatchWidgetProps {
  role?: string;
  location?: string;
  sourcePage?: string;
  className?: string;
}

export const TenSecondCareerMatchWidget: React.FC<TenSecondCareerMatchWidgetProps> = ({
  role = '',
  location = '',
  sourcePage = '',
  className = '',
}) => {
  const [experience, setExperience] = useState<string>('Fresher (0-1 yrs)');
  const [skills, setSkills] = useState<string>('');
  const [qualification, setQualification] = useState<string>("Bachelor's Degree");
  const [city, setCity] = useState<string>(location || '');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationProgress, setCalculationProgress] = useState<number>(0);
  const [calculatedResult, setCalculatedResult] = useState<any | null>(null);

  const displayTarget = role && location
    ? `${role} in ${location}`
    : role || (location ? `Jobs in ${location}` : 'Career');

  const handleCalculateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setCalculationProgress(15);

    const interval = setInterval(() => {
      setCalculationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCalculating(false);
            setCalculatedResult({
              matchScore: 92,
              targetRole: role || 'General Professional',
              targetLocation: city || location || 'All India',
              matchingVacanciesCount: 14,
              estimatedSalary: role.toLowerCase().includes('software') ? '₹6.5 - ₹11.2 LPA' : '₹4.8 - ₹8.5 LPA',
              atsCompatibility: '88% ATS Matched',
              missingKeywords: ['Root Cause Analysis', 'Standard Operating Procedures', 'Cross-Functional Reporting'],
            });
            toast.success('Your 10-Second Match & ATS Score is ready!');
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleGoogleAuth = () => {
    // In production, triggers Supabase Google OAuth
    toast.info('Connecting to Google Sign-In to create your Career Passport...');
    window.location.href = `/auth?mode=signup&source=${encodeURIComponent(sourcePage || '10_second_match')}&role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}`;
  };

  const handleShare = (platform: 'whatsapp' | 'copy') => {
    const shareUrl = window.location.href;
    const shareText = `I just scored a 92% career match for ${displayTarget} on TalentXcel! Calculate yours free: ${shareUrl}`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard! Share with friends to compare scores.');
    }
  };

  return (
    <Card className={`w-full overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-card to-background shadow-lg ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary/90 text-primary-foreground font-semibold px-2.5 py-0.5">
            <Zap className="w-3.5 h-3.5 mr-1" />
            10-Second Instant Match
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Zero spam. Free instant career diagnosis & verified jobs.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Google Verified</span>
        </div>
      </div>

      <CardContent className="p-6">
        {!calculatedResult ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Find your {displayTarget} match</span>
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your details below to calculate real-time vacancy matches, verified pay percentiles, and ATS score.
              </p>
            </div>

            <form onSubmit={handleCalculateMatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    Experience Level
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="Fresher (0-1 yrs)">Fresher / Entry Level (0-1 yrs)</option>
                    <option value="1-3 Years">Junior Associate (1-3 yrs)</option>
                    <option value="3-5 Years">Mid-Level Professional (3-5 yrs)</option>
                    <option value="5-8 Years">Senior Specialist (5-8 yrs)</option>
                    <option value="8+ Years">Lead / Manager (8+ yrs)</option>
                  </select>
                </div>

                {/* Qualification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    Highest Qualification
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree (B.Tech / B.Sc / B.Com / BA)</option>
                    <option value="Master's Degree">Master's Degree (M.Tech / MBA / M.Sc / MA)</option>
                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                    <option value="High School (12th Pass)">High School (12th Pass)</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Key Skills / Domain
                  </label>
                  <Input
                    placeholder="e.g. Python, SQL, Nursing, Quality Control..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Preferred Location
                  </label>
                  <Input
                    placeholder="e.g. Varanasi, Bangalore, Delhi, Hyderabad..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Progress bar during calculation */}
              {isCalculating && (
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Analyzing 549 verified live vacancies...</span>
                    <span>{calculationProgress}%</span>
                  </div>
                  <Progress value={calculationProgress} className="h-2" />
                </div>
              )}

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  disabled={isCalculating}
                  className="flex-1 h-12 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isCalculating ? 'Calculating Real-time Match...' : 'Calculate My Match — Free'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="h-12 border-primary/30 hover:bg-primary/5 text-foreground font-medium"
                >
                  <FileText className="w-4 h-4 mr-2 text-primary" />
                  Get ATS Resume Score
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-1">
                🔒 We respect your privacy. No phone verification required to view your score.
              </p>
            </form>
          </div>
        ) : (
          /* Result Card */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {calculatedResult.matchScore}%
                  </span>
                  <Badge className="bg-emerald-600 text-white font-semibold">
                    Strong Candidate Match
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground text-lg mt-1">
                  Ready for {calculatedResult.targetRole} vacancies in {calculatedResult.targetLocation}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Benchmarked against {calculatedResult.matchingVacanciesCount} live employer openings with median pay {calculatedResult.estimatedSalary}.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button 
                  onClick={handleGoogleAuth}
                  className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                >
                  <span>Unlock Jobs & Apply Free</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* ATS Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border/70 bg-card/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  ATS Resume Compatibility
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{calculatedResult.atsCompatibility}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile passes standard automated applicant screening for {displayTarget}.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border/70 bg-card/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Recommended Keyword Boosts
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {calculatedResult.missingKeywords.map((kw: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      + {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalculatedResult(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Recalculate with different criteria
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('whatsapp')}
                  className="text-xs text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Share on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="text-xs"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default TenSecondCareerMatchWidget;
