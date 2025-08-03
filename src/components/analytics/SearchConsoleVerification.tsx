
import React, { useEffect } from 'react';

interface SearchConsoleVerificationProps {
  verificationCode?: string;
}

export const SearchConsoleVerification: React.FC<SearchConsoleVerificationProps> = ({
  verificationCode = 'nTmI_33A3373kHEXPI2gE41jbDB1Xly7qKUBaAucsnM'
}) => {
  useEffect(() => {
    // Only add verification if code is provided and not placeholder
    if (!verificationCode || verificationCode === 'your-search-console-verification-code') {
      console.log('Google Search Console: Verification code not configured');
      return;
    }

    // Add Google Search Console verification meta tag
    let verificationMeta = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement;
    if (!verificationMeta) {
      verificationMeta = document.createElement('meta');
      verificationMeta.name = 'google-site-verification';
      document.head.appendChild(verificationMeta);
    }
    verificationMeta.content = verificationCode;

    console.log('Google Search Console verification added:', verificationCode);

    return () => {
      // Cleanup on unmount
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, [verificationCode]);

  return null;
};
