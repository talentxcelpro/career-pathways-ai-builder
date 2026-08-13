import React from 'react';
import { lazy, Suspense } from 'react';
import { BarChart3, TrendingUp, MapPin, DollarSign, Users, Zap } from "lucide-react";

const AutoUpdateSystem = lazy(() => import('@/components/performance/AutoUpdateSystem').then(m => ({ default: m.AutoUpdateSystem })));
const RegionalHiringTrends = lazy(() => import('@/components/analytics/RegionalHiringTrends').then(m => ({ default: m.RegionalHiringTrends })));
const SalaryInsights = lazy(() => import('@/components/analytics/SalaryInsights').then(m => ({ default: m.SalaryInsights })));
const TrendingJobsAnalytics = lazy(() => import('@/components/analytics/TrendingJobsAnalytics').then(m => ({ default: m.TrendingJobsAnalytics })));
const RecruiterDashboard = lazy(() => import('@/components/dashboard/RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));

export const analyticsRoutes = [
  {
    title: "Recruiter Dashboard",
    to: "/analytics/recruiter",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={null}><RecruiterDashboard /></Suspense>,
    description: "AI-powered recruitment analytics and candidate management"
  },
  {
    title: "Trending Jobs Analytics",
    to: "/analytics/trending-jobs",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Suspense fallback={null}><TrendingJobsAnalytics /></Suspense>,
    description: "Real-time job market trends and demand forecasting"
  },
  {
    title: "Salary Insights",
    to: "/analytics/salary-insights", 
    icon: <DollarSign className="h-4 w-4" />,
    page: <Suspense fallback={null}><SalaryInsights /></Suspense>,
    description: "Comprehensive salary analytics with real-time market data"
  },
  {
    title: "Regional Hiring Trends",
    to: "/analytics/regional-trends",
    icon: <MapPin className="h-4 w-4" />,
    page: <Suspense fallback={null}><RegionalHiringTrends /></Suspense>,
    description: "Geographic hiring patterns and talent migration insights"
  },
  {
    title: "Performance & Auto-Update",
    to: "/analytics/performance",
    icon: <Zap className="h-4 w-4" />,
    page: <Suspense fallback={null}><AutoUpdateSystem /></Suspense>,
    description: "Real-time performance metrics and auto-update system"
  },
  {
    title: "Market Intelligence",
    to: "/analytics/market",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Market Intelligence Hub</h1>
      <p className="text-muted-foreground">Advanced market analytics and competitive intelligence coming soon!</p>
    </div>,
    description: "Advanced market analytics and competitive intelligence"
  }
];