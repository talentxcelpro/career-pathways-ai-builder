import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, TrendingUp, X, ArrowRight } from "lucide-react";
import ProSubscriptionModal from './ProSubscriptionModal';

interface ProBannerProps {
  variant: 'top' | 'sidebar' | 'feed';
  onDismiss?: () => void;
}

const ProBanner: React.FC<ProBannerProps> = ({ variant, onDismiss }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSubscriptionSuccess = () => {
    // Refresh the page to show Pro features
    window.location.reload();
  };

  if (variant === 'top') {
    return (
      <>
        <Card className="mb-2 bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-indigo-500/90 text-white border-0 shadow-xl rounded-2xl backdrop-blur-md overflow-hidden">
          <CardContent className="p-2 sm:p-3 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full border border-white/20">
                  <Crown className="h-3 w-3 text-yellow-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-white tracking-tight truncate">Promote your services</h3>
                  <p className="text-white/80 text-[10px] sm:text-xs leading-tight hidden sm:block font-medium">
                    Pro features & CRM tools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 font-semibold border border-white/20 rounded-full">
                  ₹399/mo
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  size="sm"
                  className="bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-6 sm:h-7 font-semibold rounded-full shadow-lg border border-white/20 transition-all duration-200"
                >
                  Get Pro
                </Button>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDismiss}
                    className="text-white/80 hover:bg-white/10 h-5 w-5 sm:h-6 sm:w-6 p-0 rounded-full backdrop-blur-sm transition-all duration-200"
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ProSubscriptionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      </>
    );
  }

  if (variant === 'sidebar') {
    return (
      <>
        <Card className="mb-2 bg-gradient-to-br from-slate-50/95 via-gray-50/95 to-zinc-50/95 border border-gray-200/60 shadow-xl rounded-2xl backdrop-blur-md overflow-hidden">
          <CardContent className="p-2.5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 pointer-events-none" />
            <div className="text-center relative">
              <div className="flex justify-center mb-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1.5 rounded-full shadow-lg border border-white/20">
                  <Crown className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-xs tracking-tight">Upgrade to Pro</h3>
              <p className="text-[10px] text-gray-600 mb-2 leading-tight font-medium">
                Showcase services & get clients
              </p>
              <div className="space-y-0.5 text-[10px] text-gray-500 mb-2.5 font-medium">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>Profile boost</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Service pages</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-[10px] h-6 font-semibold rounded-full shadow-lg border border-white/20 transition-all duration-200"
                size="sm"
              >
                Get Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        <ProSubscriptionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      </>
    );
  }

  if (variant === 'feed') {
    return (
      <>
        <Card className="mb-2 bg-gradient-to-r from-slate-50/95 via-gray-50/95 to-zinc-50/95 border border-gray-200/60 shadow-xl rounded-2xl backdrop-blur-md overflow-hidden">
          <CardContent className="p-2.5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 pointer-events-none" />
            <div className="flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg border border-white/20">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-xs truncate tracking-tight">Sell your services</h4>
                  <p className="text-[10px] text-gray-600 leading-tight hidden sm:block font-medium">
                    Get listed in marketplace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant="outline" className="border-green-500/30 text-green-700 text-[10px] px-2 py-1 font-semibold rounded-full bg-white/80 backdrop-blur-sm">
                  ₹399/mo
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-[10px] px-2 sm:px-3 py-1 h-6 sm:h-7 font-semibold rounded-full shadow-lg border border-white/20 text-white transition-all duration-200"
                >
                  Try Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProSubscriptionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      </>
    );
  }

  return null;
};

export default ProBanner;