import React from 'react';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default function CVUploadTab() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="h-6 w-6" />
        <h2 className="text-xl font-semibold">CV Upload</h2>
      </div>
      <p className="text-muted-foreground">
        CV upload functionality will be implemented here.
      </p>
    </Card>
  );
}