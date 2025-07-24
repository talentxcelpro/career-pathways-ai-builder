import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const NotificationsDebug = () => {
  console.log('DEBUG: Simple component rendering');
  
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Debug Notifications Page</h1>
          <p className="text-muted-foreground mt-2">
            This is a minimal component to test if the infinite loop is resolved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsDebug;