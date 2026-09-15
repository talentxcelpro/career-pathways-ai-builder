import { useState, useEffect, useCallback } from 'react';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!Capacitor.isNativePlatform()) return;
      
      try {
        const result = await NativeBiometric.isAvailable();
        setIsAvailable(true);
        setBiometryType(result.biometryType);
      } catch (error) {
        setIsAvailable(false);
        console.log('Biometrics not available:', error);
      }
    };

    checkAvailability();
  }, []);

  const authenticate = useCallback(async (reason: string = 'Verify your identity') => {
    if (!Capacitor.isNativePlatform()) {
      // Simulation for web
      console.log('Simulating biometric auth on web');
      return true;
    }

    try {
      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Biometric Login',
        subtitle: 'Sign in with your biometric credentials',
        description: 'Please use your face or fingerprint to continue',
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, []);

  const saveCredentials = useCallback(async (username: string, password: string) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await NativeBiometric.setCredentials({
        username,
        password,
        server: 'talentxcel.in',
      });
      localStorage.setItem('biometrics_enabled', 'true');
      return true;
    } catch (error) {
      console.error('Failed to save credentials:', error);
      return false;
    }
  }, []);

  const getCredentials = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return null;

    try {
      return await NativeBiometric.getCredentials({
        server: 'talentxcel.in',
      });
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  }, []);

  const deleteCredentials = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await NativeBiometric.deleteCredentials({
        server: 'talentxcel.in',
      });
      localStorage.removeItem('biometrics_enabled');
      return true;
    } catch (error) {
      console.error('Failed to delete credentials:', error);
      return false;
    }
  }, []);

  return {
    isAvailable,
    biometryType,
    authenticate,
    saveCredentials,
    getCredentials,
    deleteCredentials,
    isBiometricsEnabled: localStorage.getItem('biometrics_enabled') === 'true',
  };
};
