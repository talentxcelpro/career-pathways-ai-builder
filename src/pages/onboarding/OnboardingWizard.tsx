import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Zap, Shield, Sparkles, Brain, Target, Globe, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingData {
  role: string;
  experience: string;
  targetJob: string;
  skills: string[];
  location: string;
  salaryExpectation: string;
  industry: string;
  workPreference: string;
}

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: '', experience: '', targetJob: '', skills: [],
    location: '', salaryExpectation: '', industry: '', workPreference: ''
  });

  const flow = searchParams.get('flow') || 'resume';
  const userType = searchParams.get('type') || 'candidate';
  const totalSteps = userType === 'employer' ? 3 : 4;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const experiences = ['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Design', 'Media'];
  const workPreferences = ['Remote', 'Hybrid', 'On-site', 'Flexible'];
  const popularSkills = ['React', 'Python', 'AI/ML', 'Product Strategy', 'Design Systems', 'Cloud Arch', 'Data Science', 'Growth Marketing'];

  const nextStep = () => currentStep < totalSteps ? setCurrentStep(currentStep + 1) : completeOnboarding();
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const completeOnboarding = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, full_name: user.user_metadata?.full_name || '',
        email: user.email || '', title: data.role, location: data.location,
        experience_level: data.experience, industries: [data.industry],
        skills: data.skills, work_preference: data.workPreference,
        onboarding_completed: true, user_type: userType
      });
      if (error) throw error;
      toast.success('TalentXcel Activated! Welcome to the Intelligence Hub.');
      navigate('/career-os');
    } catch (error: any) {
      toast.error('Activation failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-apple-bold text-[10px] tracking-widest uppercase mb-6">
            <Zap className="h-3 w-3" /> TalentXcel Activation
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-apple-heavy tracking-tighter mb-4">Initialize Your Identity</h1>
          <p className="text-slate-500 font-apple-medium">Provide your professional parameters to synchronize with the platform.</p>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">Step {currentStep} of {totalSteps}</span>
            <span className="text-[10px] font-apple-heavy text-blue-500 uppercase tracking-widest">{Math.round((currentStep / totalSteps) * 100)}% Configured</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        <Card className="rounded-[40px] bg-white/5 border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden">
          <CardContent className="p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3 block">Primary Identity</label>
                      <Input 
                        placeholder="e.g. Principal Product Architect" 
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                        value={data.role}
                        onChange={(e) => setData({...data, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3 block">Tenure Level</label>
                      <Select value={data.experience} onValueChange={(v) => setData({...data, experience: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          {experiences.map(exp => <SelectItem key={exp} value={exp}>{exp}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3 block">Target Trajectory</label>
                      <Input 
                        placeholder="What is your next strategic role?" 
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                        value={data.targetJob}
                        onChange={(e) => setData({...data, targetJob: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3 block">Industry Domain</label>
                      <Select value={data.industry} onValueChange={(v) => setData({...data, industry: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          {industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <label className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3 block">Talent Capabilities</label>
                    <div className="grid grid-cols-2 gap-3">
                      {popularSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => data.skills.includes(skill) ? setData({...data, skills: data.skills.filter(s => s !== skill)}) : setData({...data, skills: [...data.skills, skill]})}
                          className={cn(
                            "h-14 rounded-2xl border transition-all flex items-center justify-center gap-2 font-apple-bold text-xs",
                            data.skills.includes(skill) ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                          )}
                        >
                          {data.skills.includes(skill) && <CheckCircle className="h-3 w-3" />}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 text-center">
                    <div className="p-8 rounded-[32px] bg-blue-600/10 border border-blue-500/20 mb-8">
                      <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-apple-heavy mb-2">Ready for Synchronization</h3>
                      <p className="text-sm text-slate-400 font-apple-medium">Your professional attributes are validated and ready to merge with the TalentXcel network.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <Globe className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                          <p className="text-[9px] font-apple-heavy text-slate-500 uppercase">Visibility</p>
                          <p className="text-xs font-apple-bold">Global</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <Shield className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                          <p className="text-[9px] font-apple-heavy text-slate-500 uppercase">Integrity</p>
                          <p className="text-xs font-apple-bold">Verified</p>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-12 gap-4">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="h-14 rounded-2xl px-8 border border-white/10 text-white/60 hover:bg-white/5"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="h-14 flex-1 rounded-2xl bg-blue-600 text-white font-apple-heavy text-lg hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20"
              >
                {isLoading ? 'Activating Talent...' : currentStep === totalSteps ? 'Finalize Activation' : 'Continue'}
                {currentStep < totalSteps && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2 grayscale">
              <Shield className="h-4 w-4" />
              <span className="text-[10px] font-apple-heavy tracking-widest uppercase">Encrypted Core</span>
           </div>
           <div className="flex items-center gap-2 grayscale">
              <Brain className="h-4 w-4" />
              <span className="text-[10px] font-apple-heavy tracking-widest uppercase">Neural Matching</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
