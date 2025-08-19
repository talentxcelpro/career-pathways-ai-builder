import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BarChart3, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Settings 
} from "lucide-react";

const navigationItems = [
  { icon: Home, label: "Feed", active: true },
  { icon: BarChart3, label: "Dashboard" },
  { icon: Users, label: "My Network" },
  { icon: Briefcase, label: "Jobs" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Set Up Services" },
];

export const NetworkNavigation = () => {
  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start h-10 px-4 rounded-none ${
                item.active 
                  ? 'bg-muted text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};