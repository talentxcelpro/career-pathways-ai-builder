
import React, { Suspense, useState } from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { EmptyCareerState } from '@/components/career-map/EmptyCareerState';
import { BuildingPathState } from '@/components/career-map/BuildingPathState';
import { ReadyToAccelerateCard } from '@/components/career-map/ReadyToAccelerateCard';
import { PersonalizedDashboard } from '@/components/career-map/PersonalizedDashboard';

import { LandingFooter } from './LandingFooter';

// Lazy load news widget for faster initial load
const NewsLatestWidget = React.lazy(() => 
  import('@/components/news/NewsLatestWidget').then(module => ({ default: module.NewsLatestWidget }))
);

export const LandingPage = () => {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [careerState, setCareerState] = useState<'empty' | 'building' | 'ready' | 'dashboard'>('empty');

  const handleCreateGoal = () => {
    setCareerState('building');
    setTimeout(() => setCareerState('ready'), 2000);
  };

  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <FeaturesSection />
      
      {/* Career Map Components Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Career Journey Starts Here</h2>
            <p className="text-lg text-gray-600">Experience AI-powered career guidance with personalized insights</p>
          </div>
          
          {careerState === 'empty' && (
            <EmptyCareerState onCreateGoal={handleCreateGoal} />
          )}
          
          {careerState === 'building' && (
            <BuildingPathState />
          )}
          
          {careerState === 'ready' && (
            <div className="space-y-8">
              <ReadyToAccelerateCard 
                userName="Arshid" 
                currentRole="Junior Developer" 
              />
              <button 
                onClick={() => setCareerState('dashboard')}
                className="mx-auto block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Dashboard
              </button>
            </div>
          )}
          
          {careerState === 'dashboard' && (
            <div className="space-y-8">
              <PersonalizedDashboard />
              <div className="text-center">
                <button 
                  onClick={() => setCareerState('empty')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reset Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SEOJobCategories />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CTABanner />
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={
              <div className="bg-card rounded-lg p-4 h-48 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <NewsLatestWidget />
            </Suspense>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};
