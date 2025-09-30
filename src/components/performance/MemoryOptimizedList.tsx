import React, { useMemo, useCallback, memo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ListItem {
  id: string;
  [key: string]: any;
}

interface MemoryOptimizedListProps<T extends ListItem> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  keyExtractor?: (item: T, index: number) => string;
  overscan?: number;
}

// Memoized list item wrapper
const ListItemWrapper = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: ListItem[];
    renderItem: (item: ListItem, index: number) => React.ReactNode;
  };
}>(({ index, style, data }) => {
  const item = data.items[index];
  
  return (
    <div style={style}>
      {data.renderItem(item, index)}
    </div>
  );
});

ListItemWrapper.displayName = 'ListItemWrapper';

export function MemoryOptimizedList<T extends ListItem>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  keyExtractor = (item) => item.id,
  overscan = 5
}: MemoryOptimizedListProps<T>) {
  const [containerRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Memoize the data object to prevent unnecessary re-renders
  const listData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  // Custom item key function for better performance
  const itemKey = useCallback((index: number) => {
    return keyExtractor(items[index], index);
  }, [items, keyExtractor]);

  // Don't render the list if it's not visible (saves memory)
  if (!isVisible) {
    return (
      <div 
        ref={containerRef}
        className={`${className} flex items-center justify-center`}
        style={{ height: containerHeight }}
      >
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <List
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={listData}
        itemKey={itemKey}
        overscanCount={overscan}
        width="100%"
      >
        {ListItemWrapper}
      </List>
    </div>
  );
}