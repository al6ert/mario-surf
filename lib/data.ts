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
export async function loadData() {
  try {
    setState({ loading: true, error: null });

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
      ApiClient.getClients(),
      ApiClient.getActivities(),
      ApiClient.getMonitors(),
      ApiClient.getBookings(),
      ApiClient.getInvoices(),
      ApiClient.getExpenses(),
      ApiClient.getPayrolls(),
      ApiClient.getSettings()
    ]);

    setState({
      clients: clients || [],
      activities: activities || [],
      monitors: monitors || [],
      bookings: bookings || [],
      invoices: invoices || [],
      expenses: expenses || [],
      payrolls: payrolls || [],
      settings: settings || {} as Settings,
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while loading data'
    });
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
  await loadData();
  return newInvoice;
};

export async function updateInvoice(id: number, invoice: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'created_at'>[]) {
  try {
    setState({ loading: true, error: null });
    const updatedInvoice = await ApiClient.updateInvoice(id, invoice, items);
    if (!updatedInvoice) throw new Error('Failed to update invoice');
    setState({
      invoices: state.invoices.map(i => i.id === id ? updatedInvoice : i),
      loading: false
    });
    return updatedInvoice;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating invoice'
    });
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

// Expense operations
export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newExpense = await ApiClient.createExpense(expense);
    if (!newExpense) throw new Error('Failed to create expense');
    setState({
      expenses: [...state.expenses, newExpense],
      loading: false
    });
    return newExpense;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating expense'
    });
    throw error;
  }
}

export async function updateExpense(id: number, expense: Partial<Expense>) {
  try {
    setState({ loading: true, error: null });
    const updatedExpense = await ApiClient.updateExpense(id, expense);
    if (!updatedExpense) throw new Error('Failed to update expense');
    setState({
      expenses: state.expenses.map(e => e.id === id ? updatedExpense : e),
      loading: false
    });
    return updatedExpense;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating expense'
    });
    throw error;
  }
}

export async function deleteExpense(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteExpense(id);
    setState({
      expenses: state.expenses.filter(e => e.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting expense'
    });
    throw error;
  }
}

// Monitor operations
export async function createMonitor(monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) {
  try {
    setState({ loading: true, error: null });
    const newMonitor = await ApiClient.createMonitor(monitor);
    if (!newMonitor) throw new Error('Failed to create monitor');
    setState({
      monitors: [...state.monitors, newMonitor],
      loading: false
    });
    return newMonitor;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating monitor'
    });
    throw error;
  }
}

export async function updateMonitor(id: number, monitor: Partial<Monitor>) {
  try {
    setState({ loading: true, error: null });
    const updatedMonitor = await ApiClient.updateMonitor(id, monitor);
    if (!updatedMonitor) throw new Error('Failed to update monitor');
    setState({
      monitors: state.monitors.map(m => m.id === id ? updatedMonitor : m),
      loading: false
    });
    return updatedMonitor;
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating monitor'
    });
    throw error;
  }
}

export async function deleteMonitor(id: number) {
  try {
    setState({ loading: true, error: null });
    await ApiClient.deleteMonitor(id);
    setState({
      monitors: state.monitors.filter(m => m.id !== id),
      loading: false
    });
  } catch (error) {
    setState({
      loading: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting monitor'
    });
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