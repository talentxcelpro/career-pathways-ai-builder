import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedAuthForm } from '@/components/auth/UnifiedAuthForm';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getEmailRedirectUrl } from '@/utils/authRedirect';
import { getUserFacingAuthError } from '@/utils/authErrors';
import { useBiometrics } from '@/hooks/useBiometrics';
import { Fingerprint, Shield, Zap, Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NativeAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-hidden relative flex items-center justify-center p-6">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-sm w-full relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-[24px] shadow-2xl shadow-blue-500/20 mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-apple-heavy tracking-tighter mb-2">{title}</h1>
          <p className="text-sm font-apple-medium text-slate-500 leading-relaxed px-4">{subtitle}</p>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl p-8 shadow-2xl overflow-hidden"
        >
          {children}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">
            <Shield className="h-3 w-3" /> Secure Node
          </div>
          <div className="h-1 w-1 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">
            <Lock className="h-3 w-3" /> AES-256
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function NativeAuthPage() {
  const { user, session, loading } = useOptimizedAuth();
  const navigate = useNavigate();
  const { isAvailable, isBiometricsEnabled, getCredentials } = useBiometrics();
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (!loading && user && session) {
      navigate('/career-os', { replace: true });
    }
  }, [loading, navigate, session, user]);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const credentials = await getCredentials();
      if (!credentials) {
        toast.error('Identity scan required first.');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password,
      });
      if (error) throw error;
      toast.success('Signal recognized. Welcome.');
    } catch (error) {
      toast.error('Identity recognition failed.');
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <NativeAuthShell
      title="Secure Access"
      subtitle="Synchronize your professional signal with the OS Intelligence Layer."
    >
      <UnifiedAuthForm onSuccess={() => {}} />
      
      {isAvailable && isBiometricsEnabled && (
        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-transparent px-2 text-slate-500 font-apple-bold">Fast Recognition</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-2xl gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-apple-bold transition-all"
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
          >
            <Fingerprint className="w-6 h-6 text-blue-500" />
            {biometricLoading ? 'Synchronizing...' : 'Identify with Signal'}
          </Button>
        </div>
      )}
    </NativeAuthShell>
  );
}

export function NativeForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: getEmailRedirectUrl('/auth/reset-password'),
      });
      if (error) throw error;
      setSent(true);
      toast.success('Recovery signal transmitted.');
    } catch (error) {
      toast.error(getUserFacingAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <NativeAuthShell
      title="Signal Recovery"
      subtitle="Transmitting a secure link to restore your professional identity."
    >
      {sent ? (
        <div className="space-y-6 text-center py-4">
          <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Sparkles className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-sm font-apple-medium leading-relaxed text-slate-400">
            If your signal exists, a recovery link is currently propagating to your inbox.
          </p>
          <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 font-apple-bold mt-4" onClick={() => navigate('/auth/login')}>
            Return to Access
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="native-reset-email" className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">Signal Email</Label>
            <Input
              id="native-reset-email"
              type="email"
              className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="identify@signal.os"
              required
            />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white font-apple-heavy shadow-xl shadow-blue-500/20" disabled={loading}>
            {loading ? 'Transmitting...' : 'Send Recovery Signal'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full h-14 rounded-2xl text-slate-400 hover:text-white"
            onClick={() => navigate('/auth/login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </form>
      )}
    </NativeAuthShell>
  );
}

export function NativeResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return toast.error('Minimum 6 characters required.');
    if (password !== confirmPassword) return toast.error('Parity mismatch.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Signal identity updated.');
      navigate('/career-os', { replace: true });
    } catch (error) {
      toast.error(getUserFacingAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <NativeAuthShell title="Reconfigure Identity" subtitle="Establish a new secure access key for your signal.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="native-password" className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">New Key</Label>
          <Input
            id="native-password"
            type="password"
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="native-confirm-password" className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">Confirm Key</Label>
          <Input
            id="native-confirm-password"
            type="password"
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white font-apple-heavy shadow-xl shadow-blue-500/20" disabled={loading}>
          {loading ? 'Updating...' : 'Authorize New Key'}
        </Button>
      </form>
    </NativeAuthShell>
  );
}
