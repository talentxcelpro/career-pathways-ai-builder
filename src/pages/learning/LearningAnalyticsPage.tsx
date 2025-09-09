import React from 'react';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { AnalyticsView } from '@/components/learning/AnalyticsView';
import { updateMetaTags } from '@/utils/metaTags';
import { BarChart3 } from 'lucide-react';

const LearningAnalyticsPage = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Analytics | TalentXcel Learning',
      description: 'Detailed insights into your learning progress, skill development, and career growth metrics.'
    });
  }, []);

  return (
    <LearningLayout>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
          <p className="text-gray-600">
            Track your progress, understand your learning patterns, and optimize your journey
          </p>
        </div>
      </div>

      {/* Analytics Content */}
      <AnalyticsView />
    </LearningLayout>
  );
};

export default LearningAnalyticsPage;