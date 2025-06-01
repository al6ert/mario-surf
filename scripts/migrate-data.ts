import { ApiClient } from '../lib/api';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Expense, Payroll, Settings } from '../lib/supabase';

// Load data from localStorage
function loadLocalData() {
  const savedData = localStorage.getItem('sgta-data');
  if (!savedData) {
    throw new Error('No data found in localStorage');
  }
  return JSON.parse(savedData);
}

// Migrate data to Supabase
async function migrateData() {
  try {
    console.log('Starting data migration...');
    const data = loadLocalData();

    // Migrate clients
    console.log('Migrating clients...');
    for (const client of data.clients) {
      await ApiClient.createClient({
        name: client.name,
        email: client.email,
        phone: client.phone,
        dni: client.dni || '',
        address: client.address || '',
        notes: client.notes || ''
      });
    }

    // Migrate activities
    console.log('Migrating activities...');
    for (const activity of data.activities) {
      await ApiClient.createActivity({
        name: activity.name,
        description: activity.description || '',
        duration: activity.duration,
        price: activity.price,
        max_participants: activity.maxParticipants,
        type: activity.type || 'surf'
      });
    }

    // Migrate monitors
    console.log('Migrating monitors...');
    for (const monitor of data.monitors) {
      await ApiClient.createMonitor({
        name: monitor.name,
        email: monitor.email,
        phone: monitor.phone,
        specialty: monitor.specialty || 'surf',
        active: monitor.active ?? true
      });
    }

    // Migrate bookings
    console.log('Migrating bookings...');
    for (const booking of data.bookings) {
      await ApiClient.createBooking({
        client_id: booking.clientId,
        activity_id: booking.activityId,
        monitor_id: booking.monitorId,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        notes: booking.notes || ''
      });
    }

    // Migrate invoices
    console.log('Migrating invoices...');
    for (const invoice of data.invoices) {
      await ApiClient.createInvoice(
        {
          number: invoice.number,
          client_id: invoice.clientId,
          date: invoice.date,
          status: invoice.status,
          notes: invoice.notes || ''
        },
        invoice.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      );
    }

    // Migrate expenses
    console.log('Migrating expenses...');
    for (const expense of data.expenses) {
      await ApiClient.createExpense({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        notes: expense.notes || ''
      });
    }

    // Migrate payrolls
    console.log('Migrating payrolls...');
    for (const payroll of data.payrolls) {
      await ApiClient.createPayroll({
        monitor_id: payroll.monitorId,
        month: payroll.month,
        year: payroll.year,
        hours: payroll.hours,
        hourly_rate: payroll.hourlyRate,
        bonus: payroll.bonus || 0,
        deductions: payroll.deductions || 0,
        notes: payroll.notes || '',
        paid: payroll.paid
      });
    }

    // Migrate settings
    console.log('Migrating settings...');
    await ApiClient.updateSettings({
      invoice_prefix: data.settings.invoicePrefix,
      invoice_sequence: data.settings.invoiceSequence,
      iva_percentage: data.settings.ivaPercentage,
      company_name: data.settings.companyName,
      company_address: data.settings.companyAddress,
      company_phone: data.settings.companyPhone,
      company_email: data.settings.companyEmail
    });

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
  }
}

// Run migration
migrateData().catch(console.error); 