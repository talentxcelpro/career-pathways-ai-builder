import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const Notifications = () => {
  console.log('MINIMAL Notifications component rendering');
  
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">TalentXcel Notifications</h1>
            </div>
            
            <p className="text-muted-foreground">
              Minimal working notifications page - testing for infinite loops
            </p>
            
            <div className="space-y-4">
              <p className="text-lg">Counter: {count}</p>
              <Button 
                onClick={() => setCount(prev => prev + 1)}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Button (Count: {count})
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              If this page loads without errors, the infinite loop is resolved.
              <br />
              Check console for "MINIMAL Notifications component rendering" logs.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;