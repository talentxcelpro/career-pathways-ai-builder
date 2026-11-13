// src/components/products/jobmatch/AIMatchWorkspace.tsx
// "Find Jobs That Fit Me" — Genuine Profile Preferences & Match Assistant
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Bot, 
  FileText,
  Plus,
  X,
  LogIn,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CandidateProfileData, 
  calculateJobMatch, 
  parseNaturalLanguageQuery 
} from '@/services/jobs/aiJobMatchEngine';
import { JobDetailItem } from './JobDetailDrawer';

interface AIMatchWorkspaceProps {
  jobs: JobDetailItem[];
  onApplyJob: (job: JobDetailItem) => void;
  onOpenJobDetail: (job: JobDetailItem) => void;
  isSavedJob: (id: string) => boolean;
  onToggleSaveJob: (id: string) => void;
}

const EMPTY_PREFERENCES: CandidateProfileData = {
  fullName: '',
  title: '',
  skills: [],
  experienceYears: 0,
  currentLocation: '',
  openToRemote: true,
  expectedCtcLakhs: undefined,
  bio: ''
};

export const AIMatchWorkspace: React.FC<AIMatchWorkspaceProps> = ({
  jobs,
  onApplyJob,
  onOpenJobDetail,
  isSavedJob,
  onToggleSaveJob
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfileData>(EMPTY_PREFERENCES);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Natural Language Search State ("Search in Your Own Words")
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [nlFilterActive, setNlFilterActive] = useState(false);

  // Fetch real authenticated profile or load saved local preferences
  useEffect(() => {
    if (user) {
      loadAuthenticatedProfile(user.id);
    } else {
      try {
        const saved = localStorage.getItem('txc_user_preferences');
        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          setProfile(EMPTY_PREFERENCES);
        }
      } catch {
        setProfile(EMPTY_PREFERENCES);
      }
      setHasLoadedProfile(true);
    }
  }, [user]);

  const loadAuthenticatedProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, headline, title, skills, experience_years, years_of_experience, location, open_to_remote, preferred_salary_min, about, bio')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        let skillsArr: string[] = [];
        if (Array.isArray(data.skills)) skillsArr = data.skills;
        else if (typeof data.skills === 'string') skillsArr = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

        setProfile({
          id: data.id,
          fullName: data.full_name || '',
          title: data.headline || data.title || '',
          skills: skillsArr,
          experienceYears: data.years_of_experience || data.experience_years || 0,
          currentLocation: data.location || '',
          openToRemote: data.open_to_remote ?? true,
          expectedCtcLakhs: data.preferred_salary_min ? Math.round(data.preferred_salary_min / 100000) : undefined,
          bio: data.about || data.bio || ''
        });
      } else {
        // Logged-in user without a profile yet
        setProfile(EMPTY_PREFERENCES);
        setIsEditingProfile(true);
      }
    } catch (e) {
      console.warn('Error loading user profile:', e);
    } finally {
      setLoadingProfile(false);
      setHasLoadedProfile(true);
    }
  };

  const handleSavePreferences = async () => {
    try {
      localStorage.setItem('txc_user_preferences', JSON.stringify(profile));

      // If logged in, also persist to Supabase profiles
      if (user) {
        await supabase
          .from('profiles')
          .update({
            full_name: profile.fullName,
            headline: profile.title,
            skills: profile.skills,
            experience_years: profile.experienceYears,
            location: profile.currentLocation,
            open_to_remote: profile.openToRemote,
            preferred_salary_min: profile.expectedCtcLakhs ? profile.expectedCtcLakhs * 100000 : null
          })
          .eq('id', user.id);
      }

      toast.success('Preferences saved! Matching recommendations updated.');
      setIsEditingProfile(false);
    } catch {
      toast.error('Could not save preferences.');
    }
  };

  const handleAddSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    if (profile.skills.map(s => s.toLowerCase()).includes(clean.toLowerCase())) {
      toast.info('Skill already added');
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, clean]
    }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Conversational query parsing ("Search in Your Own Words")
  const parsedNl = useMemo(() => {
    if (!naturalLanguageQuery.trim()) return null;
    return parseNaturalLanguageQuery(naturalLanguageQuery);
  }, [naturalLanguageQuery]);

  // Compute live match scores for real vacancies
  const hasUserPreferences = profile.skills.length > 0 || profile.title.trim().length > 0;

  const matchedVacancies = useMemo(() => {
    let list = jobs;

    // Apply natural language filters if active
    if (parsedNl && nlFilterActive) {
      list = list.filter(job => {
        if (parsedNl.cityFilter !== 'all') {
          const loc = `${job.location_city || ''} ${job.location || ''}`.toLowerCase();
          if (!loc.includes(parsedNl.cityFilter)) return false;
        }
        if (parsedNl.workModeFilter === 'remote' && !job.is_remote && !(job.location || '').toLowerCase().includes('remote')) {
          return false;
        }
        if (parsedNl.minSalaryLakhs && (job.salary_min || 0) < parsedNl.minSalaryLakhs * 100000) {
          return false;
        }
        if (parsedNl.parsedKeywords.length > 0) {
          const jobText = `${job.title} ${job.company_name} ${(job.skills_required || []).join(' ')} ${job.department || ''}`.toLowerCase();
          const matchesKeyword = parsedNl.parsedKeywords.some(kw => jobText.includes(kw));
          if (!matchesKeyword) return false;
        }
        return true;
      });
    }

    // If user has defined preferences, calculate real compatibility score
    if (hasUserPreferences) {
      const scored = list.map(job => {
        const match = calculateJobMatch(profile, job);
        return { job, match };
      });
      return scored.sort((a, b) => b.match.score - a.match.score);
    }

    // Otherwise return clean list without arbitrary percentages
    return list.map(job => ({
      job,
      match: null
    }));
  }, [jobs, profile, parsedNl, nlFilterActive, hasUserPreferences]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-left">
      {/* Top Banner: Real User Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User Preferences Card */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">My Job Preferences</h3>
                <p className="text-[11px] text-[#64748B]">Used to find vacancies matching your background</p>
              </div>
            </div>
            
            {hasUserPreferences && !isEditingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                className="text-xs font-semibold text-[#2563EB] border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl h-8 px-3"
              >
                Edit
              </Button>
            )}
          </div>

          {/* STATE A: User NOT logged in & no preferences entered */}
          {!user && !hasUserPreferences && !isEditingProfile ? (
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-center space-y-3">
              <Sparkles className="w-6 h-6 text-[#2563EB] mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#111827]">Get better job recommendations</h4>
                <p className="text-xs text-[#64748B]">
                  Enter your target role and skills below to discover relevant vacancies from the 2,200+ database.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Enter My Preferences
                </Button>
                <a 
                  href="/auth/login"
                  className="text-[11px] text-[#2563EB] hover:underline font-semibold"
                >
                  Or sign in to load your saved profile →
                </a>
              </div>
            </div>
          ) : isEditingProfile ? (
            /* STATE B: Editing / Creating Preferences */
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#111827]">Your Target Role / Title:</label>
                <Input 
                  value={profile.title} 
                  onChange={(e) => setProfile(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Software Engineer, Marketing Manager, Trainee..."
                  className="h-8 text-xs bg-[#F4F7FC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Years of Experience:</label>
                  <Input 
                    type="number"
                    min="0"
                    max="40"
                    value={profile.experienceYears || ''} 
                    onChange={(e) => setProfile(p => ({ ...p, experienceYears: Number(e.target.value) || 0 }))}
                    placeholder="e.g. 3"
                    className="h-8 text-xs bg-[#F4F7FC]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Preferred City:</label>
                  <Input 
                    value={profile.currentLocation} 
                    onChange={(e) => setProfile(p => ({ ...p, currentLocation: e.target.value }))}
                    placeholder="e.g. Bengaluru, Pune..."
                    className="h-8 text-xs bg-[#F4F7FC]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111827]">Add Your Skills:</label>
                <div className="flex gap-1.5">
                  <Input 
                    value={newSkillInput} 
                    placeholder="Type skill & press Enter (e.g. React, SQL, CAD)..."
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(newSkillInput))}
                    className="h-8 text-xs bg-[#F4F7FC]"
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="h-8 px-3 text-xs bg-[#2563EB] text-white rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                  {profile.skills.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs text-[#2563EB] font-semibold flex items-center gap-1"
                    >
                      <span>{s}</span>
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="openToRemoteCheck"
                  checked={profile.openToRemote}
                  onChange={(e) => setProfile(p => ({ ...p, openToRemote: e.target.checked }))}
                  className="rounded text-[#2563EB]"
                />
                <label htmlFor="openToRemoteCheck" className="text-xs text-[#475569] cursor-pointer">
                  Open to Remote / Work from Home roles
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
                {hasUserPreferences && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Save Preferences & Show Matches
                </Button>
              </div>
            </div>
          ) : (
            /* STATE C: Genuine Saved Preferences Display */
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="font-bold text-sm text-[#111827]">
                  {profile.title || 'Preferred Roles'}
                </div>
                {profile.fullName && (
                  <div className="text-[11px] text-[#64748B]">Profile name: {profile.fullName}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Experience</span>
                  <span className="font-bold text-xs text-[#111827]">{profile.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Location</span>
                  <span className="font-bold text-xs text-[#111827] truncate block">{profile.currentLocation || 'Any'}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1.5">
                  Your Skills ({profile.skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-xs text-[#2563EB] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 text-[11px] text-[#64748B]">
                Remote preference: <strong className="text-emerald-700">{profile.openToRemote ? 'Open to Remote' : 'Onsite'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Search in Your Own Words Card */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7138E8]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Search in Your Own Words</h3>
              <p className="text-[11px] text-[#64748B]">Type what you are looking for in plain English</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                value={naturalLanguageQuery}
                onChange={(e) => {
                  setNaturalLanguageQuery(e.target.value);
                  if (!e.target.value.trim()) setNlFilterActive(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setNlFilterActive(true)}
                placeholder="e.g. Remote Python roles in Bangalore paying over 15 LPA..."
                className="bg-[#F4F7FC] border-[#E2E8F0] text-xs h-10 text-[#111827]"
              />
              <Button 
                onClick={() => setNlFilterActive(true)}
                className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 rounded-xl h-10 shrink-0"
              >
                Search
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-[#64748B] font-semibold">Examples:</span>
              {[
                'Remote Python roles in Bangalore',
                'Junior Trainee Engineer in Pune',
                'Operations or Marketing in Mumbai'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNaturalLanguageQuery(prompt);
                    setNlFilterActive(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] hover:bg-slate-200 text-[#475569] border border-[#E2E8F0] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {parsedNl && nlFilterActive && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#2563EB]">Active Search Filters:</span>
                  {parsedNl.parsedKeywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-[#2563EB] bg-white border-blue-200 text-[10px]">
                      {kw}
                    </Badge>
                  ))}
                  {parsedNl.cityFilter !== 'all' && (
                    <Badge variant="outline" className="text-purple-700 bg-white border-purple-200 text-[10px]">
                      City: {parsedNl.cityFilter}
                    </Badge>
                  )}
                  {parsedNl.workModeFilter !== 'all' && (
                    <Badge variant="outline" className="text-emerald-700 bg-white border-emerald-200 text-[10px]">
                      Mode: {parsedNl.workModeFilter}
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNaturalLanguageQuery('');
                    setNlFilterActive(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 h-7 px-2"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Real Vacancies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="font-bold text-base text-[#111827]">
              {hasUserPreferences ? 'Vacancies Matched to Your Preferences' : 'All Verified Opportunities'}
            </h3>
            <p className="text-xs text-[#64748B]">
              {hasUserPreferences 
                ? 'Showing real jobs ordered by matching skills and criteria.' 
                : 'Enter your skills on the left to see personalized match reasons.'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {matchedVacancies.length} Real Vacancies
          </span>
        </div>

        {matchedVacancies.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-2xl space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#111827]">No vacancies found matching these criteria</h4>
            <p className="text-xs text-[#64748B]">Try broadening your search words or clearing location filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedVacancies.slice(0, 20).map(({ job, match }) => {
              const isSaved = isSavedJob(job.id);
              const salaryFormatted = job.salary_min 
                ? `₹${(job.salary_min/100000).toFixed(1)}L - ₹${((job.salary_max || job.salary_min)/100000).toFixed(1)}L CTC`
                : null;

              return (
                <Card 
                  key={job.id}
                  className="bg-white border-[#E2E8F0] hover:border-[#2563EB] transition-all rounded-2xl p-5 shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-[#2563EB]">{job.company_name}</span>
                        <h4 
                          onClick={() => onOpenJobDetail(job)}
                          className="font-bold text-sm sm:text-base text-[#111827] hover:text-[#2563EB] cursor-pointer transition-colors leading-snug mt-0.5"
                        >
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'India'}</span>
                          {salaryFormatted && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">{salaryFormatted}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Transparent Match Reason or Verified Badge */}
                      {match && match.score > 0 ? (
                        <div className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-center shrink-0">
                          <span className="text-xs font-bold text-[#2563EB]">{match.score}% Fit</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Matched skills indicator if preferences exist */}
                    {match && match.matchedSkills.length > 0 && (
                      <div className="text-xs flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Matches:</span>
                        {match.matchedSkills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenJobDetail(job)}
                        className="text-xs text-[#2563EB] hover:text-[#7138E8] p-0 font-bold"
                      >
                        View Details →
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleSaveJob(job.id)}
                          className={`h-8 px-2.5 text-xs rounded-xl ${isSaved ? 'text-amber-500 fill-amber-500' : ''}`}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApplyJob(job)}
                          className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold h-8 px-4 rounded-xl shadow-xs"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
