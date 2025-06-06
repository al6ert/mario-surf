import React from 'react';
import { LIMIT } from '../hooks/usePaginatedData';

interface ItemsPerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
}

export const ITEMS_PER_PAGE_OPTIONS = [5, 20, 50, 100];

export default function ItemsPerPageSelect({ 
  value = LIMIT, 
  onChange, 
  onPageChange,
  className = "px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
}: ItemsPerPageSelectProps) {
  return (
    <select
      value={value}
      onChange={e => { 
        onPageChange(1); 
        onChange(Number(e.target.value)); 
      }}
      className={className}
    >
      {ITEMS_PER_PAGE_OPTIONS.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
} 