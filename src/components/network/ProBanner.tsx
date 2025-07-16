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
        <Card className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-300" />
                <div>
                  <h3 className="font-medium text-sm">Promote your services on TalentXcel</h3>
                  <p className="text-blue-100 text-xs">
                    Pro features: Service pages, profile boosting & CRM tools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-0.5">
                  ₹399/mo
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-xs px-3 py-1 h-7"
                >
                  Unlock Pro
                </Button>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDismiss}
                    className="text-white hover:bg-white/10 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
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
        <Card className="mb-3 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-sm">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1 text-sm">Upgrade to Pro</h3>
              <p className="text-xs text-gray-600 mb-2">
                Showcase services & get clients
              </p>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Profile boost</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Service pages</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs h-7"
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
        <Card className="mb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <Sparkles className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Sell your services</h4>
                  <p className="text-xs text-gray-600">
                    Get listed in TalentXcel Marketplace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500 text-green-700 text-xs px-2 py-0.5">
                  ₹399/mo
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 h-7"
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