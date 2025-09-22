import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnterpriseMetrics {
  totalLearners: number;
  completionRate: number;
  totalHours: number;
  roiImpact: number;
  topPerformers: Array<{
    name: string;
    role: string;
    score: number;
  }>;
  departmentStats: Array<{
    name: string;
    completion: number;
  }>;
  skillsGaps: Array<{
    skill: string;
    department: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  totalInvestment: number;
  investmentBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  businessImpact: Array<{
    metric: string;
    improvement: string;
  }>;
}

interface ChartData {
  progressTrends: Array<{
    month: string;
    completed: number;
    inProgress: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  dailyEngagement: Array<{
    date: string;
    activeUsers: number;
  }>;
  sessionDuration: Array<{
    duration: string;
    count: number;
  }>;
  courseRatings: Array<{
    course: string;
    rating: number;
  }>;
  skillsProgress: Array<{
    skill: string;
    before: number;
    after: number;
  }>;
}

interface RealTimeData {
  activities: Array<{
    user: string;
    action: string;
    type: 'completion' | 'enrollment' | 'progress';
    time: string;
  }>;
  activeConnections: number;
}

export const useEnterpriseAnalytics = (timeRange: string) => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activities: [],
    activeConnections: 0
  });

  // Fetch enterprise metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['enterprise-metrics', timeRange],
    queryFn: async () => {
      // Mock data for enterprise metrics
      const mockMetrics: EnterpriseMetrics = {
        totalLearners: 12847,
        completionRate: 87.3,
        totalHours: 45621,
        roiImpact: 2840000,
        topPerformers: [
          { name: 'Sarah Johnson', role: 'Senior Developer', score: 96 },
          { name: 'Michael Chen', role: 'Product Manager', score: 94 },
          { name: 'Emily Rodriguez', role: 'UX Designer', score: 92 },
          { name: 'David Kim', role: 'Data Scientist', score: 90 },
          { name: 'Lisa Wang', role: 'Marketing Lead', score: 88 }
        ],
        departmentStats: [
          { name: 'Engineering', completion: 92 },
          { name: 'Product', completion: 89 },
          { name: 'Design', completion: 85 },
          { name: 'Marketing', completion: 78 },
          { name: 'Sales', completion: 73 }
        ],
        skillsGaps: [
          { skill: 'Machine Learning', department: 'Engineering', priority: 'high' },
          { skill: 'Data Analysis', department: 'Product', priority: 'high' },
          { skill: 'Cloud Architecture', department: 'Engineering', priority: 'medium' },
          { skill: 'Digital Marketing', department: 'Marketing', priority: 'medium' },
          { skill: 'Leadership', department: 'Management', priority: 'low' }
        ],
        totalInvestment: 1250000,
        investmentBreakdown: [
          { category: 'Platform Licenses', amount: 450000 },
          { category: 'Content Creation', amount: 320000 },
          { category: 'Employee Time', amount: 280000 },
          { category: 'Infrastructure', amount: 150000 },
          { category: 'Support & Training', amount: 50000 }
        ],
        businessImpact: [
          { metric: 'Employee Productivity', improvement: '+23% increase' },
          { metric: 'Time to Competency', improvement: '-40% reduction' },
          { metric: 'Employee Retention', improvement: '+15% improvement' },
          { metric: 'Internal Mobility', improvement: '+45% increase' },
          { metric: 'Innovation Index', improvement: '+30% boost' }
        ]
      };

      return mockMetrics;
    }
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['enterprise-charts', timeRange],
    queryFn: async () => {
      // Mock data for charts
      const mockChartData: ChartData = {
        progressTrends: [
          { month: 'Jan', completed: 145, inProgress: 67 },
          { month: 'Feb', completed: 178, inProgress: 89 },
          { month: 'Mar', completed: 203, inProgress: 112 },
          { month: 'Apr', completed: 234, inProgress: 98 },
          { month: 'May', completed: 267, inProgress: 134 },
          { month: 'Jun', completed: 289, inProgress: 156 }
        ],
        categoryDistribution: [
          { name: 'Technical Skills', value: 35 },
          { name: 'Leadership', value: 25 },
          { name: 'Communication', value: 20 },
          { name: 'Industry Knowledge', value: 12 },
          { name: 'Compliance', value: 8 }
        ],
        dailyEngagement: [
          { date: '2024-01-01', activeUsers: 1234 },
          { date: '2024-01-02', activeUsers: 1456 },
          { date: '2024-01-03', activeUsers: 1678 },
          { date: '2024-01-04', activeUsers: 1345 },
          { date: '2024-01-05', activeUsers: 1567 },
          { date: '2024-01-06', activeUsers: 1789 },
          { date: '2024-01-07', activeUsers: 1432 }
        ],
        sessionDuration: [
          { duration: '0-15 min', count: 245 },
          { duration: '15-30 min', count: 567 },
          { duration: '30-45 min', count: 789 },
          { duration: '45-60 min', count: 456 },
          { duration: '60+ min', count: 234 }
        ],
        courseRatings: [
          { course: 'React Fundamentals', rating: 4.8 },
          { course: 'Data Science', rating: 4.6 },
          { course: 'Leadership Skills', rating: 4.5 },
          { course: 'Cloud Computing', rating: 4.7 },
          { course: 'UX Design', rating: 4.4 }
        ],
        skillsProgress: [
          { skill: 'JavaScript', before: 65, after: 85 },
          { skill: 'Python', before: 45, after: 78 },
          { skill: 'Leadership', before: 55, after: 74 },
          { skill: 'Design Thinking', before: 38, after: 69 },
          { skill: 'Data Analysis', before: 42, after: 71 }
        ]
      };

      return mockChartData;
    }
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        user: `User ${Math.floor(Math.random() * 1000)}`,
        action: [
          'completed "Advanced React" course',
          'enrolled in "Machine Learning Basics"',
          'achieved 50% progress in "Leadership Skills"',
          'earned certification in "Cloud Computing"',
          'started "Data Science Fundamentals"'
        ][Math.floor(Math.random() * 5)],
        type: ['completion', 'enrollment', 'progress'][Math.floor(Math.random() * 3)] as any,
        time: new Date().toLocaleTimeString()
      };

      setRealTimeData(prev => ({
        ...prev,
        activities: [newActivity, ...prev.activities.slice(0, 19)],
        activeConnections: 2847 + Math.floor(Math.random() * 100)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const exportData = async (format: 'pdf' | 'csv') => {
    // Mock export functionality
    console.log(`Exporting data in ${format} format...`);
    // In a real implementation, this would generate and download the file
  };

  return {
    metrics,
    chartData,
    realTimeData,
    exportData,
    isLoading: metricsLoading || chartLoading
  };
};