
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, Eye, BarChart3, Users, Link as LinkIcon, Copy, Sparkles, Zap, Rocket, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { loadRazorpayScript } from '@/services/payment/razorpayProvider';

const JobPostSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobData, aiGenerated } = location.state || {};
  const [isBoosting, setIsBoosting] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);

  const jobIdentifier = jobData?.slug || jobData?.seo_slug || jobData?.id || '';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in';
  const jobUrl = jobIdentifier ? `${origin}/jobs/${jobIdentifier}` : `${origin}/jobs`;

  const jobTitle = jobData?.job_title || jobData?.title || "Job Posting";
  const jobLocation = [jobData?.location_city, jobData?.location_state].filter(Boolean).join(', ') || jobData?.location || "Remote / On-site";
  const employmentType = (jobData?.employment_type || jobData?.employmentType || "Full-time").replace(/_/g, ' ');

  const formatSalary = () => {
    const min = jobData?.salary_min ?? jobData?.min_salary;
    const max = jobData?.salary_max ?? jobData?.max_salary;
    if (min && max) {
      const formatAmount = (amt: number) => {
        if (amt >= 100000) return `₹${(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L`;
        return `₹${amt.toLocaleString()}`;
      };
      return `${formatAmount(min)} - ${formatAmount(max)} / year`;
    }
    if (min) return `₹${(min / 100000).toFixed(1)}L+ / year`;
    if (max) return `Up to ₹${(max / 100000).toFixed(1)}L / year`;
    if (jobData?.salary) return jobData.salary;
    return 'Salary not disclosed / Best in industry';
  };

  const copyJobUrl = () => {
    navigator.clipboard.writeText(jobUrl);
    toast.success('Job link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: jobTitle,
        text: `Check out this opening for ${jobTitle} at ${jobData?.company_name || 'TalentXcel'}!`,
        url: jobUrl,
      }).catch(() => {
        copyJobUrl();
      });
    } else {
      copyJobUrl();
    }
  };

  const handleBoostJob = async () => {
    try {
      setIsBoosting(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway unavailable. Please check your network connection.');
        return;
      }

      // Create Razorpay order for ₹999 (canonical server tier: max)
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          currency: 'INR',
          planId: 'max',
          tier: 'max',
          notes: {
            purpose: 'employer_featured_job_boost',
            job_id: jobData?.id || jobIdentifier,
            job_title: jobTitle,
          }
        }
      });

      if (orderError || !orderData?.orderId) {
        throw new Error(orderError?.message || 'Failed to initialize payment order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'TalentXcel Services',
        description: `Feature & Boost: ${jobTitle} (Google for Jobs Top Shelf)`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            });

            if (verifyError || !verifyData?.verified) {
              toast.error('Payment verification failed. Please contact support.');
              return;
            }

            if (jobData?.id) {
              await supabase.from('jobs').update({ is_featured: true }).eq('id', jobData.id);
            }

            setIsBoosted(true);
            toast.success('🎉 Job Boost Activated! Featured on Google for Jobs Top Shelf.');
          } catch (err: any) {
            toast.error(err.message || 'Verification error');
          }
        },
        theme: { color: '#2563EB' },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setIsBoosting(false);
    }
  };

  const quickActions = [
    {
      title: "View Job Post",
      description: "See how your live job appears to candidate pool",
      icon: Eye,
      action: () => navigate(jobIdentifier ? `/jobs/${jobIdentifier}` : '/jobs'),
      color: "text-blue-600"
    },
    {
      title: "Share Job",
      description: "Share on WhatsApp, LinkedIn or with your candidate network",
      icon: Share2,
      action: handleShare,
      color: "text-green-600"
    },
    {
      title: "Employer Dashboard",
      description: "Track candidate match scores and applications",
      icon: BarChart3,
      action: () => navigate('/employer'),
      color: "text-purple-600"
    },
    {
      title: "Manage Candidates",
      description: "Review, filter and shortlist candidate resumes",
      icon: Users,
      action: () => navigate('/employer'),
      color: "text-orange-600"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Posted Successfully!</h1>
          <p className="text-gray-600 text-lg">
            Your job posting for <span className="font-semibold text-slate-900">{jobTitle}</span> is now live
          </p>
        </div>
      </div>

      {/* Job Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Job Posting Details</CardTitle>
          <CardDescription>Your job is now visible to candidates across TalentXcel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Job Title</p>
              <p className="text-lg font-semibold text-slate-900">{jobTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg font-medium text-slate-800">{jobLocation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employment Type</p>
              <p className="text-lg font-medium text-slate-800 capitalize">{employmentType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salary Range</p>
              <p className="text-lg font-medium text-slate-800">{formatSalary()}</p>
            </div>
          </div>

          {/* Job URL */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Live Job URL</p>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-slate-200">
              <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
              <code className="flex-1 text-sm text-gray-700 font-mono break-all">{jobUrl}</code>
              <Button size="sm" variant="outline" onClick={copyJobUrl} className="shrink-0 font-semibold">
                <Copy className="h-4 w-4 mr-1.5" /> Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Job Boost & Top Shelf Placement Upsell (Immediate Revenue Engine) */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5 text-amber-600" />
                <span>Featured Recruiter Boost • 10x Inflow</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {isBoosted ? '🎉 Featured Spotlight Activated!' : 'Feature on Google for Jobs Top Shelf + WhatsApp Alert'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                {isBoosted
                  ? 'Your job is now highlighted at the very top of search results and pushed to verified local candidate feeds.'
                  : 'Get guaranteed top shelf placement across Google for Jobs, featured badge on TalentXcel, and direct push alerts to 5,000+ matched candidates in your region.'}
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-auto text-right">
              {!isBoosted ? (
                <div className="space-y-2">
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="text-xs line-through text-slate-400">₹2,499</span>
                    <span className="text-2xl font-black text-slate-900">₹999</span>
                  </div>
                  <Button
                    onClick={handleBoostJob}
                    disabled={isBoosting}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    {isBoosting ? 'Opening Checkout...' : 'Boost Job for ₹999'}
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Active on Top Shelf
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> 1-Click Priority Placement</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-600" /> WhatsApp Match Broadcast</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-amber-600" /> 10x More Candidate Reach</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>Manage your job posting and track candidate applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-300"
              >
                <div className="flex items-start space-x-3">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/jobs/post')}>
          Post Another Job
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            Browse All Jobs
          </Button>
          <Button onClick={() => navigate('/employer')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Back to Employer Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostSuccess;
