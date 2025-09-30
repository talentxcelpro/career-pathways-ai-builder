import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Memoized card component to prevent unnecessary re-renders
export const MemoizedCard = React.memo(Card);
export const MemoizedCardContent = React.memo(CardContent);
export const MemoizedCardHeader = React.memo(CardHeader);
export const MemoizedCardTitle = React.memo(CardTitle);
export const MemoizedButton = React.memo(Button);

// Generic memoized list item
interface ListItemProps {
  id: string;
  title: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const MemoizedListItem = React.memo<ListItemProps>(
  ({ id, title, description, onClick, children }) => (
    <div
      key={id}
      onClick={onClick}
      className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
    >
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description
    );
  }
);

MemoizedListItem.displayName = 'MemoizedListItem';
