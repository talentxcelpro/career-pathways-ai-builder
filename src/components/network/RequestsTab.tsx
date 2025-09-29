import React from 'react';
import { Card } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function RequestsTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Connection Requests</h2>
      </div>
      <p className="text-muted-foreground">
        Connection requests functionality will be implemented here.
      </p>
    </Card>
  );
}