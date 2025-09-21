import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  preloadNextPage?: boolean;
}

export const SmartPagination: React.FC<SmartPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showQuickJumper = false,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize = 20,
  onPageSizeChange,
  preloadNextPage = true
}) => {
  const [jumpValue, setJumpValue] = useState('');

  // Generate smart page numbers to show
  const pageNumbers = useMemo(() => {
    const delta = 2; // Number of pages to show around current page
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    // Add ellipsis if there's a gap
    if (currentPage - delta > 2) {
      pages.push('ellipsis');
    }

    // Add pages around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap before last page
    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Preload next page data
  useEffect(() => {
    if (preloadNextPage && currentPage < totalPages) {
      // This would trigger data preloading for the next page
      // You can implement this based on your data fetching strategy
      const nextPage = currentPage + 1;
      
      // Example: Prefetch next page data
      const prefetchTimeout = setTimeout(() => {
        // triggerPrefetch(nextPage);
        console.debug(`Prefetching page ${nextPage}`);
      }, 1000);

      return () => clearTimeout(prefetchTimeout);
    }
  }, [currentPage, totalPages, preloadNextPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleQuickJump = useCallback(() => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page)) {
      handlePageChange(page);
      setJumpValue('');
    }
  }, [jumpValue, handlePageChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickJump();
    }
  }, [handleQuickJump]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          page === 'ellipsis' ? (
            <div key={`ellipsis-${index}`} className="px-2">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        ))}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-16 h-8 px-2 text-sm border rounded"
            placeholder="Page"
          />
          <Button size="sm" onClick={handleQuickJump}>
            Go
          </Button>
        </div>
      )}

      {/* Page size changer */}
      {showSizeChanger && onPageSizeChange && (
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 text-sm border rounded"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      )}

      {/* Page info */}
      <div className="text-sm text-muted-foreground ml-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};