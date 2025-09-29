import React from 'react';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function CVSearchTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Search className="h-6 w-6" />
        <h2 className="text-xl font-semibold">CV Search</h2>
      </div>
      <p className="text-muted-foreground">
        CV search functionality will be implemented here.
      </p>
    </Card>
  );
}