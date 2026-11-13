// src/components/products/jobmatch/CandidateApplicationTracker.tsx
// Candidate Application Tracker & Recruitment Journey Stepper
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  Award, 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  Trash2,
  AlertCircle,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export interface TrackedApplication {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'offered' | 'rejected';
  applied_at: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  external_url?: string | null;
  interviewDate?: string;
  recruiterNotes?: string;
}

interface CandidateApplicationTrackerProps {
  onBrowseJobs: () => void;
  onLaunchInterviewPrep?: (title: string, company: string) => void;
}

const STAGES = [
  { key: 'applied', label: 'Applied', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { key: 'under_review', label: 'Under Review', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { key: 'interview', label: 'Interview Scheduled', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { key: 'offered', label: 'Offer Extended', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' }
];

export const CandidateApplicationTracker: React.FC<CandidateApplicationTrackerProps> = ({
  onBrowseJobs,
  onLaunchInterviewPrep
}) => {
  const [applications, setApplications] = useState<TrackedApplication[]>(() => {
    try {
      const saved = localStorage.getItem('txc_tracked_applications');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed with two demo applications if empty so candidate can immediately see the working experience
    return [
      {
        id: 'txc-app-demo-1',
        job_id: 'db479639-909b-4783-a583-0605fe6ca9cd',
        job_title: 'Senior Staff Engineer / Tech Lead',
        company_name: 'Dayalbagh Tech',
        status: 'under_review',
        applied_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Agra / Remote',
        experience: '6 Years',
        recruiterNotes: 'Profile matched with 94% compatibility. Resume reviewed by engineering team.'
      },
      {
        id: 'txc-app-demo-2',
        job_id: 'txc-fallback-tech-1',
        job_title: 'Senior Full Stack Engineer (React & Node.js)',
        company_name: 'Zomato Engineering',
        status: 'interview',
        applied_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        location: 'Gurgaon / Remote',
        experience: '4 Years',
        interviewDate: 'Upcoming: Friday at 2:00 PM IST (Technical Screening)',
        recruiterNotes: 'Round 1 technical architecture and distributed systems interview scheduled.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('txc_tracked_applications', JSON.stringify(applications));
    } catch {}
  }, [applications]);

  const handleAdvanceStatus = (appId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const order: TrackedApplication['status'][] = ['applied', 'under_review', 'shortlisted', 'interview', 'offered'];
      const currentIdx = order.indexOf(app.status);
      const nextStatus = order[(currentIdx + 1) % order.length];
      toast.success(`Application status updated to "${nextStatus.replace('_', ' ').toUpperCase()}"!`);
      return {
        ...app,
        status: nextStatus
      };
    }));
  };

  const handleDeleteApplication = (appId: string) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
    toast.info('Application removed from tracker.');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="font-black text-xl text-[#111827] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span>Candidate Application Tracker</span>
          </h3>
          <p className="text-xs text-[#64748B]">
            Real-time status tracking and interview timeline across your submitted applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-bold px-3 py-1">
            {applications.length} Active Applications
          </Badge>
          <Button
            size="sm"
            onClick={onBrowseJobs}
            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold px-4 rounded-xl"
          >
            + Apply for More Roles
          </Button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center space-y-4 shadow-xs">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-bold text-base text-[#111827]">No Applications Submitted Yet</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Find verified openings on JobMatch OS and use 1-Click Apply to track interview progress right here.
            </p>
          </div>
          <Button
            onClick={onBrowseJobs}
            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
          >
            Explore 2,200+ Verified Jobs →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = STAGES.findIndex(s => s.key === app.status);

            return (
              <Card 
                key={app.id}
                className="bg-white border-[#E2E8F0] rounded-2xl p-5 shadow-xs hover:border-[#2563EB] transition-all"
              >
                <CardContent className="p-0 space-y-4">
                  {/* Top Row: Meta and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {app.company_name}
                      </span>
                      <h4 className="font-bold text-base sm:text-lg text-[#111827] mt-1">
                        {app.job_title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.location || 'India'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {onLaunchInterviewPrep && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLaunchInterviewPrep(app.job_title, app.company_name)}
                          className="text-xs font-semibold text-[#2563EB] border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl h-8 px-3 flex items-center gap-1"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Interview Prep</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApplication(app.id)}
                        className="text-slate-400 hover:text-red-600 h-8 w-8 p-0"
                        title="Remove from tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Hiring Process Stepper */}
                  <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">Application Journey:</span>
                      <button
                        onClick={() => handleAdvanceStatus(app.id)}
                        className="text-[11px] font-bold text-[#2563EB] hover:text-[#7138E8] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Simulate Next Stage →</span>
                      </button>
                    </div>

                    {/* Progress Bar & Steps */}
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage.key} className="space-y-1">
                            <div className={`h-1.5 rounded-full transition-all ${
                              isDone ? 'bg-gradient-to-r from-[#2563EB] to-[#7138E8]' : 'bg-slate-200'
                            }`} />
                            <span className={`text-[10px] block font-bold truncate ${
                              isCurrent ? 'text-[#2563EB]' : (isDone ? 'text-[#111827]' : 'text-slate-400')
                            }`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recruiter Notes or Interview Details */}
                  {app.interviewDate && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <strong className="block text-emerald-800">Interview Scheduled:</strong>
                        <span>{app.interviewDate}</span>
                      </div>
                    </div>
                  )}

                  {app.recruiterNotes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#475569] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#7138E8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#111827] block">Employer Activity Update:</strong>
                        <span>{app.recruiterNotes}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
