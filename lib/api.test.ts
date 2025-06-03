import { ApiClient } from './api';
import { supabase } from './supabase';

// Flexible chainable mock for supabase queries
function createQueryMock(finalResult: any) {
  const chain = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    range: jest.fn(() => chain),
    ilike: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    or: jest.fn(() => chain),
    filter: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
    then: undefined, // will be set below
  };
  // Make the mock awaitable
  chain.then = ((onFulfilled: any) => Promise.resolve(finalResult).then(onFulfilled)) as any;
  return chain;
}

jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvoices', () => {
    it('should handle search filter by number and client name correctly', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 'INV-21',
            clients: { name: 'Cliente 21' }
          }
        ],
        count: 1
      };
      const mockChain = createQueryMock(mockResponse);
      (supabase.from as jest.Mock).mockReturnValue(mockChain);
      const result = await ApiClient.getInvoices({
        page: 1,
        limit: 10,
        filters: { search: '21' }
      });
      const expectedSelect = `
                *,
                c:clients(),       
                clients(name),     
                items:invoice_items(*)
              `;
      const actualSelect = mockChain.select.mock.calls[0][0];
      expect(actualSelect.replace(/\s+/g, ' ').trim()).toBe(expectedSelect.replace(/\s+/g, ' ').trim());
      expect(mockChain.or).toHaveBeenCalledWith('c.not.is.null,number.ilike.%21%');
      expect(result).toEqual(mockResponse);
    });

    it('should handle status filter correctly', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 'INV-001',
            status: 'paid'
          }
        ],
        count: 1
      };
      const mockChain = createQueryMock(mockResponse);
      (supabase.from as jest.Mock).mockReturnValue(mockChain);
      const result = await ApiClient.getInvoices({
        page: 1,
        limit: 10,
        filters: { status: 'paid' }
      });
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'paid');
      expect(result).toEqual(mockResponse);
    });

    it('should handle both search and status filters', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            number: 'INV-21',
            status: 'paid',
            clients: { name: 'Cliente 21' }
          }
        ],
        count: 1
      };
      const mockChain = createQueryMock(mockResponse);
      (supabase.from as jest.Mock).mockReturnValue(mockChain);
      const result = await ApiClient.getInvoices({
        page: 1,
        limit: 10,
        filters: { search: '21', status: 'paid' }
      });
      const expectedSelect = `
                *,
                c:clients(),       
                clients(name),     
                items:invoice_items(*)
              `;
      const actualSelect = mockChain.select.mock.calls[0][0];
      expect(actualSelect.replace(/\s+/g, ' ').trim()).toBe(expectedSelect.replace(/\s+/g, ' ').trim());
      expect(mockChain.or).toHaveBeenCalledWith('c.not.is.null,number.ilike.%21%');
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'paid');
      expect(result).toEqual(mockResponse);
    });
  });
}); 