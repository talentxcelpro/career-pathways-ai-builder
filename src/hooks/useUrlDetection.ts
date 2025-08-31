import { useState, useEffect, useMemo } from 'react';

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

export interface DetectedUrl {
  url: string;
  displayUrl: string;
  position: number;
}

export const useUrlDetection = (text: string) => {
  const [detectedUrls, setDetectedUrls] = useState<DetectedUrl[]>([]);

  const extractUrls = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const matches = text.match(URL_REGEX);
    if (!matches) return [];

    return matches.map((match, index) => {
      const normalizedUrl = match.startsWith('http') ? match : `https://${match}`;
      return {
        url: normalizedUrl,
        displayUrl: match,
        position: text.indexOf(match)
      };
    });
  }, [text]);

  useEffect(() => {
    setDetectedUrls(extractUrls);
  }, [extractUrls]);

  return {
    detectedUrls,
    hasUrls: detectedUrls.length > 0,
    urlCount: detectedUrls.length
  };
};