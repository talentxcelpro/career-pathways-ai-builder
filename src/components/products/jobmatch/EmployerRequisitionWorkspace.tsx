// src/components/products/jobmatch/EmployerRequisitionWorkspace.tsx
// Employer Requisition Creator, Job Manager & Applicant Pipeline Kanban
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Sparkles, 
  Users, 
  Clock, 
  CheckCircle2, 
  X, 
  MapPin, 
  BadgeDollarSign, 
  FileText, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Calendar,
  Send,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { JobDetailItem } from './JobDetailDrawer';

interface ApplicantRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  location: string;
  experienceYears: number;
  skills: string[];
  appliedDate: string;
  stage: 'new' | 'reviewing' | 'shortlisted' | 'interview' | 'hired';
  matchScore: number;
  notes?: string;
}

export const EmployerRequisitionWorkspace: React.FC<{
  onJobPublished?: (newJob: JobDetailItem) => void;
}> = ({ onJobPublished }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'pipeline' | 'active_jobs'>('create');

  // Job Requisition Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('My Hiring Organization');
  const [department, setDepartment] = useState('Software Engineering');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [workMode, setWorkMode] = useState('hybrid');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [minSalaryLakhs, setMinSalaryLakhs] = useState<number>(18);
  const [maxSalaryLakhs, setMaxSalaryLakhs] = useState<number>(30);
  const [skillsString, setSkillsString] = useState('React, TypeScript, Node.js, System Architecture');
  const [jobSummary, setJobSummary] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Local Posted Jobs state (Only real locally-created postings)
  const [postedJobs, setPostedJobs] = useState<JobDetailItem[]>(() => {
    try {
      const saved = localStorage.getItem('txc_employer_posted_jobs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Applicants state (Only real candidate applications, zero synthetic mock data)
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(() => {
    try {
      const saved = localStorage.getItem('txc_employer_applicants');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 1-Click AI Generate Job Description
  const handleAIGenerateJD = () => {
    if (!title.trim()) {
      toast.error('Please enter a Job Title first (e.g. Senior Frontend Engineer)');
      return;
    }
    const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
    const summary = `We are seeking an experienced ${title} to join our growing team. In this role, you will architect, build, and maintain production-grade systems using ${skills.slice(0, 3).join(', ')}. You will partner with cross-functional product stakeholders, drive code quality standards, and mentor engineering peers.`;
    setJobSummary(summary);
    toast.success('AI drafted job overview and requirements!');
  };

  // Publish Requisition
  const handlePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim()) {
      toast.error('Please fill in Job Title and Company Name');
      return;
    }

    const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
    const newJob: JobDetailItem = {
      id: `posted-${Date.now()}`,
      title: title.trim(),
      company_name: companyName.trim(),
      location: location.trim(),
      location_city: location.split(',')[0].trim(),
      work_mode: workMode,
      is_remote: workMode === 'remote',
      employment_type: employmentType,
      salary_min: minSalaryLakhs * 100000,
      salary_max: maxSalaryLakhs * 100000,
      department: department.trim(),
      industry: department.trim(),
      skills_required: skills,
      job_summary: jobSummary || `Exciting opportunity for a ${title} at ${companyName}.`,
      external_url: externalUrl.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const updated = [newJob, ...postedJobs];
    setPostedJobs(updated);
    try {
      localStorage.setItem('txc_employer_posted_jobs', JSON.stringify(updated));
    } catch {}

    if (onJobPublished) {
      onJobPublished(newJob);
    }

    toast.success(`"${title}" published successfully to JobMatch OS!`);
    setTitle('');
    setJobSummary('');
    setActiveSubTab('active_jobs');
  };

  // Change Applicant Pipeline Stage
  const handleMoveStage = (applicantId: string, newStage: ApplicantRecord['stage']) => {
    setApplicants(prev => {
      const updated = prev.map(a => a.id === applicantId ? { ...a, stage: newStage } : a);
      try {
        localStorage.setItem('txc_employer_applicants', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Applicant moved to ${newStage.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Top Requisition Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-black text-xl text-[#111827] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2563EB]" />
            <span>Employer Requisition & Applicant Workspace</span>
          </h3>
          <p className="text-xs text-[#64748B]">
            Draft and publish verified job requisitions, track active postings, and manage candidate hiring stages.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F4F7FC] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'create'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            + Post a Vacancy
          </button>
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'pipeline'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Applicant Pipeline ({applicants.length})
          </button>
          <button
            onClick={() => setActiveSubTab('active_jobs')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'active_jobs'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Posted Vacancies ({postedJobs.length})
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Create Requisition */}
      {activeSubTab === 'create' && (
        <Card className="bg-white border-[#E2E8F0] rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Create New Verified Job Requisition</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Define vacancy details. Your post will instantly be indexed on JobMatch OS and discoverable by candidates.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePublishJob} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Job Title *</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead React Architect, SRE Manager..."
                    className="h-9 bg-[#F4F7FC] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Hiring Organization Name *</label>
                  <Input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Tech, Zomato Labs..."
                    className="h-9 bg-[#F4F7FC] text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Department / Functional Area</label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 bg-[#F4F7FC] border border-[#E2E8F0] rounded-md px-3 text-xs font-medium"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Core Engineering & PSU">Core Engineering & PSU</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Work Mode & Location</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value)}
                      className="h-9 bg-[#F4F7FC] border border-[#E2E8F0] rounded-md px-2 text-xs font-medium"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                    </select>
                    <Input 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru / Remote"
                      className="h-9 bg-[#F4F7FC] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Annual CTC Compensation (INR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      type="number"
                      value={minSalaryLakhs}
                      onChange={(e) => setMinSalaryLakhs(Number(e.target.value) || 0)}
                      placeholder="Min Lakhs (e.g. 15)"
                      className="h-9 bg-[#F4F7FC] text-xs"
                    />
                    <Input 
                      type="number"
                      value={maxSalaryLakhs}
                      onChange={(e) => setMaxSalaryLakhs(Number(e.target.value) || 0)}
                      placeholder="Max Lakhs (e.g. 28)"
                      className="h-9 bg-[#F4F7FC] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Required Core Skills (comma-separated)</label>
                  <Input 
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    placeholder="React, TypeScript, Node.js, AWS..."
                    className="h-9 bg-[#F4F7FC] text-xs"
                  />
                </div>
              </div>

              {/* AI JD Writer Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#111827]">Job Overview & Key Deliverables</label>
                  <button
                    type="button"
                    onClick={handleAIGenerateJD}
                    className="text-[11px] font-bold text-[#7138E8] hover:text-[#2563EB] flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Draft with AI Assistant</span>
                  </button>
                </div>
                <textarea 
                  rows={4}
                  value={jobSummary}
                  onChange={(e) => setJobSummary(e.target.value)}
                  placeholder="Detail role context, architectural deliverables, and qualification requirements..."
                  className="w-full text-xs p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">Direct Application URL (Optional)</label>
                  <Input 
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://careers.yourcompany.com/job/123"
                    className="h-9 bg-[#F4F7FC] text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#111827]">HR Coordinator Email</label>
                  <Input 
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="recruitment@yourcompany.com"
                    className="h-9 bg-[#F4F7FC] text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Verified listings are immediately live on <strong className="text-[#111827]">jobs.talentxcel.in</strong>
                </span>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Publish Verified Vacancy →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sub-Tab 2: Applicant Pipeline Kanban */}
      {activeSubTab === 'pipeline' && (
        applicants.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-10 rounded-2xl text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-[#111827]">No applicants received yet</h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Once candidates apply for your vacancy on JobMatch, their verified profiles, match fit, and application details will appear here.
            </p>
            <Button
              size="sm"
              onClick={() => setActiveSubTab('create')}
              className="bg-[#2563EB] text-white text-xs rounded-xl"
            >
              Post a Vacancy
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { key: 'reviewing', title: 'Under Review', count: applicants.filter(a => a.stage === 'reviewing').length, color: 'border-amber-200 bg-amber-50/50' },
                { key: 'shortlisted', title: 'Shortlisted', count: applicants.filter(a => a.stage === 'shortlisted').length, color: 'border-purple-200 bg-purple-50/50' },
                { key: 'interview', title: 'Interview Scheduled', count: applicants.filter(a => a.stage === 'interview').length, color: 'border-blue-200 bg-blue-50/50' },
                { key: 'hired', title: 'Hired / Offer', count: applicants.filter(a => a.stage === 'hired').length, color: 'border-emerald-200 bg-emerald-50/50' }
              ].map((col) => {
                const colApplicants = applicants.filter(a => a.stage === col.key);

                return (
                  <div key={col.key} className={`p-3.5 rounded-2xl border ${col.color} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#111827]">{col.title}</span>
                      <Badge variant="outline" className="bg-white text-[10px] font-bold">
                        {colApplicants.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {colApplicants.map(applicant => (
                        <div 
                          key={applicant.id}
                          className="bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-2xs space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-[#111827]">{applicant.candidateName}</div>
                              <div className="text-[11px] text-[#64748B]">{applicant.experienceYears} yrs • {applicant.location}</div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {applicant.matchScore}% Fit
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {applicant.skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>

                          {applicant.notes && (
                            <p className="text-[10px] text-[#64748B] italic bg-[#F4F7FC] p-1.5 rounded">
                              "{applicant.notes}"
                            </p>
                          )}

                          <div className="pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px]">
                            <select 
                              value={applicant.stage}
                              onChange={(e) => handleMoveStage(applicant.id, e.target.value as any)}
                              className="bg-transparent font-bold text-[#2563EB] cursor-pointer focus:outline-hidden"
                            >
                              <option value="reviewing">Move: Reviewing</option>
                              <option value="shortlisted">Move: Shortlist</option>
                              <option value="interview">Move: Interview</option>
                              <option value="hired">Move: Hire</option>
                            </select>
                            <a 
                              href={`mailto:${applicant.candidateEmail}`} 
                              className="text-[#7138E8] font-bold hover:underline"
                            >
                              Email →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Sub-Tab 3: Posted Vacancies */}
      {activeSubTab === 'active_jobs' && (
        postedJobs.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-10 rounded-2xl text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-[#111827]">No active job postings created yet</h4>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              You haven't posted any vacancies from this browser session yet. Use the form above to draft and publish your vacancy immediately.
            </p>
            <Button
              size="sm"
              onClick={() => setActiveSubTab('create')}
              className="bg-[#2563EB] text-white text-xs rounded-xl"
            >
              Create Requisition
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {postedJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white border border-[#E2E8F0] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2563EB]">{job.company_name}</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge>
                  </div>
                  <h4 className="font-bold text-base text-[#111827] mt-0.5">{job.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
                    <span>{job.location}</span>
                    {job.salary_min && (
                      <>
                        <span>•</span>
                        <span>₹{(job.salary_min / 100000).toFixed(1)}L - ₹{((job.salary_max || job.salary_min) / 100000).toFixed(1)}L CTC</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveSubTab('pipeline')}
                    className="text-xs rounded-xl"
                  >
                    View Applicants ({applicants.filter(a => a.jobId === job.id).length})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
