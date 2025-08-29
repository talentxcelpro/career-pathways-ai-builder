
import React, { memo, useMemo, useRef, useCallback } from 'react';
// Use a namespace import for robust CJS/ESM interop
import * as ReactWindow from 'react-window';
import type { FixedSizeList as FixedSizeListType, ListChildComponentProps } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

const { FixedSizeList } = ReactWindow;

function VirtualizedListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualizedListProps<T>) {
  // Use the type-only alias to avoid runtime import issues
  const listRef = useRef<FixedSizeListType<any> | null>(null);

  // Use react-window's data pattern instead of closing over items
  const Row = useCallback(({ index, style, data }: ListChildComponentProps<T[]>) => (
    <div style={style}>
      {renderItem(data[index], index)}
    </div>
  ), [renderItem]);

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
