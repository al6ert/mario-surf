import { useState, useEffect, useContext } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ApiClient } from '../lib/api';
import { useGlobalLimit } from './useGlobalLimit';

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export function usePaginatedData(
  entityType: string,
  options: PaginationOptions
) {
  const { refresh } = useAppContext();
  const { limit: globalLimit } = useGlobalLimit();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, count } = await ApiClient[`get${entityType}`]({
        page: options.page,
        limit: options.limit || globalLimit,
        filters: options.filters,
        sort: options.sort
      });
      
      setData(data);
      setTotal(count);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cuando cambien las opciones
  useEffect(() => {
    fetchData();
  }, [
    options.page, 
    options.limit || globalLimit, 
    JSON.stringify(options.filters),
    options.sort?.field, 
    options.sort?.direction
  ]);

  return {
    data,
    total,
    loading,
    error,
    refresh: fetchData
  };
} 