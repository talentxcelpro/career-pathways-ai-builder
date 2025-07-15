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
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-300" />
                <div>
                  <h3 className="font-semibold text-lg">Want to promote your services on TalentXcel?</h3>
                  <p className="text-blue-100 text-sm">
                    Unlock Pro features: Service pages, profile boosting, CRM tools & more
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Starting ₹399/month
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Unlock Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {onDismiss && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDismiss}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
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
        <Card className="mb-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-gray-600 mb-3">
                Showcase your services and get more clients
              </p>
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Profile boosting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Service pages</span>
                </div>
              </div>
              <Button 
                onClick={() => setShowModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
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
        <Card className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">🚀 Want to sell your services?</h4>
                  <p className="text-sm text-gray-600">
                    Get listed in TalentXcel Marketplace and unlock AI tools
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  From ₹399/month
                </Badge>
                <Button 
                  onClick={() => setShowModal(true)}
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
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