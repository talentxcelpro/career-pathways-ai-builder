
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Heart, RotateCcw, FileText, Settings } from "lucide-react";

export const PersonalInsights: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Personal Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">💼 Resume Match</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">72%</span>
              <Badge variant="secondary" className="text-xs">✅ Good</Badge>
            </div>
          </div>
          <Progress value={72} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium">📬 Weekly Job Alerts</div>
              <div className="text-green-600">Enabled</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <div className="font-medium">❤️ Wishlist Jobs</div>
              <div className="text-blue-600">5 Saved</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">🔄 Last Filter Saved</div>
              <div className="text-gray-600">2 Days Ago</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            <div>
              <div className="font-medium">📈 Profile Views</div>
              <div className="text-purple-600">24 This Week</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full">
            🔗 Update My Resume
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            🔗 Set Job Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
