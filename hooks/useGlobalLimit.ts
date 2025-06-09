import { useState, useEffect } from 'react';

const STORAGE_KEY = 'global_items_per_page_limit';
const DEFAULT_LIMIT = 20;

export function useGlobalLimit() {
  // Initialize state with the value from localStorage or default
  const [limit, setLimit] = useState<number>(() => {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      return storedValue ? parseInt(storedValue, 10) : DEFAULT_LIMIT;
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      return DEFAULT_LIMIT;
    }
  });

  // Update localStorage when limit changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, limit.toString());
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }, [limit]);

  return {
    limit,
    setLimit,
    DEFAULT_LIMIT
  };
} 