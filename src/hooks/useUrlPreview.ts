import { useState, useEffect } from 'react';

export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
}

export interface UseUrlPreviewReturn {
  metadata: UrlMetadata | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const KNOWN_STARTUP_METADATA: Record<string, Partial<UrlMetadata>> = {
  'hulp.in': {
    title: 'HULP — AI-Powered Personal Household Assistance',
    description: 'AI-powered personal assistance startup helping families delegate everyday tasks through WhatsApp and mobile app.',
    domain: 'hulp.in',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  },
  'oolka.in': {
    title: 'OOLKA — AI into Personal Finance & Wealth',
    description: 'Bengaluru-based fintech startup bringing AI into everyday financial guidance, automated savings, and investments.',
    domain: 'oolka.in',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  },
  'olakrutrim.com': {
    title: "Krutrim — Building India's AI Cloud Infrastructure",
    description: "An Indian AI and cloud technology company building sovereign GPU infrastructure, AI foundation models, and developer cloud platforms.",
    domain: 'olakrutrim.com',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  'krutrim.com': {
    title: "Krutrim — Building India's AI Infrastructure",
    description: "GPU cloud infrastructure, LLM APIs, and developer platforms built for scale.",
    domain: 'krutrim.com',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  'talentxcel.in': {
    title: 'TalentXcel — Global Career Intelligence & Verified Talent Network',
    description: 'Connecting professionals, specialists, and leaders across all global industries with verified jobs, career passports, and transparent compensation benchmarks.',
    domain: 'talentxcel.in',
    image: 'https://talentxcel.in/assets/og-image.png',
  },
  'github.com': {
    title: 'GitHub — Where the world builds software',
    description: 'GitHub is where over 100 million developers shape the future of software, together.',
    domain: 'github.com',
  },
  'linkedin.com': {
    title: 'LinkedIn: Log In or Sign Up',
    description: '1 billion members | Manage your professional identity. Build and engage with your professional network.',
    domain: 'linkedin.com',
  },
};

export const useUrlPreview = (url: string | null): UseUrlPreviewReturn => {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (targetUrl: string) => {
    if (!targetUrl) return;

    setLoading(true);
    setError(null);

    try {
      const urlObj = new URL(targetUrl);
      const cleanHostname = urlObj.hostname.replace(/^www\./i, '').toLowerCase();

      // Check curated startup dictionary
      const known = KNOWN_STARTUP_METADATA[cleanHostname];

      // Clean presentation title
      const brandName = cleanHostname.split('.')[0];
      const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

      const generatedMetadata: UrlMetadata = {
        url: targetUrl,
        title: known?.title || `${capitalizedBrand} — ${cleanHostname}`,
        description: known?.description || `Explore ${capitalizedBrand} on the web at ${cleanHostname}. Discover products, updates, and careers.`,
        domain: cleanHostname,
        favicon: `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=64`,
        image: known?.image,
      };

      setMetadata(generatedMetadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL');
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (url) {
      fetchMetadata(url);
    }
  };

  useEffect(() => {
    if (url && url.trim()) {
      fetchMetadata(url.trim());
    } else {
      setMetadata(null);
      setError(null);
      setLoading(false);
    }
  }, [url]);

  return {
    metadata,
    loading,
    error,
    retry,
  };
};
