import { supabase } from './supabase';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Expense, Payroll, Settings } from './supabase';
import { LIMIT } from '../hooks/usePaginatedData';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static async handleError(error: any) {
    console.error('API Error:', error);
    throw new ApiError(error.message || 'An error occurred', error.status);
  }

  // Clients
  static async getClients(options?: {
    page?: number;
    limit?: number;
    filters?: { search?: string };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) {
    try {
      const { page, limit, filters, sort } = options || {};
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(
          `name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},dni.ilike.${searchTerm}`
        );
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      // Apply pagination if provided
      if (page && limit) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return {
        data: data as Client[],
        count
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getClient(id: number) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Client;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateClient(id: number, client: Partial<Client>) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteClient(id: number) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Activities
  static async getActivities(options?: {
    page?: number;
    limit?: number;
    filters?: { search?: string };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) {
    try {
      const { page, limit, filters, sort } = options || {};
      let query = supabase
        .from('activities')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.ilike('name', searchTerm);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      // Apply pagination if provided
      if (page && limit) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return {
        data: data as Activity[],
        count: count || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getActivity(id: number) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Activity;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();
      
      if (error) throw error;
      return data as Activity;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateActivity(id: number, activity: Partial<Activity>) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(activity)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Activity;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteActivity(id: number) {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Bookings
  static async getBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false });
      
      if (error) throw error;
      return {
        data: data as Booking[],
        count: data?.length || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getBooking(id: number) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          activity:activities(*),
          monitor:monitors(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Booking & {
        client: Client;
        activity: Activity;
        monitor: Monitor;
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) throw error;
      return data as Booking;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateBooking(id: number, booking: Partial<Booking>) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(booking)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Booking;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteBooking(id: number) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Invoices
  static async getInvoices(options: {
    page: number;
    limit: number;
    filters?: { search?: string; status?: string };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) {
    try {
      const { page, limit, filters, sort } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
  
      // ------------------------------------------------------------
      // 1) SELECT INICIAL:
      //    - "*" selecciona todas las columnas de invoices.
      //    - "c:clients()" embebe la relación clients como alias "c" (vacío),
      //       para poder filtrar sobre c.name más abajo.
      //    - "clients(name)" embebe el campo real 'name' de clients para devolverlo.
      //    - "items:invoice_items(*)" embebe todos los campos de invoice_items.
      //    { count: 'exact' } pide el conteo total antes de la paginación.
      // ------------------------------------------------------------
      let query = supabase
        .from('invoices')
        .select(
          `
            *,
            c:clients(),       
            clients(name),     
            items:invoice_items(*)
          `,
          { count: 'exact' }
        ); // 
  
      // ------------------------------------------------------------
      // 2) FILTRO DE BÚSQUEDA:
      //    Si filters.search existe, construimos "%texto%" para ILIKE y luego:
      //      a) Filtramos sobre el alias "c" con c.name.ilike.%...%,
      //      b) Aplicamos OR a nivel de invoices entre "c.not.is.null" y "number.ilike.%...%"
      // ------------------------------------------------------------
      if (filters?.search) {
        const termino = `%${filters.search}%`; // comodín % para ILIKE 
  
        // 2a) Filtramos clientes (alias c) por nombre:
        query = query.filter('c.name', 'ilike', termino); 
        //    Esto genera: c.name=ilike.%...% en la URL. 
  
        // 2b) Ahora combinamos OR entre:
        //     • c.not.is.null → los invoices cuyo alias c (clients) coincidió con el filtro anterior.
        //     • number.ilike.%...% → aquellos cuyo número de factura coincida.
        query = query.or(`c.not.is.null,number.ilike.${termino}`);
        //    Esto genera: or=(c.not.is.null,number.ilike.%...%) en la URL. 
      }
  
      // ------------------------------------------------------------
      // 3) FILTRO POR ESTADO (AND implícito):
      //    Si filters.status existe, encadenamos .eq('status', ...)
      // ------------------------------------------------------------
      if (filters?.status) {
        query = query.eq('status', filters.status); // 
      }
  
      // ------------------------------------------------------------
      // 4) ORDEN:
      //    Si sort está definido, ordenamos por ese campo; 
      //    si no, por "date DESC" por defecto.
      // ------------------------------------------------------------
      if (sort) {
        query = query.order(sort.field, {
          ascending: sort.direction === 'asc'
        }); // 
      } else {
        query = query.order('date', { ascending: false }); // 
      }
  
      // ------------------------------------------------------------
      // 5) PAGINACIÓN:
      //    Aplicamos range(from, to) para devolver solo la página solicitada.
      // ------------------------------------------------------------
      query = query.range(from, to); // 
  
      // ------------------------------------------------------------
      // 6) EJECUCIÓN:
      //    Ejecutamos la consulta y devolvemos data + count.
      // ------------------------------------------------------------
      const { data, error, count } = await query;
      if (error) throw error;
  
      return {
        data: data as (Invoice & { clients: { name: string }; items: InvoiceItem[] })[],
        count
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  

  static async getInvoice(id: number) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Invoice & {
        client: Client;
        items: InvoiceItem[];
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) throw itemsError;

      return this.getInvoice(invoiceData.id);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateInvoice(id: number, invoice: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'created_at'>[]) {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
        
        if (deleteError) throw deleteError;

        // Insert new items without the id field
        const itemsWithInvoiceId = items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          invoice_id: id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);
        
        if (itemsError) throw itemsError;
      }

      return this.getInvoice(id);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteInvoice(id: number) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Settings
  static async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as Settings;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateSettings(settings: Partial<Settings>) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', 1)
        .select()
        .single();
      
      if (error) throw error;
      return data as Settings;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Monitors
  static async getMonitors(options?: {
    page?: number;
    limit?: number;
    filters?: { search?: string; active?: boolean };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) {
    try {
      const { page, limit, filters, sort } = options || {};
      let query = supabase
        .from('monitors')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(
          `name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},specialty.ilike.${searchTerm}`
        );
      }

      // Apply active filter if provided
      if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }

      // Apply pagination if provided
      if (page && limit) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return {
        data: data as Monitor[],
        count
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getMonitor(id: number) {
    try {
      const { data, error } = await supabase
        .from('monitors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Monitor;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createMonitor(monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('monitors')
        .insert(monitor)
        .select()
        .single();
      
      if (error) throw error;
      return data as Monitor;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateMonitor(id: number, monitor: Partial<Monitor>) {
    try {
      const { data, error } = await supabase
        .from('monitors')
        .update(monitor)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Monitor;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteMonitor(id: number) {
    try {
      const { error } = await supabase
        .from('monitors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Expenses
  static async getExpenses(options?: {
    page?: number;
    limit?: number;
    filters?: { search?: string; category?: string };
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) {
    try {
      const { page, limit, filters, sort } = options || {};
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' });

      // Apply search filter if provided
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(
          `description.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      // Apply category filter if provided
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('date', { ascending: false });
      }

      // Apply pagination if provided
      if (page && limit) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return {
        data: data as Expense[],
        count
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getExpense(id: number) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Expense;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateExpense(id: number, expense: Partial<Expense>) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteExpense(id: number) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Payrolls
  static async getPayrolls({
    page = 1,
    limit = LIMIT,
    filters,
    sort
  }: {
    page?: number;
    limit?: number;
    filters?: {
      search?: string;
      status?: 'paid' | 'pending';
    };
    sort?: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }) {
    try {
      let query = supabase
        .from('payrolls')
        .select(`
          *,
          monitors(name)
        `, { count: 'exact' });

      // Apply search filter if provided
      if (filters?.search) {
        const termino = `%${filters.search}%`;
        query = query.filter('monitors.name', 'ilike', termino);
        let orParts = ['monitors.not.is.null'];
        if (!isNaN(Number(filters.search))) {
          orParts.push(`year.eq.${filters.search}`);
          orParts.push(`month.eq.${filters.search}`);
        }
        query = query.or(orParts.join(','));
      }

      // Apply status filter if provided
      if (filters?.status) {
        query = query.eq('paid', filters.status === 'paid');
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('year', { ascending: false })
          .order('month', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      return {
        data: data as (Payroll & { monitors: { name: string } })[],
        count: count || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getPayroll(id: number) {
    try {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          monitors(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Payroll & { monitors: { name: string } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createPayroll(payroll: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Remove monitors from the create data as it's a relation
      const { monitors, ...createData } = payroll;
      
      const { data, error } = await supabase
        .from('payrolls')
        .insert(createData)
        .select(`
          *,
          monitors(name)
        `)
        .single();
      
      if (error) throw error;
      return data as Payroll & { monitors: { name: string } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updatePayroll(id: number, payroll: Partial<Payroll>) {
    try {
      // Remove monitors from the update data as it's a relation
      const { monitors, ...updateData } = payroll;
      
      const { data, error } = await supabase
        .from('payrolls')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          monitors(name)
        `)
        .single();
      
      if (error) throw error;
      return data as Payroll & { monitors: { name: string } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deletePayroll(id: number) {
    try {
      const { error } = await supabase
        .from('payrolls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getLastInvoiceNumber() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('number')
        .order('number', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data?.number || 0;
    } catch (error) {
      return this.handleError(error);
    }
  }
} 