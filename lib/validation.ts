import { z } from 'zod';

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  dni: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// Activity validation
export const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.number().positive('Duration must be positive').optional(),
  price: z.number().positive('Price must be positive'),
  max_participants: z.number().int().positive('Max participants must be positive').optional(),
  type: z.string().min(1, 'Type is required'),
});

// Monitor validation
export const monitorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  active: z.boolean().default(true),
});

// Booking validation
export const bookingSchema = z.object({
  client_id: z.number().int().positive('Client ID is required'),
  activity_id: z.number().int().positive('Activity ID is required'),
  monitor_id: z.number().int().positive('Monitor ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  notes: z.string().optional(),
});

// Invoice validation
export const invoiceSchema = z.object({
  number: z.string().min(1, 'Invoice number is required'),
  client_id: z.number().int().positive('Client ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  status: z.enum(['paid', 'pending']),
  notes: z.string().optional(),
});

// Invoice Item validation
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

// Expense validation
export const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  category: z.enum(['supplies', 'equipment', 'salaries', 'maintenance', 'other']),
  notes: z.string().optional(),
});

// Payroll validation
export const payrollSchema = z.object({
  monitor_id: z.number().int().positive('Monitor ID is required'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().positive(),
  hours: z.number().positive('Hours must be positive'),
  hourly_rate: z.number().positive('Hourly rate must be positive'),
  bonus: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  notes: z.string().optional(),
  paid: z.boolean().default(false),
});

// Settings validation
export const settingsSchema = z.object({
  invoice_prefix: z.string().min(1, 'Invoice prefix is required'),
  invoice_sequence: z.number().int().positive('Invoice sequence must be positive'),
  iva_percentage: z.number().min(0).max(100),
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.string().email('Invalid email address').optional(),
}); 