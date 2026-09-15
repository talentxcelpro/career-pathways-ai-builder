import { Capacitor } from '@capacitor/core';

const NATIVE_AUTH_CALLBACK = 'in.talentxcel.app://auth/callback';

const normalizeNextPath = (nextPath: string) => {
  if (!nextPath || nextPath.startsWith('http') || nextPath.startsWith('//')) {
    return '/career-os';
  }

  return nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
};

export const getAuthCallbackUrl = (nextPath: string = '/career-os') => {
  const next = normalizeNextPath(nextPath);
  const params = new URLSearchParams({ next });

  if (Capacitor.isNativePlatform()) {
    return `${NATIVE_AUTH_CALLBACK}?${params.toString()}`;
  }

  return `${window.location.origin}/auth/callback?${params.toString()}`;
};

export const getEmailRedirectUrl = (nextPath: string = '/career-os') => {
  return getAuthCallbackUrl(nextPath);
};
