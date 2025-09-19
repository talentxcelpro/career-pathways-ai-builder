import React from 'react';
import { Users, Building2, Brain, RefreshCw, TrendingUp, Target, Database, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SystemOverview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TalentXcel System Architecture
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A complete two-sided marketplace powered by AI, creating a self-improving loop between 
            job seekers and organizations through continuous data enrichment and intelligent matching.
          </p>
        </div>

        {/* Core System Logic */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Core System Logic
            </CardTitle>
            <CardDescription>
              The platform operates on a symbiotic relationship between B2C data generation and B2B value consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">B2C Data Generation</h3>
                <p className="text-sm text-muted-foreground">Professionals create verified profiles and career data</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold">AI Processing Engine</h3>
                <p className="text-sm text-muted-foreground">Continuous learning and intelligent matching algorithms</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold">B2B Value Delivery</h3>
                <p className="text-sm text-muted-foreground">Organizations access enriched talent data and analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Sided Engine */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* B2C Engine */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Users className="h-5 w-5" />
                B2C Engine: The Professional's Journey
              </CardTitle>
              <CardDescription>Data generation side - Every professional becomes a node in the talent network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Profile Building & Enrichment</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-optimized resumes enhanced with Career Passport data including verified projects, 
                      certifications, and skills serving as the foundation for the entire system.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Career Mapping & Skill Development</h4>
                    <p className="text-sm text-muted-foreground">
                      AI recommends specific skills to acquire, courses to take, and potential career paths 
                      based on profile and stated career goals.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Active Job Searching</h4>
                    <p className="text-sm text-muted-foreground">
                      System tracks application success rates, interview performance, and placement outcomes 
                      to continuously improve matching algorithms.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Data Generation Hub
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* B2B Engine */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Building2 className="h-5 w-5" />
                B2B Engine: The Organization's Talent Engine
              </CardTitle>
              <CardDescription>Value consumption side - Organizations access and enrich verified talent data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">AI-Powered Talent Sourcing</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced search engine finds professionals based on verified skills, ranking by 
                      skill match quality and upskilling activity, not just keywords.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Talent Analytics Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Insights including Talent Heatmaps showing skill concentration by region and 
                      Compensation Tracker for competitive salary analysis.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Internal Mobility & Skill Gap Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      HR system integration for internal candidate recommendations and company-wide 
                      skill gap identification with targeted training recommendations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Value Consumption Hub
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continuous Feedback Loop */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <RefreshCw className="h-5 w-5" />
              The Continuous Feedback Loop
            </CardTitle>
            <CardDescription>What makes the system robust and self-improving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Successful Matching</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  When recruiters hire candidates from the platform, the system records successful matches, 
                  continuously improving algorithm accuracy for future recommendations.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Market Demand Intelligence</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Skill gap analysis across companies identifies market trends. High demand skills 
                  (e.g., Python for data science) are proactively promoted to B2C users.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Data Enrichment Cycle</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Updated Career Passports from course completions increase professional visibility to recruiters, 
                  reinforcing the value of continuous learning and platform engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Platform Value Proposition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">For Professionals (B2C)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    AI-optimized career development and skill recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Verified skill tracking through Career Passport
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Intelligent job matching based on verified competencies
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Market-driven skill development guidance
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-700">For Organizations (B2B)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Access to verified talent with proven skill competencies
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Comprehensive talent analytics and market insights
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Internal mobility optimization and skill gap analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Reduced recruitment costs through intelligent matching
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemOverview;