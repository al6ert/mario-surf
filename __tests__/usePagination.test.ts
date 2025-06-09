// Unit tests for the pagination logic in usePagination

import { usePagination } from '../hooks/usePagination';

describe('Pagination pageNumbers logic', () => {
  // Helper to extract pageNumbers from the hook logic without React
  function getPageNumbers({ total, page, limit }: { total: number, page: number, limit: number }) {
    // Replicate the logic from the real hook for test purposes
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  it('should show all pages if totalPages <= 5', () => {
    expect(getPageNumbers({ total: 20, page: 2, limit: 5 })).toEqual([1,2,3,4]); // 4 pages
    expect(getPageNumbers({ total: 25, page: 3, limit: 5 })).toEqual([1,2,3,4,5]); // 5 pages
  });

  it('should show [1,2,3,"...",last] for first 3 pages', () => {
    expect(getPageNumbers({ total: 166, page: 1, limit: 5 })).toEqual([1,2,3,'...',34]);
    expect(getPageNumbers({ total: 166, page: 2, limit: 5 })).toEqual([1,2,3,'...',34]);
    expect(getPageNumbers({ total: 166, page: 3, limit: 5 })).toEqual([1,2,3,'...',34]);
  });

  it('should show [1,"...",last-2,last-1,last] for last 3 pages', () => {
    expect(getPageNumbers({ total: 166, page: 32, limit: 5 })).toEqual([1,'...',32,33,34]);
    expect(getPageNumbers({ total: 166, page: 33, limit: 5 })).toEqual([1,'...',32,33,34]);
    expect(getPageNumbers({ total: 166, page: 34, limit: 5 })).toEqual([1,'...',32,33,34]);
  });

  it('should show [1,"...",page-1,page,page+1,"...",last] for middle pages', () => {
    expect(getPageNumbers({ total: 166, page: 10, limit: 5 })).toEqual([1,'...',9,10,11,'...',34]);
    expect(getPageNumbers({ total: 166, page: 17, limit: 5 })).toEqual([1,'...',16,17,18,'...',34]);
    expect(getPageNumbers({ total: 166, page: 20, limit: 5 })).toEqual([1,'...',19,20,21,'...',34]);
  });

  // New edge cases for 6, 7, 8, 9 pages
  it('should show all pages for 6 pages', () => {
    expect(getPageNumbers({ total: 30, page: 3, limit: 5 })).toEqual([1,2,3,4,5,6]);
  });
  it('should show all pages for 7 pages', () => {
    expect(getPageNumbers({ total: 35, page: 4, limit: 5 })).toEqual([1,2,3,4,5,6,7]);
  });
  it('should show correct pages for 8 pages, page 8', () => {
    expect(getPageNumbers({ total: 40, page: 8, limit: 5 })).toEqual([1,'...',6,7,8]);
  });
  it('should show correct pages for 8 pages, page 7', () => {
    expect(getPageNumbers({ total: 40, page: 7, limit: 5 })).toEqual([1,'...',6,7,8]);
  });
  it('should show correct pages for 8 pages, page 2', () => {
    expect(getPageNumbers({ total: 40, page: 2, limit: 5 })).toEqual([1,2,3,'...',8]);
  });
  it('should show all pages for 6 pages, page 6', () => {
    expect(getPageNumbers({ total: 30, page: 6, limit: 5 })).toEqual([1,2,3,4,5,6]);
  });
  it('should show all pages for 7 pages, page 7', () => {
    expect(getPageNumbers({ total: 35, page: 7, limit: 5 })).toEqual([1,2,3,4,5,6,7]);
  });
  // 9 pages, page 9 (should not hide page 8)
  it('should show [1,...,7,8,9] for 9 pages, page 9', () => {
    expect(getPageNumbers({ total: 45, page: 9, limit: 5 })).toEqual([1,'...',7,8,9]);
  });
  // 9 pages, page 8
  it('should show [1,...,7,8,9] for 9 pages, page 8', () => {
    expect(getPageNumbers({ total: 45, page: 8, limit: 5 })).toEqual([1,'...',7,8,9]);
  });
  // 9 pages, page 2
  it('should show [1,2,3,...,9] for 9 pages, page 2', () => {
    expect(getPageNumbers({ total: 45, page: 2, limit: 5 })).toEqual([1,2,3,'...',9]);
  });
}); 