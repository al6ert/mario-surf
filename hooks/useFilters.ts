import { useState, useEffect } from 'react';

export function useFilters<T extends string>(initialFilter: T, page: number, setPage: (page: number) => void) {
  const [filter, setFilter] = useState<T>(initialFilter);
  const [appliedFilter, setAppliedFilter] = useState<T>(initialFilter);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);

  // Apply filter when page is 1
  useEffect(() => {
    if (page === 1) {
      setAppliedFilter(filter);
    }
  }, [filter, page]);

  return {
    filter,
    setFilter,
    appliedFilter
  };
} 