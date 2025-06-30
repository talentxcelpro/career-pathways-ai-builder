
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ExportButton } from '@/components/admin/ExportButton';

interface NetworkFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  posts: any[];
}

export const NetworkFilters: React.FC<NetworkFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  posts
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts, comments, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filter</Button>
          <ExportButton 
            data={posts || []} 
            filename="network-posts-export" 
            format="csv"
          />
        </div>
      </CardContent>
    </Card>
  );
};
