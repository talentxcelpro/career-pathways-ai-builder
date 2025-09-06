import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ChevronRight } from 'lucide-react';
import careerPassportPreview from '@/assets/career-passport-preview.png';
import { Helmet } from 'react-helmet-async';

// Ultra-fast inline critical styles
const criticalStyles = `
  .fast-hero {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
    overflow: hidden;
    position: relative;
  }
  .fast-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: center;
    min-height: 80vh;
    max-width: 1280px;
    margin: 0 auto;
    padding: 5rem 1.5rem;
  }
  @media (min-width: 1024px) {
    .fast-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .fast-title {
    font-size: 3rem;
    font-weight: 300;
    line-height: 1.1;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin-bottom: 1.5rem;
  }
  @media (min-width: 1024px) {
    .fast-title {
      font-size: 4.5rem;
    }
  }
  .fast-gradient-text {
    display: block;
    font-weight: 500;
    background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .fast-subtitle {
    font-size: 1.25rem;
    color: #475569;
    font-weight: 300;
    line-height: 1.75;
    margin-bottom: 2rem;
    max-width: 32rem;
  }
  @media (min-width: 1024px) {
    .fast-subtitle {
      font-size: 1.5rem;
    }
  }
  .fast-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #2563eb;
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 9999px;
    font-size: 1.125rem;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    border: none;
    cursor: pointer;
  }
  .fast-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.4);
  }
  .fast-image-container {
    position: relative;
  }
  .fast-image-glow {
    position: absolute;
    inset: -1rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(59, 130, 246, 0.2) 100%);
    border-radius: 2rem;
    filter: blur(2rem);
  }
  .fast-image {
    position: relative;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    transition: transform 0.3s ease;
  }
  .fast-image:hover {
    transform: scale(1.02);
  }
  .fast-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    margin-top: 2rem;
  }
  @media (min-width: 1024px) {
    .fast-stats {
      justify-content: flex-start;
    }
  }
  .fast-stat {
    text-align: center;
  }
  .fast-stat-number {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    display: block;
  }
  .fast-stat-label {
    color: #475569;
    font-size: 0.875rem;
  }
`;

export const FastIndex = () => {
  // Add SEO and structured data
  useEffect(() => {
    // Add structured data for organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TalentXcel",
      "alternateName": "TalentXcel Career Platform",
      "url": "https://talentxcel.in",
      "logo": "https://talentxcel.in/logo.png",
      "description": "Professional networking and career development platform helping professionals grow their careers through skill-building, networking, and job opportunities.",
      "foundingDate": "2024",
      "sameAs": [
        "https://linkedin.com/company/talentxcel",
        "https://twitter.com/talentxcel"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@talentxcel.in"
      },
      "offers": {
        "@type": "Offer",
        "name": "Career Development Platform",
        "description": "All-in-one platform for networking, skill-building, and career opportunities",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'structured-data';
    
    const existing = document.getElementById('structured-data');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('structured-data');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>TalentXcel - Professional Networking & Career Development Platform</title>
        <meta name="description" content="Join TalentXcel's professional networking platform. Connect with industry experts, build skills, discover career opportunities, and accelerate your professional growth. Free to start." />
        <meta name="keywords" content="professional networking, career development, skill building, job opportunities, industry experts, career growth, professional platform" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/" />
        <meta property="og:title" content="TalentXcel - Professional Networking & Career Development Platform" />
        <meta property="og:description" content="Join TalentXcel's professional networking platform. Connect with industry experts, build skills, and discover career opportunities." />
        <meta property="og:image" content="https://talentxcel.in/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://talentxcel.in/" />
        <meta property="twitter:title" content="TalentXcel - Professional Networking & Career Development Platform" />
        <meta property="twitter:description" content="Join TalentXcel's professional networking platform. Connect with industry experts, build skills, and discover career opportunities." />
        <meta property="twitter:image" content="https://talentxcel.in/og-image.png" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TalentXcel" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://talentxcel.in/" />
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dthlgsnakhoftinssokm.supabase.co" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      
      <main className="fast-hero">
        <div className="fast-grid">
          {/* Left Side - Text Content */}
          <header style={{ textAlign: 'center' }} className="lg:text-left">
            <h1 className="fast-title">
              🌍 Powering Global
              <span className="fast-gradient-text">
                Career Growth
              </span>
            </h1>
            
            <p className="fast-subtitle">
              Your all-in-one platform for networking, skill-building, and discovering career opportunities tailored to your unique journey.
            </p>

            {/* CTA Button */}
            <section style={{ marginBottom: '3rem' }}>
              <AuthDialog>
                <button className="fast-button" aria-label="Get started with TalentXcel for free">
                  Get Started Free
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem', transition: 'transform 0.3s ease' }} aria-hidden="true" />
                </button>
              </AuthDialog>
            </section>

            {/* Social Proof */}
            <section className="fast-stats" aria-label="Platform statistics">
              <div className="fast-stat">
                <span className="fast-stat-number">10K+</span>
                <span className="fast-stat-label">Professionals</span>
              </div>
              <div className="fast-stat">
                <span className="fast-stat-number">1K+</span>
                <span className="fast-stat-label">Businesses</span>
              </div>
              <div className="fast-stat">
                <span className="fast-stat-number">95%</span>
                <span className="fast-stat-label">Success Rate</span>
              </div>
            </section>
          </header>

          {/* Right Side - Career Passport Preview */}
          <section className="fast-image-container" aria-label="Career passport preview">
            <div className="fast-image-glow" aria-hidden="true"></div>
            <div className="fast-image">
              <a href="/passport" aria-label="View career passport feature">
                <img
                  src={careerPassportPreview}
                  alt="TalentXcel Career Passport dashboard showing professional progress tracking, skills assessment, and career milestones for comprehensive career development"
                  loading="eager"
                  decoding="sync"
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    height: 'auto', 
                    objectFit: 'cover' 
                  }}
                  width="600"
                  height="400"
                />
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};