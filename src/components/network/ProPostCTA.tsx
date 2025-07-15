import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProSubscriptionModal from './ProSubscriptionModal';

interface ProPostCTAProps {
  authorName: string;
  authorPlan: string;
}

const ProPostCTA: React.FC<ProPostCTAProps> = ({ authorName, authorPlan }) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  // Check if current user has Pro access
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('pro_status, pro_plan')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  const handleSubscriptionSuccess = () => {
    window.location.reload();
  };

  // Hide CTA if user already has Pro access
  if (userProfile?.pro_status === 'active') {
    return null;
  }

  return (
    <>
      <Card className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-indigo-600" />
              <p className="text-sm text-gray-700">
                <span className="font-medium">{authorName}</span> is using TalentXcel Pro
              </p>
            </div>
            <Button 
              onClick={() => setShowModal(true)}
              size="sm" 
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Get Pro
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Want to unlock your service page and promote your business?
          </p>
        </CardContent>
      </Card>

      <ProSubscriptionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    </>
  );
};

export default ProPostCTA;