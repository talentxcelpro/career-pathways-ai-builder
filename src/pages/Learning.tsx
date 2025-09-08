
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
      title: 'Learning Hub | TalentXcel',
      description: 'Your comprehensive learning platform with courses, paths, and employment bridge features.'
    });
  }, []);
  
  // Redirect to the new learning hub
  React.useEffect(() => {
    window.location.href = '/learning';
  }, []);

  return null;
};

export default Learning;
