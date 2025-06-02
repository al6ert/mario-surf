import React, { useEffect, useState } from 'react';
import { loadData, getState, subscribe, createClient, updateClient, deleteClient, createActivity, updateActivity, deleteActivity, createBooking, updateBooking, deleteBooking, createInvoice, updateInvoice, deleteInvoice, createMonitor, updateMonitor, deleteMonitor, updateSettings } from '../lib/data';
import type { Client, Activity, Monitor, Booking, Invoice, InvoiceItem, Settings } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDashboard, faCalendar, faBook, faBicycle, faUsers, faFileText, faMoneyBill, faUserSecret, faEuro, faBarChart, faCog } from '@fortawesome/free-solid-svg-icons';
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

export default function App() {
  const [state, setState] = useState(getState());
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

  useEffect(() => {
    // Load initial data
    loadData();

    // Subscribe to state changes
    const unsubscribe = subscribe(setState);
    return () => unsubscribe();
  }, []);

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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col py-8 px-4">
        <div className="text-2xl font-bold mb-8 tracking-wide">SGTA</div>
        <nav className="flex-1 space-y-1">
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('dashboard')}>
            <FontAwesomeIcon icon={faDashboard} /> Dashboard
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'calendar' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('calendar')}>
            <FontAwesomeIcon icon={faCalendar} /> Calendario
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'bookings' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('bookings')}>
            <FontAwesomeIcon icon={faBook} /> Reservas
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'activities' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('activities')}>
            <FontAwesomeIcon icon={faBicycle} /> Actividades
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'clients' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('clients')}>
            <FontAwesomeIcon icon={faUsers} /> Clientes
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'invoices' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('invoices')}>
            <FontAwesomeIcon icon={faFileText} /> Facturación
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'expenses' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('expenses')}>
            <FontAwesomeIcon icon={faMoneyBill} /> Gastos
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'monitors' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('monitors')}>
            <FontAwesomeIcon icon={faUserSecret} /> Monitores
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'payroll' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('payroll')}>
            <FontAwesomeIcon icon={faEuro} /> Nóminas
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('reports')}>
            <FontAwesomeIcon icon={faBarChart} /> Informes
          </button>
          <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-left ${activeSection === 'setup' ? 'bg-blue-600' : 'hover:bg-slate-700'}`} onClick={() => handleSectionChange('setup')}>
            <FontAwesomeIcon icon={faCog} /> Configuración
          </button>
        </nav>
      </aside>

      {/* Main content */}
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
          <Monitors monitors={state.monitors} onRefresh={loadData} />
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