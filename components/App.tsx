import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { createClient, updateClient, createActivity, updateActivity, createMonitor, updateMonitor, createBooking, updateBooking, createInvoice, updateInvoice } from '../lib/data';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Settings } from '../lib/supabase';
import Calendar from './Calendar';
import Bookings from './Bookings';
import Activities from './Activities';
import Clients from './Clients';
import Invoices from './Invoices';
import Expenses from './Expenses';
import Monitors from './Monitors';
import Payrolls from './Payrolls';
import Setup from './Setup';
import Reports from './Reports';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import { AppProvider } from '../contexts/AppContext';

function AppContent() {
  const { state } = useAppContext();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>();
  const [showMonitorForm, setShowMonitorForm] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | undefined>();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [monitorSearch, setMonitorSearch] = useState('');

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Handle client form
  const handleShowClientForm = (client?: Client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  const handleHideClientForm = () => {
    setSelectedClient(undefined);
    setShowClientForm(false);
  };

  const handleClientSubmit = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
    } else {
      await createClient(clientData);
    }
  };

  // Handle activity form
  const handleShowActivityForm = (activity?: Activity) => {
    setSelectedActivity(activity);
    setShowActivityForm(true);
  };

  const handleHideActivityForm = () => {
    setSelectedActivity(undefined);
    setShowActivityForm(false);
  };

  const handleActivitySubmit = async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedActivity) {
      await updateActivity(selectedActivity.id, activityData);
    } else {
      await createActivity(activityData);
    }
  };

  // Handle monitor form
  const handleShowMonitorForm = (monitor?: Monitor) => {
    setSelectedMonitor(monitor);
    setShowMonitorForm(true);
  };

  const handleHideMonitorForm = () => {
    setSelectedMonitor(undefined);
    setShowMonitorForm(false);
  };

  const handleMonitorSubmit = async (monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedMonitor) {
      await updateMonitor(selectedMonitor.id, monitorData);
    } else {
      await createMonitor(monitorData);
    }
    handleHideMonitorForm();
  };

  // Handle booking form
  const handleShowBookingForm = (booking?: Booking) => {
    setSelectedBooking(booking);
    setShowBookingForm(true);
  };

  const handleHideBookingForm = () => {
    setSelectedBooking(undefined);
    setShowBookingForm(false);
  };

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedBooking) {
      await updateBooking(selectedBooking.id, bookingData);
    } else {
      await createBooking(bookingData);
    }
  };

  const handleShowInvoiceForm = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setShowInvoiceForm(true);
  };

  const handleHideInvoiceForm = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(false);
  };

  const handleInvoiceSubmit = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at'>[]) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData, items);
    } else {
      await createInvoice(invoiceData, items);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-lg font-semibold">{state.error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="flex-1 p-8">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <Dashboard
            bookings={state.bookings}
            activities={state.activities}
            monitors={state.monitors}
            clients={state.clients}
            invoices={state.invoices}
            settings={state.settings}
          />
        )}
        {/* Calendario */}
        {activeSection === 'calendar' && (
          <Calendar
            bookings={state.bookings}
            clients={state.clients}
            activities={state.activities}
            monitors={state.monitors}
          />
        )}
        {/* Reservas */}
        {activeSection === 'bookings' && (
          <Bookings />
        )}
        {/* Actividades */}
        {activeSection === 'activities' && (
          <Activities />
        )}
        {/* Clientes */}
        {activeSection === 'clients' && (
          <Clients />
        )}
        {/* Facturación */}
        {activeSection === 'invoices' && (
          <Invoices />
        )}
        {/* Gastos */}
        {activeSection === 'expenses' && (
          <Expenses />
        )}
        {/* Monitores */}
        {activeSection === 'monitors' && (
          <Monitors />
        )}
        {/* Nóminas */}
        {activeSection === 'payroll' && (
          <Payrolls />
        )}
        {/* Informes */}
        {activeSection === 'reports' && (
          <Reports />
        )}
        {/* Configuración */}
        {activeSection === 'setup' && (
          <Setup />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
} 