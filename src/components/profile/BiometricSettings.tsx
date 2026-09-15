import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBiometrics } from '@/hooks/useBiometrics';
import { Shield, Fingerprint, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const BiometricSettings = () => {
  const { 
    isAvailable, 
    biometryType, 
    authenticate, 
    saveCredentials, 
    deleteCredentials, 
    isBiometricsEnabled 
  } = useBiometrics();
  
  const [enabled, setEnabled] = useState(isBiometricsEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        // To enable, we need to authenticate first to prove identity
        const success = await authenticate('Enable biometric login');
        if (success) {
          // Ask for password to store it securely (in a real app, you'd do this once during session)
          // For now, we'll assume we can use the current session's password or prompt user
          // Since we can't get password from Supabase session, we prompt user one last time
          const password = window.prompt('Please enter your current password to securely store it for biometric login:');
          
          if (password) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
              const saved = await saveCredentials(user.email, password);
              if (saved) {
                setEnabled(true);
                toast.success('Biometric login enabled successfully!');
              }
            }
          } else {
            toast.error('Password is required to enable biometric login');
          }
        }
      } else {
        const deleted = await deleteCredentials();
        if (deleted) {
          setEnabled(false);
          toast.success('Biometric login disabled');
        }
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      toast.error('Failed to update biometric settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) return null;

  const biometryName = biometryType === 1 ? 'FaceID' : biometryType === 2 ? 'Fingerprint' : 'Biometrics';

  return (
    <Card className="mb-6 border-0 shadow-apple bg-white/80 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Fingerprint className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Security Settings</CardTitle>
            <CardDescription>Manage your native security preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <Label htmlFor="biometric-toggle" className="text-sm font-semibold text-gray-900">
                Login with {biometryName}
              </Label>
              <span className="text-xs text-gray-500 mt-0.5">
                Use your device's native security to sign in instantly
              </span>
            </div>
          </div>
          <div className="flex items-center">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <Switch
                id="biometric-toggle"
                checked={enabled}
                onCheckedChange={handleToggle}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
