import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, ShieldCheck, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AffiliateMarketplaceTab from '@/components/affiliate/AffiliateMarketplaceTab';
import { TalentXcelLogo } from '@/components/brand/TalentXcelLogo';

export const AffiliatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-border/60 bg-white/90 dark:bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/network');
                }
              }}
              className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <TalentXcelLogo iconSize={22} textSize="text-sm font-extrabold" />
              <Badge variant="outline" className="text-[10px] font-bold border-cyan-300 text-cyan-700 dark:border-cyan-800 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/30">
                Partner Portal
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/network')}
              className="text-xs font-bold h-8 border-slate-200 dark:border-border"
            >
              Network Feed
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="text-xs font-bold h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Upgrade Pro
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading Affiliate Marketplace...</div>}>
            <AffiliateMarketplaceTab />
          </React.Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AffiliatePage;
