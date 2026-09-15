const getAuthErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message.toLowerCase() : String(error ?? '').toLowerCase();
};

export const isTransientAuthError = (error: unknown) => {
  const message = getAuthErrorMessage(error);
  return ['network', 'timeout', 'auth_timeout', 'failed to fetch', 'fetch failed'].some((token) => message.includes(token));
};

export const isAuthSessionFailure = (error: unknown) => {
  const message = getAuthErrorMessage(error);
  return [
    'invalid refresh token',
    'refresh token not found',
    'session missing',
    'jwt expired',
    'invalid jwt',
    'not authenticated'
  ].some((token) => message.includes(token));
};

export const shouldClearSessionAfterError = (error: unknown) => {
  return isAuthSessionFailure(error) && !isTransientAuthError(error);
};

export const getUserFacingAuthError = (error: unknown) => {
  const message = getAuthErrorMessage(error);

  if (isTransientAuthError(error)) {
    return 'Connection interrupted. Check your network and try again.';
  }

  if (message.includes('invalid login credentials')) {
    return 'The email or password is incorrect.';
  }

  if (message.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Wait a moment, then try again.';
  }

  if (message.includes('password')) {
    return 'Check your password and try again.';
  }

  return 'TalentXcel could not complete sign-in. Please try again.';
};
