import React, { memo, useMemo, useRef, useCallback } from 'react';
import { FixedSizeList } from 'react-window';

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
  const listRef = useRef<FixedSizeList>(null);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  ), [items, renderItem]);

  const memoizedRow = useMemo(() => memo(Row), [Row]);

  return (
    <div className={className}>
      <FixedSizeList
        ref={listRef}
        height={containerHeight}
        width="100%"
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscan}
        itemData={items}
      >
        {memoizedRow}
      </FixedSizeList>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;