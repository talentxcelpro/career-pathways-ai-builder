/**
 * TalentXcel Government Jobs Discovery Hub (/government-jobs)
 * Curated, authorized government and public-sector vacancy intelligence.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, Building, Search, MapPin, Calendar, Clock,
  ExternalLink, Filter, GraduationCap, ChevronRight,
  Globe, Sparkles, CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GovernmentJobBadge } from '@/components/jobs/GovernmentJobBadge';
import { FresherBadge } from '@/components/jobs/FresherBadge';
import { EmploymentNewsConnector } from '@/lib/jobs/connectors/india/EmploymentNewsConnector';
import { USAJobsConnector } from '@/lib/jobs/connectors/usajobs/USAJobsConnector';
import { CentralGovConnector } from '@/lib/jobs/connectors/india/CentralGovConnector';
import { StateGovConnector } from '@/lib/jobs/connectors/india/StateGovConnector';
import { PSUConnector } from '@/lib/jobs/connectors/india/PSUConnector';
import { GlobalJob } from '@/types/jobs/globalJob';
import { GOVERNMENT_COUNTRIES } from '@/config/jobs/governmentCountries';

export default function GovernmentJobs() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [fresherOnly, setFresherOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Instantiate connectors & gather verified vacancies
  const allVacancies = useMemo<GlobalJob[]>(() => {
    const en = new EmploymentNewsConnector();
    const upsc = new CentralGovConnector();
    const state = new StateGovConnector();
    const psu = new PSUConnector();
    const usajobs = new USAJobsConnector();

    // In a production backend these query the normalized jobs table; here we aggregate connector feeds
    const rawIndia = [
      ...en.discoverJobs(),
      ...upsc.discoverJobs(),
      ...state.discoverJobs(),
      ...psu.discoverJobs(),
    ];
    const rawUSA = usajobs.discoverJobs();

    // Map through connectors
    const indiaJobs = (en.discoverJobs() as any[]).map((r) => en.normalize(r));
    const upscJobs = (upsc.discoverJobs() as any[]).map((r) => upsc.normalize(r));
    const stateJobs = (state.discoverJobs() as any[]).map((r) => state.normalize(r));
    const psuJobs = (psu.discoverJobs() as any[]).map((r) => psu.normalize(r));
    const usaJobs = (usajobs.discoverJobs() as any[]).map((r) => usajobs.normalize(r));

    return [...indiaJobs, ...upscJobs, ...stateJobs, ...psuJobs, ...usaJobs];
  }, []);

  const filteredJobs = useMemo(() => {
    return allVacancies.filter((job) => {
      // Country
      if (selectedCountry !== 'ALL' && job.country_code !== selectedCountry) {
        return false;
      }
      // Level
      if (selectedLevel !== 'ALL') {
        if (selectedLevel === 'FEDERAL' && job.government_level !== 'FEDERAL') return false;
        if (selectedLevel === 'STATE' && job.government_level !== 'STATE') return false;
        if (selectedLevel === 'PUBLIC_SECTOR' && job.government_level !== 'PUBLIC_SECTOR') return false;
      }
      // Fresher
      if (fresherOnly && !job.accepts_freshers) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${job.title} ${job.employer.legal_name} ${job.employer.display_name} ${job.city} ${job.advt_number}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [allVacancies, selectedCountry, selectedLevel, fresherOnly, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Helmet>
        <title>Government & Public Sector Jobs | TalentXcel Intelligence</title>
        <meta
          name="description"
          content="Explore verified Central Government, State, PSU, and Federal vacancies with official notification links and AI eligibility assessment."
        />
        <link rel="canonical" href="https://talentxcel.in/government-jobs" />
      </Helmet>

      {/* Hero Header */}
      <div className="border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Official Government Jobs Intelligence
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Zero Fake Notices · 100% Provenance
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Government & Public-Sector Vacancies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Verified recruitment notifications from official gazettes, central commissions, public sector undertakings, and federal portals.
            Candidate applications route directly to official portals.
          </p>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={fresherOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFresherOnly(!fresherOnly)}
              className={fresherOnly ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400'}
            >
              <GraduationCap className="h-4 w-4 mr-1.5" />
              🎓 Freshers / Graduate Trainees
            </Button>

            <Button
              variant={selectedLevel === 'ALL' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('ALL')}
            >
              All Vacancies
            </Button>
            <Button
              variant={selectedLevel === 'FEDERAL' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('FEDERAL')}
            >
              🏛️ Central / Federal
            </Button>
            <Button
              variant={selectedLevel === 'STATE' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('STATE')}
            >
              📍 State Government
            </Button>
            <Button
              variant={selectedLevel === 'PUBLIC_SECTOR' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('PUBLIC_SECTOR')}
            >
              ⚡ PSU / Maharatna
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Search & Country Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by post, ministry (e.g. UPSC, NTPC, IOCL, Cyber), or location..."
              className="pl-9 h-11 text-sm bg-card"
            />
          </div>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-56 h-11 bg-card">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">🌐 All Countries</SelectItem>
              {GOVERNMENT_COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground font-semibold">{filteredJobs.length}</strong> verified vacancies
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Official Application Redirect Enforced
          </span>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center bg-card/60">
            <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold">No vacancies matching criteria</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search terms or clearing the fresher/level filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLevel('ALL');
                setFresherOnly(false);
                setSearchQuery('');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/90 overflow-hidden"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <GovernmentJobBadge level={job.government_level} countryCode={job.country_code} />
                        {job.accepts_freshers && <FresherBadge size="sm" />}
                        {job.advt_number && (
                          <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                            Advt: {job.advt_number}
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors">
                        <Link to={`/government-jobs/detail/${job.id}`}>
                          {job.title}
                        </Link>
                      </h2>

                      <p className="text-xs font-medium text-muted-foreground">
                        {job.employer.legal_name}
                      </p>
                    </div>

                    {job.salary?.original_display && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {job.salary.original_display}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Official Pay Band</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.summary || job.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30 flex-wrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {job.city || job.country_name}
                      </span>
                      {job.valid_through && (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Closes {new Date(job.valid_through).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs font-medium"
                      >
                        <Link to={`/government-jobs/detail/${job.id}`}>
                          View Details & Eligibility
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        className="h-8 text-xs font-medium bg-primary text-primary-foreground shadow-xs"
                        onClick={() => window.open(job.application_url, '_blank', 'noopener,noreferrer')}
                      >
                        Official Apply
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
