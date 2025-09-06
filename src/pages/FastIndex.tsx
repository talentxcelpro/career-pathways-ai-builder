import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ChevronRight } from 'lucide-react';
import careerPassportPreview from '@/assets/career-passport-preview.png';

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
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      <div className="fast-hero">
        <div className="fast-grid">
          {/* Left Side - Text Content */}
          <div style={{ textAlign: 'center' }} className="lg:text-left">
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
            <div style={{ marginBottom: '3rem' }}>
              <AuthDialog>
                <button className="fast-button">
                  Get Started Free
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem', transition: 'transform 0.3s ease' }} />
                </button>
              </AuthDialog>
            </div>

            {/* Social Proof */}
            <div className="fast-stats">
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
            </div>
          </div>

          {/* Right Side - Career Passport Preview */}
          <div className="fast-image-container">
            <div className="fast-image-glow" aria-hidden="true"></div>
            <div className="fast-image">
              <a href="/passport" style={{ display: 'block' }}>
                <img
                  src={careerPassportPreview}
                  alt="TalentXcel Career Passport - Professional dashboard for tracking career progress"
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
          </div>
        </div>
      </div>
    </>
  );
};