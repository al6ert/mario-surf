import { ApiClient } from './api';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Expense, Payroll, Settings } from './supabase';

// Define the state type
type AppState = {
  bookings: Booking[];
  activities: Activity[];
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  monitors: Monitor[];
  payrolls: Payroll[];
  settings: Settings;
  loading: boolean;
  error: string | null;
};

// State management
let state: AppState = {
  bookings: [],
  activities: [],
  clients: [],
  invoices: [],
  expenses: [],
  monitors: [],
  payrolls: [],
  settings: {} as Settings,
  loading: false,
  error: null,
};

// Event listeners for state changes
const listeners: ((state: AppState) => void)[] = [];

// Subscribe to state changes
export function subscribe(listener: (state: AppState) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

// Notify all listeners of state changes
function notifyListeners() {
  listeners.forEach(listener => listener(state));
}

// Update state and notify listeners
function setState(updates: Partial<AppState>) {
  state = { ...state, ...updates };
  notifyListeners();
}

// Load all data from Supabase
export async function loadData(): Promise<AppState> {
  try {
    // Solo actualizar loading si no está ya cargando
    if (!state.loading) {
      setState({ ...state, loading: true, error: null });
    }

    const [
      clients,
      activities,
      monitors,
      bookings,
      invoices,
      expenses,
      payrolls,
      settings
    ] = await Promise.all([
      ApiClient.getClients({ page: 1, limit: 100 }),
      ApiClient.getActivities(),
      ApiClient.getMonitors(),
      ApiClient.getBookings(),
      ApiClient.getInvoices({ page: 1, limit: 100 }),
      ApiClient.getExpenses(),
      ApiClient.getPayrolls({ page: 1, limit: 100 }),
      ApiClient.getSettings()
    ]);

    const newState: AppState = {
      clients: (clients as { data: Client[] })?.data || [],
      activities: (activities as { data: Activity[] })?.data || [],
      monitors: (monitors as { data: Monitor[] })?.data || [],
      bookings: bookings || [],
      invoices: (invoices as { data: Invoice[] })?.data || [],
      expenses: (expenses as { data: Expense[] })?.data || [],
      payrolls: (payrolls as { data: Payroll[] })?.data || [],
      settings: settings || {} as Settings,
      loading: false,
      error: null
    };

    // Actualizar estado una sola vez con todos los datos
    setState(newState);
    return newState;
  } catch (error) {
    const errorState = {
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while loading data'
    };
    setState({ ...state, ...errorState });
    return { ...state, ...errorState };
  }
}

// Client operations
export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newClient = await ApiClient.createClient(client);
    if (!newClient) throw new Error('Failed to create client');
    setState({
      clients: [...state.clients, newClient],
      loading: false
    });
    return newClient;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating client'
    });
    throw error;
  }
}

export async function updateClient(id: number, client: Partial<Client>) {
  try {
    setState({ loading: true, error: null });
    const updatedClient = await ApiClient.updateClient(id, client);
    if (!updatedClient) throw new Error('Failed to update client');
    setState({
      clients: state.clients.map(c => c.id === id ? updatedClient : c),
      loading: false
    });
    return updatedClient;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating client'
    });
    throw error;
  }
}

export async function deleteClient(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteClient(id);
    setState({
      clients: state.clients.filter(c => c.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting client'
    });
    throw error;
  }
}

// Activity operations
export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newActivity = await ApiClient.createActivity(activity);
    if (!newActivity) throw new Error('Failed to create activity');
    setState({
      activities: [...state.activities, newActivity],
      loading: false
    });
    return newActivity;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating activity'
    });
    throw error;
  }
}

export async function updateActivity(id: number, activity: Partial<Activity>) {
  try {
    setState({ loading: true, error: null });
    const updatedActivity = await ApiClient.updateActivity(id, activity);
    if (!updatedActivity) throw new Error('Failed to update activity');
    setState({
      activities: state.activities.map(a => a.id === id ? updatedActivity : a),
      loading: false
    });
    return updatedActivity;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating activity'
    });
    throw error;
  }
}

export async function deleteActivity(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteActivity(id);
    setState({
      activities: state.activities.filter(a => a.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting activity'
    });
    throw error;
  }
}

// Booking operations
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newBooking = await ApiClient.createBooking(booking);
    if (!newBooking) throw new Error('Failed to create booking');
    setState({
      bookings: [...state.bookings, newBooking],
      loading: false
    });
    return newBooking;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating booking'
    });
    throw error;
  }
}

export async function updateBooking(id: number, booking: Partial<Booking>) {
  try {
    setState({ loading: true, error: null });
    const updatedBooking = await ApiClient.updateBooking(id, booking);
    if (!updatedBooking) throw new Error('Failed to update booking');
    setState({
      bookings: state.bookings.map(b => b.id === id ? updatedBooking : b),
      loading: false
    });
    return updatedBooking;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating booking'
    });
    throw error;
  }
}

export async function deleteBooking(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteBooking(id);
    setState({
      bookings: state.bookings.filter(b => b.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting booking'
    });
    throw error;
  }
}

// Invoice operations
export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => {
  const state = getState();
  const ivaPercentage = state.settings.iva_percentage || 21;
  const invoiceWithIva = { ...invoiceData, iva_percentage: ivaPercentage };
  const newInvoice = await ApiClient.createInvoice(invoiceWithIva, items);
  if (!newInvoice) throw new Error('Failed to create invoice');
  return newInvoice;
};

export async function updateInvoice(id: number, invoice: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'created_at'>[]) {
  try {
    const updatedInvoice = await ApiClient.updateInvoice(id, invoice, items);
    if (!updatedInvoice) throw new Error('Failed to update invoice');
    return updatedInvoice;
  } catch (error) {
    throw error;
  }
}

export async function deleteInvoice(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteInvoice(id);
    setState({
      invoices: state.invoices.filter(i => i.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting invoice'
    });
    throw error;
  }
}

// Settings operations
export async function updateSettings(settings: Partial<Settings>) {
  try {
    setState({ loading: true, error: null });
    const updatedSettings = await ApiClient.updateSettings(settings);
    if (!updatedSettings) throw new Error('Failed to update settings');
    setState({
      settings: updatedSettings,
      loading: false
    });
    return updatedSettings;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating settings'
    });
    throw error;
  }
}

// Expenses
export const getExpenses = async (options?: {
  page?: number;
  limit?: number;
  filters?: { search?: string; category?: string };
  sort?: { field: string; direction: 'asc' | 'desc' };
}) => {
  try {
    const result = await ApiClient.getExpenses(options);
    return result;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id'>) => {
  try {
    const result = await ApiClient.createExpense(expense);
    return result;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: number, expense: Partial<Expense>) => {
  try {
    const result = await ApiClient.updateExpense(id, expense);
    return result;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: number) => {
  try {
    const result = await ApiClient.deleteExpense(id);
    return result;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Monitor operations
export async function createMonitor(monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const newMonitor = await ApiClient.createMonitor(monitor);
    if (!newMonitor) throw new Error('Failed to create monitor');
    return newMonitor;
  } catch (error) {
    throw error;
  }
}

export async function updateMonitor(id: number, monitor: Partial<Monitor>) {
  try {
    const updatedMonitor = await ApiClient.updateMonitor(id, monitor);
    if (!updatedMonitor) throw new Error('Failed to update monitor');
    return updatedMonitor;
  } catch (error) {
    throw error;
  }
}

export async function deleteMonitor(id: number) {
  try {
    await ApiClient.deleteMonitor(id);
    return true;
  } catch (error) {
    throw error;
  }
}

// Payroll operations
export async function createPayroll(payroll: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newPayroll = await ApiClient.createPayroll(payroll);
    if (!newPayroll) throw new Error('Failed to create payroll');
    setState({
      payrolls: [...state.payrolls, newPayroll],
      loading: false
    });
    return newPayroll;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating payroll'
    });
    throw error;
  }
}

export async function updatePayroll(id: number, payroll: Partial<Payroll>) {
  try {
    setState({ loading: true, error: null });
    const updatedPayroll = await ApiClient.updatePayroll(id, payroll);
    if (!updatedPayroll) throw new Error('Failed to update payroll');
    setState({
      payrolls: state.payrolls.map(p => p.id === id ? updatedPayroll : p),
      loading: false
    });
    return updatedPayroll;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating payroll'
    });
    throw error;
  }
}

export async function deletePayroll(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deletePayroll(id);
    setState({
      payrolls: state.payrolls.filter(p => p.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting payroll'
    });
    throw error;
  }
}

// Get current state
export function getState(): AppState {
  return state;
}

// Generador de número de factura
export function generateNextInvoiceNumber(lastNumber: string | null, prefix: string, year: number): string {
  let nextSeq = 1;
  if (lastNumber) {
    // Formato con año: FAC-2025-0001
    const matchWithYear = lastNumber.match(/^(\w+)-(\d{4})-(\d+)$/);
    // Formato sin año: INV-001
    const matchNoYear = lastNumber.match(/^(\w+)-(\d+)$/);

    if (matchWithYear) {
      const lastYear = parseInt(matchWithYear[2], 10);
      const lastSeq = parseInt(matchWithYear[3], 10);
      if (lastYear === year) {
        nextSeq = lastSeq + 1;
      } else {
        nextSeq = 1;
      }
    } else if (matchNoYear) {
      const lastSeq = parseInt(matchNoYear[2], 10);
      nextSeq = lastSeq + 1;
      if (year > 0) {
        return `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
      } else {
        return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
      }
    }
  }
  if (prefix && year) {
    return `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
  } else if (prefix) {
    return `${prefix}-${String(nextSeq).padStart(3, '0')}`;
  }
  return String(nextSeq);
} 