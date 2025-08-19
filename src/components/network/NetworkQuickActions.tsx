import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Building 
} from "lucide-react";

const quickActions = [
  { icon: Sparkles, label: "AI Assistant" },
  { icon: Users, label: "Find People" },
  { icon: Calendar, label: "Events" },
  { icon: Building, label: "Companies" },
];

export const NetworkQuickActions = () => {
  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-10 text-sm text-muted-foreground hover:text-foreground"
          >
            <action.icon className="w-4 h-4 mr-3" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};