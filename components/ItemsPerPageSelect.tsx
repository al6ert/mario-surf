import React from 'react';
import { useGlobalLimit } from '../hooks/useGlobalLimit';

interface ItemsPerPageSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

export const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];

export default function ItemsPerPageSelect({ 
  value,
  onChange,
  onPageChange,
  className = "px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
}: ItemsPerPageSelectProps) {
  const { limit: globalLimit, setLimit: setGlobalLimit } = useGlobalLimit();
  const currentLimit = value ?? globalLimit;

  const handleChange = (newLimit: number) => {
    onPageChange(1);
    if (onChange) {
      onChange(newLimit);
    }
    setGlobalLimit(newLimit);
  };

  return (
    <select
      value={currentLimit}
      onChange={e => handleChange(Number(e.target.value))}
      className={className}
    >
      {ITEMS_PER_PAGE_OPTIONS.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
} 