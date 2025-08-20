
import React from 'react';
import { LearningDashboard } from '@/components/learning/dashboard/LearningDashboard';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, Award, Sparkles, Target, Users, ArrowRight, Play, Clock, Star } from 'lucide-react';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

const Learning = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Dashboard | TalentXcel',
      description: 'Personalized courses, learning paths, progress, and community.'
    });
  }, []);
  return <LearningDashboard />;
};

export default Learning;
