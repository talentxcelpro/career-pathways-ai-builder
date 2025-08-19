import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Eye, Calendar } from "lucide-react";

const statsData = [
  { icon: Users, label: "Connections", value: "433", color: "text-blue-500" },
  { icon: MessageSquare, label: "Messages", value: "0", color: "text-green-500" },
  { icon: Eye, label: "Profile Views", value: "243", color: "text-purple-500" },
  { icon: Calendar, label: "Events", value: "0", color: "text-orange-500" },
];

export const NetworkStatsCard = () => {
  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Network Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statsData.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};