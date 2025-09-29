import React from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PeopleTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Network People</h2>
      </div>
      <p className="text-muted-foreground">
        People networking functionality will be implemented here.
      </p>
    </Card>
  );
}