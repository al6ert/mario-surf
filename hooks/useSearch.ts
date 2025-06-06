import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch(initialPage: number = 1) {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(initialPage);
  
  const debouncedSearch = useDebounce(searchTerm);

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Apply search when page is 1
  useEffect(() => {
    if (page === 1) {
      setAppliedSearch(debouncedSearch);
    }
  }, [debouncedSearch, page]);

  return {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    page,
    setPage
  };
} 