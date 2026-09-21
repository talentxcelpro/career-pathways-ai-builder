import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Briefcase,
  Upload,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Zap,
  Compass,
  MapPin,
} from 'lucide-react';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';

interface GuestJobApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    company_name?: string;
    category?: string;
    location?: string;
    companies?: { name: string } | null;
    external_url?: string;
  };
  onSuccess?: () => void;
}

export const GuestJobApplyModal: React.FC<GuestJobApplyModalProps> = ({
  open,
  onOpenChange,
  job,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  const companyName = job?.companies?.name || job?.company_name || 'Hiring Organization';

  // Instrumentation: track guest apply opened
  useEffect(() => {
    if (open) {
      GrowthFunnelTracker.track('guest_apply_opened', {
        job_id: job.id,
        job_title: job.title,
        job_category: job.category,
        location: job.location,
      });

      if (user) {
        setEmail(user.email || '');
        supabase
          .from('profiles')
          .select('full_name, phone, location')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              if (data.full_name) setFullName(data.full_name);
              if (data.phone) setPhone(data.phone);
              if (data.location) setCurrentLocation(data.location);
            }
          });
      }
    }
  }, [open, user, job]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSubmittedResult(null);
      setIsSubmitting(false);
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit. Please upload a smaller PDF or Word document.');
        return;
      }
      GrowthFunnelTracker.track('resume_upload_started', {
        job_id: job.id,
        file_name: file.name,
      });
      setResumeFile(file);
      GrowthFunnelTracker.track('resume_uploaded', {
        job_id: job.id,
        file_name: file.name,
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGoogleQuickAuth = async () => {
    GrowthFunnelTracker.track('auth_started', {
      provider: 'google',
      job_id: job.id,
    });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Google sign-in could not be initiated.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your contact phone number');
      return;
    }
    if (!resumeFile && !user) {
      toast.error('Please upload your resume to apply');
      return;
    }

    setIsSubmitting(true);
    GrowthFunnelTracker.track('application_started', {
      job_id: job.id,
      job_title: job.title,
    });
    toast.loading('Validating position and submitting application...', { id: 'guest-apply' });

    try {
      let resumeBase64 = '';
      if (resumeFile) {
        resumeBase64 = await fileToBase64(resumeFile);
      }

      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          resumeBase64,
          resumeFileName: resumeFile?.name || 'resume.pdf',
          resumeFileType: resumeFile?.type || 'application/pdf',
          experience,
          currentLocation,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        GrowthFunnelTracker.track('application_failed', {
          job_id: job.id,
          error_message: data.error || 'Server rejected application',
        });
        throw new Error(data.error || 'Failed to submit application');
      }

      GrowthFunnelTracker.track('application_submitted', {
        job_id: job.id,
        candidate_id: data.candidateId,
        already_applied: data.alreadyApplied,
      });

      if (data.atsFeedback) {
        GrowthFunnelTracker.track('ats_score_generated', {
          job_id: job.id,
          ats_score: data.atsFeedback.score,
        });
      }

      toast.success(data.message || 'Application submitted successfully! 🎉', { id: 'guest-apply' });
      setSubmittedResult(data);
      onSuccess?.();
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Error submitting application. Please try again.', {
        id: 'guest-apply',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-800 text-white p-6 md:p-8">
        {!submittedResult ? (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                1-Click Express Application
              </div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                Apply to {job.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{companyName}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Free instant application</span>
              </DialogDescription>
            </DialogHeader>

            {/* Quick Google Accelerator Banner */}
            {!user && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoogleQuickAuth}
                  className="w-full h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-center gap-2.5 text-xs text-slate-200 transition-colors hover:border-slate-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Auto-fill with Google (Optional)</span>
                </button>
                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-slate-800" />
                  <span className="px-2 text-[11px] text-slate-500 uppercase">Or Enter Details</span>
                  <div className="flex-1 border-t border-slate-800" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="guest-name" className="text-xs text-slate-300">
                    Full Name *
                  </Label>
                  <Input
                    id="guest-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guest-email" className="text-xs text-slate-300">
                    Email Address *
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="guest-phone" className="text-xs text-slate-300">
                    Phone / WhatsApp *
                  </Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guest-location" className="text-xs text-slate-300">
                    Current City / Location
                  </Label>
                  <Input
                    id="guest-location"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="e.g. Bangalore / Remote"
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="guest-exp" className="text-xs text-slate-300">
                  Total Experience (Years)
                </Label>
                <Input
                  id="guest-exp"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-9"
                />
              </div>

              {/* Resume Upload Dropzone */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">
                  Resume / CV (PDF or Word) *
                </Label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 transition-colors rounded-xl p-3.5 text-center bg-slate-900/50">
                  <input
                    type="file"
                    id="guest-resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      <span>{resumeFile.name}</span>
                      <span className="text-xs text-slate-500">
                        ({(resumeFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 mx-auto text-blue-400" />
                      <div className="text-xs font-medium text-slate-200">
                        Drop resume or <span className="text-blue-400 underline">browse files</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Supported: PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold text-white shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                      Submit Application &amp; Get ATS Match Score
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero password friction. Career Passport auto-created securely.</span>
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Retention Loop & Value-Added State */
          <div className="space-y-5 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">
                {submittedResult.alreadyApplied ? 'Application Already on File!' : 'Application Submitted!'}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto">
                {submittedResult.message}
              </p>
            </div>

            {/* Instant ATS Diagnostic Score Card */}
            {submittedResult.atsFeedback && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      ATS Requirement Match
                    </span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {submittedResult.atsFeedback.score}/100 • {submittedResult.atsFeedback.rating}
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${submittedResult.atsFeedback.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {submittedResult.atsFeedback.summary}
                </p>

                {submittedResult.atsFeedback.careerPathwayPrompt && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-300 font-medium">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{submittedResult.atsFeedback.careerPathwayPrompt}</span>
                  </div>
                )}
              </div>
            )}

            {/* Retention Loop: Related Jobs */}
            {submittedResult.relatedJobs && submittedResult.relatedJobs.length > 0 && (
              <div className="text-left space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Explore Similar Opportunities</span>
                  <span className="text-[10px] text-blue-400 font-normal">1-Click Apply</span>
                </div>
                <div className="space-y-1.5">
                  {submittedResult.relatedJobs.map((rj: any) => (
                    <div
                      key={rj.id}
                      onClick={() => {
                        GrowthFunnelTracker.track('related_job_clicked', {
                          job_id: rj.id,
                          target_slug: rj.seo_slug,
                        });
                        window.location.href = `/jobs/${rj.seo_slug || rj.id}`;
                      }}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">{rj.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{rj.company_name || 'Employer'}</span>
                          {rj.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {rj.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                onClick={() => {
                  handleOpenChange(false);
                  window.location.href = '/jobs';
                }}
                variant="outline"
                className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs h-9"
              >
                Browse All Jobs
              </Button>
              {submittedResult.magicLoginUrl ? (
                <Button
                  onClick={() => {
                    window.location.href = submittedResult.magicLoginUrl;
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-xs h-9"
                >
                  Access Career Passport
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-xs h-9"
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuestJobApplyModal;
