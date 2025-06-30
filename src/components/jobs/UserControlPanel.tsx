
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Bell, Eye, Heart, EyeOff, RotateCcw, Plus } from "lucide-react";

export const UserControlPanel: React.FC = () => {
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState("daily");
  const [hideAppliedJobs, setHideAppliedJobs] = useState(false);
  const [matchScoreInsights, setMatchScoreInsights] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">⚙️ User Control & Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">🔁 Save Filter Set</span>
              </div>
              <Button size="sm" variant="outline">
                Save Current
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">📬 Job Alerts</span>
              </div>
              <Switch
                checked={jobAlertsEnabled}
                onCheckedChange={setJobAlertsEnabled}
              />
            </div>

            {jobAlertsEnabled && (
              <div className="ml-6 space-y-2">
                <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">📈 Match Score Insights</span>
              </div>
              <Switch
                checked={matchScoreInsights}
                onCheckedChange={setMatchScoreInsights}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">❌ Hide Applied Jobs</span>
              </div>
              <Switch
                checked={hideAppliedJobs}
                onCheckedChange={setHideAppliedJobs}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">❤️ Wishlist Jobs</span>
              </div>
              <Badge variant="secondary">5 Saved</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">👁️ Hide Industries</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  Insurance <button className="ml-1">×</button>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Real Estate <button className="ml-1">×</button>
                </Badge>
                <Button size="sm" variant="ghost" className="h-6 px-2">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">🔔 Subscribe for real-time alerts</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Subscribe Now
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get notified instantly when jobs matching your criteria are posted
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
