import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  FileText, 
  Briefcase, 
  Users, 
  Calendar,
  ExternalLink,
  Trash2,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedItem {
  id: string;
  item_type: 'post' | 'job' | 'course' | 'event' | 'article';
  item_id: string;
  title: string;
  description?: string;
  url?: string;
  saved_at: string;
  metadata?: any;
}

interface SavedItemsProps {
  userId: string;
}

export const SavedItems: React.FC<SavedItemsProps> = ({ userId }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: savedItems, isLoading } = useQuery({
    queryKey: ['saved-items', userId],
    queryFn: async () => {
      // Mock data for now - in real app, fetch from saved_items table
      const mockSavedItems: SavedItem[] = [
        {
          id: '1',
          item_type: 'post',
          item_id: 'post1',
          title: 'How to Build a Great Professional Network',
          description: 'Tips and strategies for effective networking in the digital age...',
          saved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { author: 'John Doe', likes: 142 }
        },
        {
          id: '2',
          item_type: 'job',
          item_id: 'job1',
          title: 'Senior Software Engineer at TechCorp',
          description: 'Join our innovative team building next-generation solutions...',
          url: '/jobs/senior-software-engineer-techcorp',
          saved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { company: 'TechCorp', location: 'San Francisco, CA', salary: '$120k-$150k' }
        },
        {
          id: '3',
          item_type: 'course',
          item_id: 'course1',
          title: 'Advanced React Development',
          description: 'Master advanced React patterns and best practices...',
          url: '/learning/advanced-react-development',
          saved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { duration: '6 weeks', difficulty: 'Advanced', rating: 4.8 }
        },
        {
          id: '4',
          item_type: 'event',
          item_id: 'event1',
          title: 'Tech Leadership Summit 2024',
          description: 'Annual conference for technology leaders and innovators...',
          url: '/events/tech-leadership-summit-2024',
          saved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { date: '2024-03-15', location: 'New York, NY', price: '$299' }
        }
      ];
      return mockSavedItems;
    }
  });

  const removeSavedItem = useMutation({
    mutationFn: async (itemId: string) => {
      // In real app, delete from saved_items table
      console.log('Removing saved item:', itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items', userId] });
      toast.success('Item removed from saved items');
    },
    onError: () => {
      toast.error('Failed to remove item');
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All Items', icon: Bookmark },
    { value: 'post', label: 'Posts', icon: FileText },
    { value: 'job', label: 'Jobs', icon: Briefcase },
    { value: 'course', label: 'Courses', icon: Users },
    { value: 'event', label: 'Events', icon: Calendar }
  ];

  const filteredItems = savedItems?.filter(item => 
    selectedFilter === 'all' || item.item_type === selectedFilter
  ) || [];

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'course': return <Users className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <Bookmark className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold">Saved Items</h2>
            <Badge variant="secondary">{filteredItems.length}</Badge>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(option => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={selectedFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(option.value)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No saved items</h3>
            <p className="text-muted-foreground">
              {selectedFilter === 'all' 
                ? "You haven't saved any items yet. Start exploring and save interesting content!"
                : `No saved ${selectedFilter}s found. Try exploring ${selectedFilter}s and save the ones you like.`
              }
            </p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-[hsl(var(--primary)/0.1)] rounded-lg text-[hsl(var(--primary))]">
                    {getItemIcon(item.item_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.item_type}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Metadata based on item type */}
                    {item.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {item.item_type === 'job' && (
                          <>
                            <span>{item.metadata.company}</span>
                            <span>{item.metadata.location}</span>
                            <span>{item.metadata.salary}</span>
                          </>
                        )}
                        {item.item_type === 'course' && (
                          <>
                            <span>{item.metadata.duration}</span>
                            <span>{item.metadata.difficulty}</span>
                            <span>★ {item.metadata.rating}</span>
                          </>
                        )}
                        {item.item_type === 'event' && (
                          <>
                            <span>{item.metadata.date}</span>
                            <span>{item.metadata.location}</span>
                            <span>{item.metadata.price}</span>
                          </>
                        )}
                        {item.item_type === 'post' && (
                          <>
                            <span>by {item.metadata.author}</span>
                            <span>{item.metadata.likes} likes</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Saved {formatDate(item.saved_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {item.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSavedItem.mutate(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};