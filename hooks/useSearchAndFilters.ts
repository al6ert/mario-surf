import { useSearch } from './useSearch';
import { useFilters } from './useFilters';

export function useSearchAndFilters<T extends string>(initialFilter: T) {
  const {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    page,
    setPage
  } = useSearch();

  const {
    filter,
    setFilter,
    appliedFilter
  } = useFilters<T>(initialFilter, page, setPage);

  return {
    searchTerm,
    setSearchTerm,
    appliedSearch,
    filter,
    setFilter,
    appliedFilter,
    page,
    setPage
  };
} 