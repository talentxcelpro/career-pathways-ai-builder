import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, Bell, BarChart3 } from "lucide-react";

export default function JobVisibilityForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Job Visibility & AI Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Job Visibility
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Job remains live for 15 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Auto-expiry with email reminders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Extend or repost anytime from dashboard</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            AI Filters & Matching (Built-in Intelligence)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">🎯 AI Match Score</h4>
                <p className="text-xs text-muted-foreground">Ranks candidates based on JD relevance</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">📋 Smart Resume Parsing</h4>
                <p className="text-xs text-muted-foreground">Auto-tags resumes by skills, education, experience</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">💡 AI Suggestions</h4>
                <p className="text-xs text-muted-foreground">Recommends top 10 matches from TalentXcel pool</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">🔍 Smart Filters</h4>
                <p className="text-xs text-muted-foreground">Filter by match score, skills, location, experience</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">🔔 Alerts</h4>
                <p className="text-xs text-muted-foreground">Receive notifications when high-fit profiles apply</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">📊 Analytics</h4>
                <p className="text-xs text-muted-foreground">Track views, clicks, applications, and drop-off points</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}