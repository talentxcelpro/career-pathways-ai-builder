import React from 'react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SUPER_ADMIN_EMAIL = 'arsh.wani@gmail.com';

interface UDXSuperAdminGuardProps {
  children: React.ReactNode;
}

export const UDXSuperAdminGuard: React.FC<UDXSuperAdminGuardProps> = ({ children }) => {
  const { user, loading, isAuthenticated, signOut } = useOptimizedAuth();
  const navigate = useNavigate();

  const userEmail = user?.email?.toLowerCase().trim() || '';
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-mono text-xs">Authenticating Super Admin Clearance...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-white shadow-2xl p-6 space-y-6">
          <CardHeader className="text-center p-0 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-bold text-white tracking-tight">
              UDX Universal Discovery OS
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Super Admin Authorization Required
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono">
              <span className="text-3xs text-slate-500 uppercase">Access Policy:</span>
              <p className="text-slate-200">
                This intelligence control plane and World Observatory is restricted exclusively to the Super Administrator:
              </p>
              <p className="text-indigo-400 font-semibold text-sm">
                {SUPER_ADMIN_EMAIL}
              </p>
            </div>

            <Button
              onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Super Admin ({SUPER_ADMIN_EMAIL})</span>
            </Button>
            
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-500 hover:text-slate-400 text-xs"
              >
                Return to Public Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Authenticated as non-super-admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-rose-900/40 text-white shadow-2xl p-6 space-y-6">
          <CardHeader className="text-center p-0 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-bold text-white tracking-tight">
              Access Denied
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Super Admin Privilege Required
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Current Account:</span>
                <span className="font-mono text-slate-200">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Authorized Super Admin:</span>
                <span className="font-mono text-indigo-400 font-semibold">{SUPER_ADMIN_EMAIL}</span>
              </div>
            </div>

            <p className="text-slate-400 text-center leading-relaxed">
              Your account does not possess Super Admin clearance for the UDX Discovery Operating System. Please sign in as <strong className="text-white">{SUPER_ADMIN_EMAIL}</strong>.
            </p>

            <div className="space-y-2 pt-2">
              <Button
                onClick={async () => {
                  await signOut();
                  navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
              >
                <span>Switch Account / Sign In as Super Admin</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs"
              >
                Return to Public Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Authorized Super Admin (arsh.wani@gmail.com)
  return <>{children}</>;
};

export default UDXSuperAdminGuard;
