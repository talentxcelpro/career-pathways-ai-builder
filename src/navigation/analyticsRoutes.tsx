import React, { lazy } from 'react';
import { BarChart3, TrendingUp, MapPin, DollarSign, Users, Zap } from "lucide-react";

const RecruiterCommandCenter = lazy(() => import("@/components/dashboard/RecruiterDashboard").then(m => ({ default: m.RecruiterCommandCenter })));
const TrendingJobsCareerAnalytics = lazy(() => import("@/components/analytics/TrendingJobsAnalytics").then(m => ({ default: m.TrendingJobsCareerAnalytics })));
const SalaryInsights = lazy(() => import("@/components/analytics/SalaryInsights").then(m => ({ default: m.SalaryInsights })));
const RegionalHiringTrends = lazy(() => import("@/components/analytics/RegionalHiringTrends").then(m => ({ default: m.RegionalHiringTrends })));
const AutoUpdateSystem = lazy(() => import("@/components/performance/AutoUpdateSystem").then(m => ({ default: m.AutoUpdateSystem })));

export const IntelligenceMatrixRoutes = [
  {
    title: "Recruiter Intelligence Hub",
    to: "/IntelligenceMatrix/recruiter",
    icon: <Users className="h-4 w-4" />,
    page: <RecruiterCommandCenter />,
    description: "Performance recruitment Intelligence Matrix and candidate management"
  },
  {
    title: "Trending Jobs Intelligence",
    to: "/IntelligenceMatrix/trending-jobs",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <TrendingJobsCareerAnalytics />,
    description: "Real-time job market trends and demand forecasting"
  },
  {
    title: "Salary Insights",
    to: "/IntelligenceMatrix/salary-insights", 
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryInsights />,
    description: "Comprehensive salary Intelligence Matrix with real-time market data"
  },
  {
    title: "Regional Hiring Trends",
    to: "/IntelligenceMatrix/regional-trends",
    icon: <MapPin className="h-4 w-4" />,
    page: <RegionalHiringTrends />,
    description: "Geographic hiring patterns and talent migration insights"
  },
  {
    title: "Performance Sync Hub",
    to: "/IntelligenceMatrix/performance",
    icon: <Zap className="h-4 w-4" />,
    page: <AutoUpdateSystem />,
    description: "Real-time performance metrics and synchronization system"
  },
  {
    title: "Ecosystem Intelligence",
    to: "/IntelligenceMatrix/market",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Ecosystem Intelligence Hub</h1>
      <p className="text-muted-foreground">Advanced ecosystem Intelligence Matrix and competitive intelligence coming soon!</p>
    </div>,
    description: "Advanced ecosystem Intelligence Matrix and competitive intelligence"
  }
];
