
import React, { useEffect } from 'react';

interface MultiLanguageSupportProps {
  currentLanguage?: string;
  alternateLanguages?: { lang: string; url: string }[];
}

export const MultiLanguageSupport: React.FC<MultiLanguageSupportProps> = ({
  currentLanguage = 'en',
  alternateLanguages = []
}) => {
  useEffect(() => {
    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[hreflang]');
    existingHreflangs.forEach(link => link.remove());

    // Add current language hreflang
    const currentLangLink = document.createElement('link');
    currentLangLink.rel = 'alternate';
    currentLangLink.hreflang = currentLanguage;
    currentLangLink.href = window.location.href;
    document.head.appendChild(currentLangLink);

    // Add x-default hreflang
    const defaultLangLink = document.createElement('link');
    defaultLangLink.rel = 'alternate';
    defaultLangLink.hreflang = 'x-default';
    defaultLangLink.href = window.location.href;
    document.head.appendChild(defaultLangLink);

    // Add alternate language links
    alternateLanguages.forEach(({ lang, url }) => {
      const altLangLink = document.createElement('link');
      altLangLink.rel = 'alternate';
      altLangLink.hreflang = lang;
      altLangLink.href = url;
      document.head.appendChild(altLangLink);
    });

    // Add language meta tag
    let langMeta = document.querySelector('meta[http-equiv="content-language"]') as HTMLMetaElement;
    if (!langMeta) {
      langMeta = document.createElement('meta');
      langMeta.httpEquiv = 'content-language';
      document.head.appendChild(langMeta);
    }
    langMeta.content = currentLanguage;

    return () => {
      // Cleanup on unmount
      const hreflangs = document.querySelectorAll('link[hreflang]');
      hreflangs.forEach(link => link.remove());
    };
  }, [currentLanguage, alternateLanguages]);

  return null;
};

export const generateHreflangData = (currentPath: string) => {
  const baseUrl = 'https://talentxcel.in';
  
  return [
    { lang: 'en', url: `${baseUrl}${currentPath}` },
    { lang: 'hi', url: `${baseUrl}/hi${currentPath}` },
    { lang: 'en-IN', url: `${baseUrl}/en-in${currentPath}` }
  ];
};
