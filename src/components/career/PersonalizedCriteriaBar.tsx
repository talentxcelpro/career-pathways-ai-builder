// src/components/career/PersonalizedCriteriaBar.tsx
// High-End Dynamic Career Intelligence Criteria Personalizer
// Allows any candidate to dynamically calibrate their profile lens (Role, Skills, Exp, Age, Location, Education, Salary)
// Instant live synchronization across Career Dashboard, Readiness Score, and Compensation Insights

import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, UserCheck, MapPin, Briefcase, 
  GraduationCap, Sparkles, Plus, X, Check, Save, RotateCcw, 
  Globe, Laptop, Clock, ArrowRight, CheckCircle2, Coins, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { 
  UserCareerCriteria, PERSONA_PRESETS, PersonaPreset 
} from '@/utils/careerIntelligence';

interface PersonalizedCriteriaBarProps {
  criteria: UserCareerCriteria;
  onCriteriaChange: (newCriteria: UserCareerCriteria) => void;
  onSaveToProfile?: () => Promise<void>;
  isSaving?: boolean;
  isOpenControlled?: boolean;
  onOpenControlledChange?: (open: boolean) => void;
}

const COMMON_ROLES = [
  'Python & AI Solutions Engineer',
  'Senior Fullstack Engineer',
  'Lead Product Manager',
  'Data Scientist & ML Engineer',
  'Cloud & DevOps Architect',
  'Frontend Engineer (React/Next.js)',
  'Backend Engineer (FastAPI/Go)'
];

const COMMON_LOCATIONS = [
  'Bangalore, India',
  'Mumbai, India',
  'Delhi-NCR, India',
  'Hyderabad, India',
  'Pune, India',
  'San Francisco, USA',
  'London, UK',
  'Dubai, UAE',
  'Remote Worldwide'
];

const COMMON_EDUCATION = [
  "Bachelor's Degree (B.Tech / B.E)",
  "Master's Degree (M.Tech / M.S)",
  'Master of Business Administration (MBA)',
  "Bachelor's Degree (BCA / B.Sc)",
  'Master in Computer Applications (MCA)',
  'Ph.D. / Doctorate',
  'Self-Taught / Industry Certified'
];

const ROLE_SUGGESTED_SKILLS: Record<string, string[]> = {
  python: ['FastAPI', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'LangChain', 'PyTorch'],
  frontend: ['TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Redux', 'Web Performance'],
  product: ['Product Analytics', 'SQL', 'Agile / Scrum', 'GTM Strategy', 'User Research', 'JIRA'],
  data: ['Python', 'SQL', 'PyTorch', 'Pandas', 'BigQuery', 'MLflow', 'Tableau'],
  devops: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'AWS', 'Linux', 'Grafana'],
  default: ['System Design', 'Docker', 'SQL', 'Git', 'RESTful APIs', 'Cloud Architecture']
};

export const PersonalizedCriteriaBar: React.FC<PersonalizedCriteriaBarProps> = ({
  criteria,
  onCriteriaChange,
  onSaveToProfile,
  isSaving = false,
  isOpenControlled,
  onOpenControlledChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;
  const setIsOpen = onOpenControlledChange || setInternalOpen;

  const sanitizeCriteria = (c?: UserCareerCriteria): UserCareerCriteria => ({
    fullName: c?.fullName || 'Arshid Hussain Wani',
    targetRole: c?.targetRole || 'Python & AI Solutions Engineer',
    experienceYears: c?.experienceYears ?? 4,
    ageBracket: c?.ageBracket || '25-29 years',
    location: c?.location || 'Bangalore, India',
    isRemote: c?.isRemote ?? true,
    educationLevel: c?.educationLevel || "Bachelor's Degree (B.Tech)",
    fieldOfStudy: c?.fieldOfStudy || 'Computer Science & Engineering',
    skills: Array.isArray(c?.skills) && c.skills.length > 0 
      ? [...c.skills] 
      : ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'],
    desiredSalaryMin: c?.desiredSalaryMin || 1400000,
    desiredSalaryMax: c?.desiredSalaryMax || 2800000,
    careerStage: c?.careerStage || 'mid'
  });

  const [tempCriteria, setTempCriteria] = useState<UserCareerCriteria>(() => sanitizeCriteria(criteria));
  const [newSkillInput, setNewSkillInput] = useState('');
  const [activePersonaId, setActivePersonaId] = useState<string>('current_user');

  useEffect(() => {
    setTempCriteria(sanitizeCriteria(criteria));
  }, [criteria]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempCriteria(sanitizeCriteria(criteria));
    }
    setIsOpen(open);
  };

  const handleApplyChanges = () => {
    onCriteriaChange(tempCriteria);
    setIsOpen(false);
  };

  const handleSelectPreset = (preset: PersonaPreset) => {
    setActivePersonaId(preset.id);
    const sanitized = sanitizeCriteria(preset.criteria);
    setTempCriteria(sanitized);
    onCriteriaChange(sanitized);
  };

  const handleAddSkill = (skillToAdd?: string) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    const currentList = Array.isArray(tempCriteria?.skills) ? tempCriteria.skills : [];
    if (trimmed && !currentList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setTempCriteria({
        ...tempCriteria,
        skills: [...currentList, trimmed]
      });
      if (!skillToAdd) setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentList = Array.isArray(tempCriteria?.skills) ? tempCriteria.skills : [];
    setTempCriteria({
      ...tempCriteria,
      skills: currentList.filter(s => s !== skillToRemove)
    });
  };

  // Resolve skill recommendations for active role
  const suggestedSkills = React.useMemo(() => {
    const roleLower = (tempCriteria.targetRole || '').toLowerCase();
    let key = 'default';
    if (roleLower.includes('python') || roleLower.includes('ai')) key = 'python';
    else if (roleLower.includes('front') || roleLower.includes('react')) key = 'frontend';
    else if (roleLower.includes('product')) key = 'product';
    else if (roleLower.includes('data')) key = 'data';
    else if (roleLower.includes('devops') || roleLower.includes('cloud')) key = 'devops';

    const baseList = ROLE_SUGGESTED_SKILLS[key] || ROLE_SUGGESTED_SKILLS.default;
    const currentList = (tempCriteria.skills || []).map(s => s.toLowerCase());
    return baseList.filter(s => !currentList.includes(s.toLowerCase())).slice(0, 5);
  }, [tempCriteria.targetRole, tempCriteria.skills]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-4.5 shadow-xs hover:shadow-sm transition-all space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        
        {/* Active Criteria Overview Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Profile Lens Badge */}
          <div className="flex items-center gap-2 font-black text-[#111827] bg-gradient-to-r from-blue-50 to-indigo-50/80 px-3 py-1.5 rounded-xl border border-blue-200/90 shadow-2xs">
            <UserCheck className="h-4 w-4 text-[#2563EB]" />
            <span className="text-slate-600 font-bold">Profile Lens:</span>
            <span className="text-[#2563EB] font-black">{criteria.targetRole}</span>
          </div>

          {/* Experience & Age */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] text-slate-700 font-bold">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>{criteria.experienceYears}y exp</span>
            {criteria.ageBracket && <span className="text-slate-400 font-medium">({criteria.ageBracket})</span>}
          </div>

          {/* Location & Remote */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] text-slate-700 font-bold">
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span>{criteria.location}</span>
            {criteria.isRemote && (
              <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">
                Remote
              </Badge>
            )}
          </div>

          {/* Education */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] text-slate-700 font-bold truncate max-w-[200px] sm:max-w-none">
            <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
            <span className="truncate">{criteria.educationLevel}</span>
          </div>

          {/* Skills Portfolio Count */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] text-slate-700 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>{(criteria?.skills || []).length} Verified Skills</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end lg:self-auto flex-shrink-0">
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-2 shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
                <span>Customize Profile Lens</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-[#E2E8F0] shadow-2xl p-6 sm:p-7">
              <DialogHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-bold w-fit mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>TalentXcel Dynamic Intelligence Customizer</span>
                </div>
                <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-black text-[#111827]">
                  Personalize Your Career Criteria
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-[#475569]">
                  Every candidate brings unique background, skills, age, education, and salary goals. Modify any dimension below to dynamically recalibrate your readiness score, matching opportunities, and salary insights.
                </DialogDescription>
              </DialogHeader>

              {/* 1-Click Quick Presets */}
              <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-[#E2E8F0] space-y-2 mt-2">
                <div className="text-xs font-bold text-[#111827] flex items-center justify-between">
                  <span>Instant Test Personas (1-Click Demo)</span>
                  <span className="text-[11px] text-[#2563EB] font-bold">Fast switch</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERSONA_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={activePersonaId === preset.id ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                        activePersonaId === preset.id 
                          ? 'bg-[#2563EB] text-white shadow-xs' 
                          : 'bg-white text-slate-700 border-[#E2E8F0] hover:bg-blue-50 hover:text-[#2563EB]'
                      }`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      {preset.label.split(' ')[0]} ({preset.criteria.experienceYears}y)
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 py-3 text-xs sm:text-sm">
                {/* Full Name & Target Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Candidate Name</Label>
                    <Input
                      value={tempCriteria.fullName}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, fullName: e.target.value })}
                      placeholder="e.g. Arshid Hussain Wani"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Target Role / Job Title</Label>
                    <Input
                      value={tempCriteria.targetRole}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, targetRole: e.target.value })}
                      placeholder="e.g. Python & AI Solutions Engineer"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                    {/* Auto-suggest pills */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {COMMON_ROLES.slice(0, 4).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTempCriteria({ ...tempCriteria, targetRole: r })}
                          className="text-[10px] text-[#2563EB] hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-bold cursor-pointer"
                        >
                          + {r.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience Slider & Age Bracket */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-[#111827]">Years of Experience</Label>
                      <span className="font-black text-[#2563EB] text-xs">{tempCriteria.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={tempCriteria.experienceYears}
                        onChange={(e) => setTempCriteria({ ...tempCriteria, experienceYears: Number(e.target.value) })}
                        className="w-full accent-[#2563EB] cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Age Range / Career Stage</Label>
                    <Input
                      value={tempCriteria.ageBracket || ''}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, ageBracket: e.target.value })}
                      placeholder="e.g. 25-29 years / Mid-Career"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                  </div>
                </div>

                {/* Location & Remote Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Primary Location</Label>
                    <Input
                      value={tempCriteria.location}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, location: e.target.value })}
                      placeholder="e.g. Bangalore, India"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {COMMON_LOCATIONS.slice(0, 4).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setTempCriteria({ ...tempCriteria, location: loc })}
                          className="text-[10px] text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg font-semibold cursor-pointer"
                        >
                          {loc.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center bg-slate-50 p-3 rounded-2xl border border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#111827]">Open to Remote Roles</span>
                        <p className="text-[11px] text-emerald-700 font-semibold">+12% verified remote premium</p>
                      </div>
                      <Switch
                        checked={tempCriteria.isRemote}
                        onCheckedChange={(checked) => setTempCriteria({ ...tempCriteria, isRemote: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Education Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Highest Education Degree</Label>
                    <Input
                      value={tempCriteria.educationLevel}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, educationLevel: e.target.value })}
                      placeholder="e.g. Bachelor's Degree (B.Tech)"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {COMMON_EDUCATION.slice(0, 3).map((edu) => (
                        <button
                          key={edu}
                          type="button"
                          onClick={() => setTempCriteria({ ...tempCriteria, educationLevel: edu })}
                          className="text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 font-bold cursor-pointer"
                        >
                          {edu.split('(')[1]?.replace(')', '') || edu.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#111827]">Field of Study / Discipline</Label>
                    <Input
                      value={tempCriteria.fieldOfStudy}
                      onChange={(e) => setTempCriteria({ ...tempCriteria, fieldOfStudy: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                      className="h-9 text-xs mt-1.5 rounded-xl border-[#CBD5E1]"
                    />
                  </div>
                </div>

                {/* Skills Taxonomy Manager */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#111827]">
                      Skills Portfolio ({(tempCriteria?.skills || []).length} active)
                    </Label>
                    <span className="text-[11px] text-slate-500">Tap (X) to remove, type below to add</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl border border-[#E2E8F0] min-h-[52px] mt-1.5">
                    {(tempCriteria?.skills || []).map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="text-xs bg-white text-slate-800 border border-[#CBD5E1] gap-1 pl-2.5 pr-1.5 py-1 rounded-xl font-bold shadow-2xs"
                      >
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Suggested skills pills */}
                  {suggestedSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Suggested for role:</span>
                      {suggestedSkills.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="text-[10px] text-[#2563EB] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Type a skill (e.g. Docker, PyTorch, AWS, Next.js, System Design)..."
                      className="h-9 text-xs rounded-xl border-[#CBD5E1]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => handleAddSkill()} 
                      className="h-9 text-xs px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 font-bold text-white cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100">
                {onSaveToProfile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs text-[#2563EB] border-blue-200 hover:bg-blue-50 rounded-xl font-bold cursor-pointer"
                    disabled={isSaving}
                    onClick={async () => {
                      onCriteriaChange(tempCriteria);
                      await onSaveToProfile();
                      setIsOpen(false);
                    }}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {isSaving ? 'Saving to Database...' : 'Save to Supabase Profile'}
                  </Button>
                )}
                <Button 
                  type="button" 
                  size="sm" 
                  className="text-xs bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl font-bold px-5 cursor-pointer shadow-xs"
                  onClick={handleApplyChanges}
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" /> Apply Criteria to Dashboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
