import { useMemo } from 'react';

interface UsePaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function usePagination({ total, page, limit }: UsePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);

  const pageNumbers = useMemo((): (number | string)[] => {
    // Always show all pages if 7 or fewer
    if (totalPages <= 7) {
      const result = Array.from({ length: totalPages }, (_, i) => i + 1);
      return result;
    }
    // Casos especiales para el principio
    if (page <= 2) {
      const result = [1, 2, 3, '...', totalPages];
      return result;
    }
    if (page === 3) {
      const result = [1, 2, 3, 4, '...', totalPages];
      return result;
    }
    // Casos especiales para el final
    if (page === totalPages - 2) {
      const result = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      return result;
    }
    if (page >= totalPages - 1) {
      const result = [1, '...', totalPages - 2, totalPages - 1, totalPages];
      return result;
    }
    // Caso general
    const result = [1, '...', page - 1, page, page + 1, '...', totalPages];
    return result;
  }, [totalPages, page]);

  return {
    totalPages,
    start,
    end,
    pageNumbers
  };
} 