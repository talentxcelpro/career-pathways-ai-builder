import React from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { LearningAnalyticsCard } from '@/components/learning/LearningAnalyticsCard';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';

const LearningAnalyticsPage = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Analytics | TalentXcel Learning',
      description: 'Track your learning progress, analyze your performance, and optimize your study habits.'
    });
    
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
            <p className="text-gray-600">
              Track your progress and optimize your learning journey
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <LearningAnalyticsCard userId={user?.id} />
      </div>
    </div>
  );
};

export default LearningAnalyticsPage;