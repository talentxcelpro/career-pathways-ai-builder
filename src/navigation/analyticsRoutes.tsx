import React from 'react';
import { BarChart3, TrendingUp, MapPin, DollarSign, Users, Zap } from "lucide-react";
import { RecruiterDashboard } from "@/components/dashboard/RecruiterDashboard";
import { TrendingJobsAnalytics } from "@/components/analytics/TrendingJobsAnalytics";
import { SalaryInsights } from "@/components/analytics/SalaryInsights";
import { RegionalHiringTrends } from "@/components/analytics/RegionalHiringTrends";
import { AutoUpdateSystem } from "@/components/performance/AutoUpdateSystem";

export const analyticsRoutes = [
  {
    title: "Recruiter Dashboard",
    to: "/analytics/recruiter",
    icon: <Users className="h-4 w-4" />,
    page: <RecruiterDashboard />,
    description: "AI-powered recruitment analytics and candidate management"
  },
  {
    title: "Trending Jobs Analytics",
    to: "/analytics/trending-jobs",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <TrendingJobsAnalytics />,
    description: "Real-time job market trends and demand forecasting"
  },
  {
    title: "Salary Insights",
    to: "/analytics/salary-insights", 
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryInsights />,
    description: "Comprehensive salary analytics with real-time market data"
  },
  {
    title: "Regional Hiring Trends",
    to: "/analytics/regional-trends",
    icon: <MapPin className="h-4 w-4" />,
    page: <RegionalHiringTrends />,
    description: "Geographic hiring patterns and talent migration insights"
  },
  {
    title: "Performance & Auto-Update",
    to: "/analytics/performance",
    icon: <Zap className="h-4 w-4" />,
    page: <AutoUpdateSystem />,
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