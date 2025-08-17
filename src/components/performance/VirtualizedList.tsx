import React, { memo, useMemo, useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

function VirtualizedListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  ), [items, renderItem]);

  const memoizedRow = useMemo(() => memo(Row), [Row]);

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscan}
        itemData={items}
      >
        {memoizedRow}
      </List>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;