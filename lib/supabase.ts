/* lib/supabase.ts */
import { createClient } from '../utils/supabase/client'

export const supabase = createClient()

// Type definitions for our database tables
export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  price: number;
  max_participants?: number;
  type: string;
  created_at: string;
  updated_at: string;
};

export type Monitor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: number;
  client_id: number;
  activity_id: number;
  monitor_id: number;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: number;
  number: string;
  client_id: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  iva_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
};

export type InvoiceItem = {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: 'supplies' | 'equipment' | 'salaries' | 'maintenance' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Payroll = {
  id: number;
  monitor_id: number;
  hours_worked: number;
  hourly_rate: number;
  bonus: number;
  deductions: number;
  date: string;
  year: number;
  month: number;
  paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  monitors?: {
    name: string;
  };
};

export type Settings = {
  id: number;
  invoice_prefix: string;
  invoice_sequence: number;
  iva_percentage: number;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  created_at: string;
  updated_at: string;
};

export type AppState = {
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